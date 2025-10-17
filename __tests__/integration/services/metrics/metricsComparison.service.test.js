const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');

// Mock all dependencies before imports
jest.mock('../../../../src/utils/logger/logger', () => ({
    log: jest.fn(),
    warn: jest.fn(),
}));

jest.mock('mathjs', () => ({
    evaluate: jest.fn((operation, scope) => {
        // Simple mock implementation for division
        const keys = Object.keys(scope);
        if (keys.length === 2) {
            return scope[keys[0]] / scope[keys[1]];
        }
        return 0;
    }),
}));

// Mock DAOs
jest.mock('../../../../src/models/postgres/metrics/kpi.operational.dao');
jest.mock('../../../../src/models/postgres/metrics/dimension.dao');
jest.mock('../../../../src/models/postgres/insight/insight.dao');
jest.mock('../../../../src/models/postgres/metric_status/metric_status.dao');

// Mock Polaris models
jest.mock('../../../../src/models/polaris/common/common.model');
jest.mock('../../../../src/models/polaris/metric_compare/metrics_compare.model');
jest.mock('../../../../src/models/polaris/metric/metric.model');

// Import mocked modules
const logger = require('../../../../src/utils/logger/logger');
const metricsDao = require('../../../../src/models/postgres/metrics/kpi.operational.dao');
const dimensionsDao = require('../../../../src/models/postgres/metrics/dimension.dao');
const { polarisQueryCall } = require('../../../../src/models/polaris/common/common.model');
const {
    get_metrics_comparison_query,
    get_metric_dimensions_breakup_query,
    get_sort_order_for_dimensions_breakup,
} = require('../../../../src/models/polaris/metric_compare/metrics_compare.model');
const { get_last_data_ts_query } = require('../../../../src/models/polaris/metric/metric.model');

// Import service under test
const MetricsComparisonService = require('../../../../src/services/metrics/metricsComparison.service');

describe('MetricsComparisonService Integration Tests', () => {
    const TEST_TENANT_ID = 'test-tenant-001';
    const TEST_KPI_ID = 'kpi-001';
    const TEST_DIMENSION_ID = 'dim-001';

    beforeEach(() => {
        jest.clearAllMocks();
        // Suppress console.log in tests
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    describe('getMetricsComparisonData - Simple Metrics', () => {
        describe('Successful Query Execution', () => {
            it('should successfully fetch and process dimension breakup for simple metric', async () => {
                // Setup: Mock KPI data (non-ratio metric)
                const mockKpi = {
                    id: TEST_KPI_ID,
                    kpi_name: 'revenue',
                    type: 'simple',
                    kpi_format: 'currency',
                    metric_source_id: 'source-001',
                    metric_category: 'revenue',
                };

                // Setup: Mock dimension data
                const mockDimension = {
                    id: TEST_DIMENSION_ID,
                    name: 'country',
                    display_name: 'Country',
                };

                // Setup: Mock Polaris responses
                const mockDimensionBreakupData = [
                    {
                        __time: '2025-01-01T00:00:00Z',
                        dim_val: 'USA',
                        sum_kpi: 1000,
                    },
                    {
                        __time: '2025-01-01T00:00:00Z',
                        dim_val: 'Canada',
                        sum_kpi: 500,
                    },
                ];

                const mockSortOrderData = [
                    { dim_name: 'USA', sort_order: 1 },
                    { dim_name: 'Canada', sort_order: 2 },
                ];

                // Mock DAO calls
                metricsDao.getMetricById.mockResolvedValue(mockKpi);
                dimensionsDao.getDimensionById.mockResolvedValue(mockDimension);

                // Mock Polaris query builders
                get_metric_dimensions_breakup_query.mockReturnValue('SELECT * FROM dimensions_breakup');
                get_sort_order_for_dimensions_breakup.mockReturnValue('SELECT * FROM sort_order');

                // Mock Polaris query execution
                polarisQueryCall
                    .mockResolvedValueOnce({
                        status: 200,
                        success: true,
                        data: mockDimensionBreakupData,
                    })
                    .mockResolvedValueOnce({
                        status: 200,
                        success: true,
                        data: mockSortOrderData,
                    });

                // Execute
                const result = await MetricsComparisonService.getMetricsComparisonData({
                    kpis: TEST_KPI_ID,
                    start_time: '2025-01-01T00:00:00Z',
                    end_time: '2025-01-07T00:00:00Z',
                    tenant_id: TEST_TENANT_ID,
                    pipeline_schedule: 'd',
                    dimension_id: TEST_DIMENSION_ID,
                    dim_name: null,
                    dim_val: null,
                });

                // Verify
                expect(result).toBeDefined();
                expect(result).toBeInstanceOf(Array);
                expect(result).toHaveLength(1);
                expect(result[0]).toHaveProperty('timestamp', '2025-01-01T00:00:00Z');
                expect(result[0]).toHaveProperty('results');
                expect(result[0].results).toHaveLength(2);

                // Verify DAO calls
                expect(metricsDao.getMetricById).toHaveBeenCalledWith(
                    TEST_KPI_ID,
                    TEST_TENANT_ID,
                    expect.any(String)
                );
                expect(dimensionsDao.getDimensionById).toHaveBeenCalledWith(TEST_DIMENSION_ID);

                // Verify Polaris calls
                expect(polarisQueryCall).toHaveBeenCalledTimes(2);
            });

            it('should handle multiple timestamps correctly', async () => {
                const mockKpi = {
                    id: TEST_KPI_ID,
                    kpi_name: 'revenue',
                    type: 'simple',
                    kpi_format: 'currency',
                    metric_source_id: 'source-001',
                    metric_category: 'revenue',
                };

                const mockDimension = {
                    id: TEST_DIMENSION_ID,
                    name: 'country',
                };

                const mockDimensionBreakupData = [
                    {
                        __time: '2025-01-01T00:00:00Z',
                        dim_val: 'USA',
                        sum_kpi: 1000,
                    },
                    {
                        __time: '2025-01-02T00:00:00Z',
                        dim_val: 'USA',
                        sum_kpi: 1500,
                    },
                    {
                        __time: '2025-01-03T00:00:00Z',
                        dim_val: 'USA',
                        sum_kpi: 1200,
                    },
                ];

                const mockSortOrderData = [{ dim_name: 'USA', sort_order: 1 }];

                metricsDao.getMetricById.mockResolvedValue(mockKpi);
                dimensionsDao.getDimensionById.mockResolvedValue(mockDimension);
                get_metric_dimensions_breakup_query.mockReturnValue('SELECT * FROM dimensions_breakup');
                get_sort_order_for_dimensions_breakup.mockReturnValue('SELECT * FROM sort_order');

                polarisQueryCall
                    .mockResolvedValueOnce({
                        status: 200,
                        success: true,
                        data: mockDimensionBreakupData,
                    })
                    .mockResolvedValueOnce({
                        status: 200,
                        success: true,
                        data: mockSortOrderData,
                    });

                const result = await MetricsComparisonService.getMetricsComparisonData({
                    kpis: TEST_KPI_ID,
                    start_time: '2025-01-01T00:00:00Z',
                    end_time: '2025-01-03T00:00:00Z',
                    tenant_id: TEST_TENANT_ID,
                    pipeline_schedule: 'd',
                    dimension_id: TEST_DIMENSION_ID,
                    dim_name: null,
                    dim_val: null,
                });

                expect(result).toHaveLength(3);
                expect(result[0].timestamp).toBe('2025-01-01T00:00:00Z');
                expect(result[1].timestamp).toBe('2025-01-02T00:00:00Z');
                expect(result[2].timestamp).toBe('2025-01-03T00:00:00Z');
            });
        });

        describe('404 Fallback Logic', () => {
            it('should retry with fallback query when initial query returns 404', async () => {
                const mockKpi = {
                    id: TEST_KPI_ID,
                    kpi_name: 'revenue',
                    type: 'simple',
                    kpi_format: 'currency',
                    metric_source_id: 'source-001',
                    metric_category: 'revenue',
                };

                const mockDimension = {
                    id: TEST_DIMENSION_ID,
                    name: 'country',
                };

                const mockDimensionBreakupData = [
                    {
                        __time: '2025-01-01T00:00:00Z',
                        dim_val: 'USA',
                        sum_kpi: 1000,
                    },
                ];

                const mockSortOrderData = [{ dim_name: 'USA', sort_order: 1 }];

                metricsDao.getMetricById.mockResolvedValue(mockKpi);
                dimensionsDao.getDimensionById.mockResolvedValue(mockDimension);
                get_metric_dimensions_breakup_query.mockReturnValue('SELECT * FROM dimensions_breakup');
                get_sort_order_for_dimensions_breakup.mockReturnValue('SELECT * FROM sort_order');

                // First call fails with 404, second succeeds (fallback)
                polarisQueryCall
                    .mockResolvedValueOnce({
                        status: 404,
                        success: false,
                        data: [],
                    })
                    .mockResolvedValueOnce({
                        status: 200,
                        success: true,
                        data: mockDimensionBreakupData,
                    })
                    .mockResolvedValueOnce({
                        status: 404,
                        success: false,
                        data: [],
                    })
                    .mockResolvedValueOnce({
                        status: 200,
                        success: true,
                        data: mockSortOrderData,
                    });

                const result = await MetricsComparisonService.getMetricsComparisonData({
                    kpis: TEST_KPI_ID,
                    start_time: '2025-01-01T00:00:00Z',
                    end_time: '2025-01-07T00:00:00Z',
                    tenant_id: TEST_TENANT_ID,
                    pipeline_schedule: 'd',
                    dimension_id: TEST_DIMENSION_ID,
                    dim_name: null,
                    dim_val: null,
                });

                expect(result).toBeDefined();
                expect(polarisQueryCall).toHaveBeenCalledTimes(4); // 2 queries, each with fallback
                expect(logger.warn).toHaveBeenCalledTimes(2); // Warning logged for each fallback
            });

            it('should retry with fallback query when initial query returns 400', async () => {
                const mockKpi = {
                    id: TEST_KPI_ID,
                    kpi_name: 'revenue',
                    type: 'simple',
                    kpi_format: 'currency',
                    metric_source_id: 'source-001',
                    metric_category: 'revenue',
                };

                const mockDimension = {
                    id: TEST_DIMENSION_ID,
                    name: 'country',
                };

                const mockDimensionBreakupData = [
                    {
                        __time: '2025-01-01T00:00:00Z',
                        dim_val: 'USA',
                        sum_kpi: 1000,
                    },
                ];

                const mockSortOrderData = [{ dim_name: 'USA', sort_order: 1 }];

                metricsDao.getMetricById.mockResolvedValue(mockKpi);
                dimensionsDao.getDimensionById.mockResolvedValue(mockDimension);
                get_metric_dimensions_breakup_query.mockReturnValue('SELECT * FROM dimensions_breakup');
                get_sort_order_for_dimensions_breakup.mockReturnValue('SELECT * FROM sort_order');

                polarisQueryCall
                    .mockResolvedValueOnce({
                        status: 400,
                        success: false,
                        data: [],
                    })
                    .mockResolvedValueOnce({
                        status: 200,
                        success: true,
                        data: mockDimensionBreakupData,
                    })
                    .mockResolvedValueOnce({
                        status: 200,
                        success: true,
                        data: mockSortOrderData,
                    });

                const result = await MetricsComparisonService.getMetricsComparisonData({
                    kpis: TEST_KPI_ID,
                    start_time: '2025-01-01T00:00:00Z',
                    end_time: '2025-01-07T00:00:00Z',
                    tenant_id: TEST_TENANT_ID,
                    pipeline_schedule: 'd',
                    dimension_id: TEST_DIMENSION_ID,
                    dim_name: null,
                    dim_val: null,
                });

                expect(result).toBeDefined();
                expect(logger.warn).toHaveBeenCalled();
            });
        });

        describe('Empty Result Sets', () => {
            it('should handle empty dimension breakup data', async () => {
                const mockKpi = {
                    id: TEST_KPI_ID,
                    kpi_name: 'revenue',
                    type: 'simple',
                    kpi_format: 'currency',
                    metric_source_id: 'source-001',
                    metric_category: 'revenue',
                };

                const mockDimension = {
                    id: TEST_DIMENSION_ID,
                    name: 'country',
                };

                metricsDao.getMetricById.mockResolvedValue(mockKpi);
                dimensionsDao.getDimensionById.mockResolvedValue(mockDimension);
                get_metric_dimensions_breakup_query.mockReturnValue('SELECT * FROM dimensions_breakup');
                get_sort_order_for_dimensions_breakup.mockReturnValue('SELECT * FROM sort_order');

                polarisQueryCall
                    .mockResolvedValueOnce({
                        status: 200,
                        success: true,
                        data: [], // Empty result
                    })
                    .mockResolvedValueOnce({
                        status: 200,
                        success: true,
                        data: [],
                    });

                const result = await MetricsComparisonService.getMetricsComparisonData({
                    kpis: TEST_KPI_ID,
                    start_time: '2025-01-01T00:00:00Z',
                    end_time: '2025-01-07T00:00:00Z',
                    tenant_id: TEST_TENANT_ID,
                    pipeline_schedule: 'd',
                    dimension_id: TEST_DIMENSION_ID,
                    dim_name: null,
                    dim_val: null,
                });

                expect(result).toBeDefined();
                expect(result).toBeInstanceOf(Array);
                expect(result).toHaveLength(0);
            });
        });

        describe('Error Handling', () => {
            it('should throw error when metric is not found', async () => {
                metricsDao.getMetricById.mockResolvedValue(null);

                await expect(
                    MetricsComparisonService.getMetricsComparisonData({
                        kpis: 'non-existent-kpi',
                        start_time: '2025-01-01T00:00:00Z',
                        end_time: '2025-01-07T00:00:00Z',
                        tenant_id: TEST_TENANT_ID,
                        pipeline_schedule: 'd',
                        dimension_id: TEST_DIMENSION_ID,
                        dim_name: null,
                        dim_val: null,
                    })
                ).rejects.toThrow('Metric not found for kpi_id: non-existent-kpi');

                expect(logger.log).toHaveBeenCalledWith('error', expect.stringContaining('Metric not found'));
            });

            it('should throw error when dimension is not found', async () => {
                const mockKpi = {
                    id: TEST_KPI_ID,
                    kpi_name: 'revenue',
                    type: 'simple',
                };

                metricsDao.getMetricById.mockResolvedValue(mockKpi);
                dimensionsDao.getDimensionById.mockResolvedValue(null);

                await expect(
                    MetricsComparisonService.getMetricsComparisonData({
                        kpis: TEST_KPI_ID,
                        start_time: '2025-01-01T00:00:00Z',
                        end_time: '2025-01-07T00:00:00Z',
                        tenant_id: TEST_TENANT_ID,
                        pipeline_schedule: 'd',
                        dimension_id: 'non-existent-dim',
                        dim_name: null,
                        dim_val: null,
                    })
                ).rejects.toThrow('Dimension not found for dimension_id: non-existent-dim');
            });

            it('should throw error when Polaris query fails', async () => {
                const mockKpi = {
                    id: TEST_KPI_ID,
                    kpi_name: 'revenue',
                    type: 'simple',
                    kpi_format: 'currency',
                    metric_source_id: 'source-001',
                    metric_category: 'revenue',
                };

                const mockDimension = {
                    id: TEST_DIMENSION_ID,
                    name: 'country',
                };

                metricsDao.getMetricById.mockResolvedValue(mockKpi);
                dimensionsDao.getDimensionById.mockResolvedValue(mockDimension);
                get_metric_dimensions_breakup_query.mockReturnValue('SELECT * FROM dimensions_breakup');

                polarisQueryCall.mockResolvedValue({
                    status: 500,
                    success: false,
                    data: [],
                });

                await expect(
                    MetricsComparisonService.getMetricsComparisonData({
                        kpis: TEST_KPI_ID,
                        start_time: '2025-01-01T00:00:00Z',
                        end_time: '2025-01-07T00:00:00Z',
                        tenant_id: TEST_TENANT_ID,
                        pipeline_schedule: 'd',
                        dimension_id: TEST_DIMENSION_ID,
                        dim_name: null,
                        dim_val: null,
                    })
                ).rejects.toThrow('Error while fetching data from Polaris');
            });
        });
    });

    describe('getMetricsComparisonData - Ratio Metrics', () => {
        describe('Successful Query Execution', () => {
            it('should successfully process ratio metric with constituent metrics', async () => {
                const mockRatioKpi = {
                    id: TEST_KPI_ID,
                    kpi_name: 'conversion_rate',
                    type: 'ratio',
                    kpi_format: 'percentage',
                    metric_source_id: 'source-001',
                    metric_category: 'conversion',
                    rca_aggregation_operation: 'checkouts / visitors',
                    constituent_metrics: {
                        numerator: [{ id: 'kpi-002', name: 'checkouts' }],
                        denominator: [{ id: 'kpi-003', name: 'visitors' }],
                    },
                };

                const mockDimension = {
                    id: TEST_DIMENSION_ID,
                    name: 'country',
                };

                const mockNumeratorData = [
                    {
                        __time: '2025-01-01T00:00:00Z',
                        dim_val: '["USA"]',
                        sum_kpi: '[100]',
                    },
                ];

                const mockDenominatorData = [
                    {
                        y: '[500]',
                    },
                ];

                const mockSortOrderData = [{ dim_name: 'USA', sort_order: 1 }];

                metricsDao.getMetricById.mockResolvedValue(mockRatioKpi);
                dimensionsDao.getDimensionById.mockResolvedValue(mockDimension);
                get_metric_dimensions_breakup_query.mockReturnValue('SELECT * FROM dimensions_breakup');
                get_sort_order_for_dimensions_breakup.mockReturnValue('SELECT * FROM sort_order');
                get_metrics_comparison_query.mockReturnValue('SELECT * FROM metrics_comparison');

                polarisQueryCall
                    .mockResolvedValueOnce({
                        status: 200,
                        success: true,
                        data: mockNumeratorData,
                    })
                    .mockResolvedValueOnce({
                        status: 200,
                        success: true,
                        data: mockSortOrderData,
                    })
                    .mockResolvedValueOnce({
                        status: 200,
                        success: true,
                        data: mockDenominatorData,
                    });

                const result = await MetricsComparisonService.getMetricsComparisonData({
                    kpis: TEST_KPI_ID,
                    start_time: '2025-01-01T00:00:00Z',
                    end_time: '2025-01-07T00:00:00Z',
                    tenant_id: TEST_TENANT_ID,
                    pipeline_schedule: 'd',
                    dimension_id: TEST_DIMENSION_ID,
                    dim_name: null,
                    dim_val: null,
                });

                expect(result).toBeDefined();
                expect(result).toHaveLength(1);
                expect(polarisQueryCall).toHaveBeenCalledTimes(3); // numerator, sort, denominator
            });

            it('should throw error when constituent metrics are missing for ratio metric', async () => {
                const mockRatioKpi = {
                    id: TEST_KPI_ID,
                    kpi_name: 'conversion_rate',
                    type: 'ratio',
                    kpi_format: 'percentage',
                    constituent_metrics: null, // Missing constituent metrics
                };

                const mockDimension = {
                    id: TEST_DIMENSION_ID,
                    name: 'country',
                };

                metricsDao.getMetricById.mockResolvedValue(mockRatioKpi);
                dimensionsDao.getDimensionById.mockResolvedValue(mockDimension);

                await expect(
                    MetricsComparisonService.getMetricsComparisonData({
                        kpis: TEST_KPI_ID,
                        start_time: '2025-01-01T00:00:00Z',
                        end_time: '2025-01-07T00:00:00Z',
                        tenant_id: TEST_TENANT_ID,
                        pipeline_schedule: 'd',
                        dimension_id: TEST_DIMENSION_ID,
                        dim_name: null,
                        dim_val: null,
                    })
                ).rejects.toThrow('No Constituent metrics configured');
            });
        });
    });

    describe('Default Time Range Handling', () => {
        it('should fetch default time range when start_time and end_time are not provided', async () => {
            const mockKpi = {
                id: TEST_KPI_ID,
                kpi_name: 'revenue',
                type: 'simple',
                kpi_format: 'currency',
                metric_source_id: 'source-001',
                metric_category: 'revenue',
            };

            const mockDimension = {
                id: TEST_DIMENSION_ID,
                name: 'country',
            };

            const lastDataTs = '2025-01-15T00:00:00Z';

            metricsDao.getMetricById.mockResolvedValue(mockKpi);
            dimensionsDao.getDimensionById.mockResolvedValue(mockDimension);
            get_last_data_ts_query.mockReturnValue('SELECT last_data_ts');
            get_metric_dimensions_breakup_query.mockReturnValue('SELECT * FROM dimensions_breakup');
            get_sort_order_for_dimensions_breakup.mockReturnValue('SELECT * FROM sort_order');

            polarisQueryCall
                .mockResolvedValueOnce({
                    status: 200,
                    success: true,
                    data: [{ last_data_ts: lastDataTs }],
                })
                .mockResolvedValueOnce({
                    status: 200,
                    success: true,
                    data: [],
                })
                .mockResolvedValueOnce({
                    status: 200,
                    success: true,
                    data: [],
                });

            const result = await MetricsComparisonService.getMetricsComparisonData({
                kpis: TEST_KPI_ID,
                start_time: null,
                end_time: null,
                tenant_id: TEST_TENANT_ID,
                pipeline_schedule: 'd',
                dimension_id: TEST_DIMENSION_ID,
                dim_name: null,
                dim_val: null,
            });

            expect(result).toBeDefined();
            expect(polarisQueryCall).toHaveBeenCalledWith(expect.any(String));
        });
    });
});
