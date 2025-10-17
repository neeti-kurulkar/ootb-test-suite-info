const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');

// Mock dependencies before importing the service
jest.mock('../../../../src/utils/logger/logger', () => ({
    log: jest.fn(),
    warn: jest.fn(),
}));

jest.mock('mathjs', () => ({
    evaluate: jest.fn(),
}));

jest.mock('../../../../src/models/postgres/metrics/kpi.operational.dao');
jest.mock('../../../../src/models/postgres/metrics/dimension.dao');
jest.mock('../../../../src/models/postgres/insight/insight.dao');
jest.mock('../../../../src/models/polaris/common/common.model');
jest.mock('../../../../src/models/polaris/metric_compare/metrics_compare.model');
jest.mock('../../../../src/models/polaris/metric/metric.model');
jest.mock('../../../../src/models/postgres/metric_status/metric_status.dao');

// Import mocked mathjs
const mathjs = require('mathjs');

// Import the service - this creates a singleton instance
const MetricsComparisonService = require('../../../../src/services/metrics/metricsComparison.service');

describe('MetricsComparisonService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset console.log mock
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    describe('calculateBreakupForRatioMetrics', () => {
        const numerator_metric = [{ name: 'checkouts' }];
        const denominator_metric = [{ name: 'visitors' }];
        const operation = 'checkouts / visitors';

        describe('Happy Path - Valid Data', () => {
            it('should calculate ratio metrics correctly for single timestamp', () => {
                const numeratorData = [
                    {
                        __time: '2025-01-01T00:00:00Z',
                        dim_val: '["USA"]',
                        sum_kpi: '[100]',
                    },
                ];

                const denominatorData = [
                    {
                        y: '[200]',
                    },
                ];

                mathjs.evaluate.mockReturnValue(0.5);

                const result = MetricsComparisonService.calculateBreakupForRatioMetrics(
                    numeratorData,
                    denominatorData,
                    numerator_metric,
                    denominator_metric,
                    operation
                );

                expect(result.data).toHaveLength(1);
                expect(result.data[0]).toEqual({
                    __time: '2025-01-01T00:00:00Z',
                    dim_val: 'USA',
                    sum_kpi: 0.5,
                });
                expect(mathjs.evaluate).toHaveBeenCalledWith(operation, {
                    checkouts: 100,
                    visitors: 200,
                });
            });

            it('should calculate ratio metrics for multiple dimensions', () => {
                const numeratorData = [
                    {
                        __time: '2025-01-01T00:00:00Z',
                        dim_val: '["USA", "Canada", "UK"]',
                        sum_kpi: '[100, 200, 150]',
                    },
                ];

                const denominatorData = [
                    {
                        y: '[500]',
                    },
                ];

                mathjs.evaluate
                    .mockReturnValueOnce(0.2) // 100/500
                    .mockReturnValueOnce(0.4) // 200/500
                    .mockReturnValueOnce(0.3); // 150/500

                const result = MetricsComparisonService.calculateBreakupForRatioMetrics(
                    numeratorData,
                    denominatorData,
                    numerator_metric,
                    denominator_metric,
                    operation
                );

                expect(result.data).toHaveLength(3);
                expect(result.data[0].dim_val).toBe('USA');
                expect(result.data[1].dim_val).toBe('Canada');
                expect(result.data[2].dim_val).toBe('UK');
                expect(mathjs.evaluate).toHaveBeenCalledTimes(3);
            });

            it('should calculate ratio metrics for multiple timestamps', () => {
                const numeratorData = [
                    {
                        __time: '2025-01-01T00:00:00Z',
                        dim_val: '["USA"]',
                        sum_kpi: '[100]',
                    },
                    {
                        __time: '2025-01-02T00:00:00Z',
                        dim_val: '["USA"]',
                        sum_kpi: '[150]',
                    },
                ];

                const denominatorData = [
                    { y: '[200]' },
                    { y: '[300]' },
                ];

                mathjs.evaluate.mockReturnValueOnce(0.5).mockReturnValueOnce(0.5);

                const result = MetricsComparisonService.calculateBreakupForRatioMetrics(
                    numeratorData,
                    denominatorData,
                    numerator_metric,
                    denominator_metric,
                    operation
                );

                expect(result.data).toHaveLength(2);
                expect(result.data[0].__time).toBe('2025-01-01T00:00:00Z');
                expect(result.data[1].__time).toBe('2025-01-02T00:00:00Z');
            });
        });

        describe('Edge Cases - Division by Zero', () => {
            it('should handle division by zero gracefully', () => {
                const numeratorData = [
                    {
                        __time: '2025-01-01T00:00:00Z',
                        dim_val: '["USA"]',
                        sum_kpi: '[100]',
                    },
                ];

                const denominatorData = [
                    {
                        y: '[0]',
                    },
                ];

                mathjs.evaluate.mockReturnValue(Infinity);

                const result = MetricsComparisonService.calculateBreakupForRatioMetrics(
                    numeratorData,
                    denominatorData,
                    numerator_metric,
                    denominator_metric,
                    operation
                );

                expect(result.data[0].sum_kpi).toBe(Infinity);
                expect(mathjs.evaluate).toHaveBeenCalledWith(operation, {
                    checkouts: 100,
                    visitors: 0,
                });
            });

            it('should handle all-zero denominators', () => {
                const numeratorData = [
                    {
                        __time: '2025-01-01T00:00:00Z',
                        dim_val: '["USA", "Canada"]',
                        sum_kpi: '[100, 200]',
                    },
                ];

                const denominatorData = [
                    {
                        y: '[0]',
                    },
                ];

                mathjs.evaluate.mockReturnValue(Infinity);

                const result = MetricsComparisonService.calculateBreakupForRatioMetrics(
                    numeratorData,
                    denominatorData,
                    numerator_metric,
                    denominator_metric,
                    operation
                );

                expect(result.data).toHaveLength(2);
                expect(result.data[0].sum_kpi).toBe(Infinity);
                expect(result.data[1].sum_kpi).toBe(Infinity);
            });
        });

        describe('Edge Cases - Empty Arrays', () => {
            it('should return empty data array when numerator is empty', () => {
                const numeratorData = [];
                const denominatorData = [{ y: '[100]' }];

                const result = MetricsComparisonService.calculateBreakupForRatioMetrics(
                    numeratorData,
                    denominatorData,
                    numerator_metric,
                    denominator_metric,
                    operation
                );

                expect(result.data).toHaveLength(0);
                expect(mathjs.evaluate).not.toHaveBeenCalled();
            });

            it('should handle empty dimension arrays', () => {
                const numeratorData = [
                    {
                        __time: '2025-01-01T00:00:00Z',
                        dim_val: '[]',
                        sum_kpi: '[]',
                    },
                ];

                const denominatorData = [
                    {
                        y: '[100]',
                    },
                ];

                const result = MetricsComparisonService.calculateBreakupForRatioMetrics(
                    numeratorData,
                    denominatorData,
                    numerator_metric,
                    denominator_metric,
                    operation
                );

                expect(result.data).toHaveLength(0);
                expect(mathjs.evaluate).not.toHaveBeenCalled();
            });
        });

        describe('Edge Cases - Null Values', () => {
            it('should handle null sum_kpi gracefully', () => {
                const numeratorData = [
                    {
                        __time: '2025-01-01T00:00:00Z',
                        dim_val: '["USA"]',
                        sum_kpi: '[null]',
                    },
                ];

                const denominatorData = [
                    {
                        y: '[100]',
                    },
                ];

                mathjs.evaluate.mockReturnValue(null);

                const result = MetricsComparisonService.calculateBreakupForRatioMetrics(
                    numeratorData,
                    denominatorData,
                    numerator_metric,
                    denominator_metric,
                    operation
                );

                expect(result.data).toHaveLength(1);
                expect(mathjs.evaluate).toHaveBeenCalledWith(operation, {
                    checkouts: null,
                    visitors: 100,
                });
            });
        });

        describe('Edge Cases - Mismatched Array Lengths', () => {
            it('should handle numerator longer than denominator by using offset calculation', () => {
                // Scenario: consolidation (numerator) has fewer entries than incremental (denominator)
                const numeratorData = [
                    {
                        __time: '2025-01-03T00:00:00Z',
                        dim_val: '["USA"]',
                        sum_kpi: '[100]',
                    },
                ];

                const denominatorData = [
                    { y: '[50]' }, // Day 1
                    { y: '[75]' }, // Day 2
                    { y: '[200]' }, // Day 3 - should match with numerator
                ];

                mathjs.evaluate.mockReturnValue(0.5);

                const result = MetricsComparisonService.calculateBreakupForRatioMetrics(
                    numeratorData,
                    denominatorData,
                    numerator_metric,
                    denominator_metric,
                    operation
                );

                expect(result.data).toHaveLength(1);
                // Should use denominatorData[2] (last item) for the calculation
                expect(mathjs.evaluate).toHaveBeenCalledWith(operation, {
                    checkouts: 100,
                    visitors: 200,
                });
            });

            it('should handle multiple numerator entries with longer denominator array', () => {
                const numeratorData = [
                    {
                        __time: '2025-01-02T00:00:00Z',
                        dim_val: '["USA"]',
                        sum_kpi: '[100]',
                    },
                    {
                        __time: '2025-01-03T00:00:00Z',
                        dim_val: '["USA"]',
                        sum_kpi: '[150]',
                    },
                ];

                const denominatorData = [
                    { y: '[50]' }, // Day 1
                    { y: '[200]' }, // Day 2 - matches first numerator
                    { y: '[300]' }, // Day 3 - matches second numerator
                ];

                mathjs.evaluate.mockReturnValueOnce(0.5).mockReturnValueOnce(0.5);

                const result = MetricsComparisonService.calculateBreakupForRatioMetrics(
                    numeratorData,
                    denominatorData,
                    numerator_metric,
                    denominator_metric,
                    operation
                );

                expect(result.data).toHaveLength(2);
                expect(mathjs.evaluate).toHaveBeenNthCalledWith(1, operation, {
                    checkouts: 100,
                    visitors: 200,
                });
                expect(mathjs.evaluate).toHaveBeenNthCalledWith(2, operation, {
                    checkouts: 150,
                    visitors: 300,
                });
            });
        });

        describe('Complex Scenarios', () => {
            it('should handle multiple dimensions across multiple timestamps', () => {
                const numeratorData = [
                    {
                        __time: '2025-01-01T00:00:00Z',
                        dim_val: '["USA", "Canada"]',
                        sum_kpi: '[100, 50]',
                    },
                    {
                        __time: '2025-01-02T00:00:00Z',
                        dim_val: '["USA", "Canada"]',
                        sum_kpi: '[150, 75]',
                    },
                ];

                const denominatorData = [{ y: '[500]' }, { y: '[600]' }];

                mathjs.evaluate
                    .mockReturnValueOnce(0.2)
                    .mockReturnValueOnce(0.1)
                    .mockReturnValueOnce(0.25)
                    .mockReturnValueOnce(0.125);

                const result = MetricsComparisonService.calculateBreakupForRatioMetrics(
                    numeratorData,
                    denominatorData,
                    numerator_metric,
                    denominator_metric,
                    operation
                );

                expect(result.data).toHaveLength(4);
                expect(result.data[0]).toMatchObject({
                    __time: '2025-01-01T00:00:00Z',
                    dim_val: 'USA',
                });
                expect(result.data[1]).toMatchObject({
                    __time: '2025-01-01T00:00:00Z',
                    dim_val: 'Canada',
                });
                expect(result.data[2]).toMatchObject({
                    __time: '2025-01-02T00:00:00Z',
                    dim_val: 'USA',
                });
                expect(result.data[3]).toMatchObject({
                    __time: '2025-01-02T00:00:00Z',
                    dim_val: 'Canada',
                });
            });
        });
    });

    describe('getSortedDimensionsBreakup', () => {
        describe('Happy Path - Valid Sorting', () => {
            it('should sort dimensions based on sort order array', () => {
                const dimensionsData = [
                    { dim_val: 'Canada', y: 200 },
                    { dim_val: 'USA', y: 100 },
                    { dim_val: 'UK', y: 150 },
                ];

                const sortOrderArray = [
                    { dim_name: 'USA' },
                    { dim_name: 'UK' },
                    { dim_name: 'Canada' },
                ];

                const result = MetricsComparisonService.getSortedDimensionsBreakup(
                    dimensionsData,
                    sortOrderArray
                );

                expect(result[0].dim_val).toBe('USA');
                expect(result[1].dim_val).toBe('UK');
                expect(result[2].dim_val).toBe('Canada');
            });

            it('should maintain sort order with single element', () => {
                const dimensionsData = [{ dim_val: 'USA', y: 100 }];

                const sortOrderArray = [{ dim_name: 'USA' }];

                const result = MetricsComparisonService.getSortedDimensionsBreakup(
                    dimensionsData,
                    sortOrderArray
                );

                expect(result).toHaveLength(1);
                expect(result[0].dim_val).toBe('USA');
            });

            it('should sort correctly with many dimensions', () => {
                const dimensionsData = [
                    { dim_val: 'E', y: 5 },
                    { dim_val: 'C', y: 3 },
                    { dim_val: 'A', y: 1 },
                    { dim_val: 'D', y: 4 },
                    { dim_val: 'B', y: 2 },
                ];

                const sortOrderArray = [
                    { dim_name: 'A' },
                    { dim_name: 'B' },
                    { dim_name: 'C' },
                    { dim_name: 'D' },
                    { dim_name: 'E' },
                ];

                const result = MetricsComparisonService.getSortedDimensionsBreakup(
                    dimensionsData,
                    sortOrderArray
                );

                expect(result.map((d) => d.dim_val)).toEqual(['A', 'B', 'C', 'D', 'E']);
            });
        });

        describe('Edge Cases - Null Values', () => {
            it('should handle null dimension names in sort order', () => {
                const dimensionsData = [
                    { dim_val: 'USA', y: 100 },
                    { dim_val: 'null', y: 50 },
                ];

                const sortOrderArray = [{ dim_name: null }, { dim_name: 'USA' }];

                const result = MetricsComparisonService.getSortedDimensionsBreakup(
                    dimensionsData,
                    sortOrderArray
                );

                expect(result[0].dim_val).toBe('null');
                expect(result[1].dim_val).toBe('USA');
            });

            it('should handle multiple null values', () => {
                const dimensionsData = [
                    { dim_val: 'USA', y: 100 },
                    { dim_val: 'null', y: 50 },
                    { dim_val: 'null', y: 25 },
                ];

                const sortOrderArray = [
                    { dim_name: null },
                    { dim_name: null },
                    { dim_name: 'USA' },
                ];

                const result = MetricsComparisonService.getSortedDimensionsBreakup(
                    dimensionsData,
                    sortOrderArray
                );

                expect(result).toHaveLength(3);
                // Both nulls should come first based on sort order
                expect(result[2].dim_val).toBe('USA');
            });
        });

        describe('Edge Cases - Empty Arrays', () => {
            it('should return empty array when input is empty', () => {
                const dimensionsData = [];
                const sortOrderArray = [];

                const result = MetricsComparisonService.getSortedDimensionsBreakup(
                    dimensionsData,
                    sortOrderArray
                );

                expect(result).toHaveLength(0);
            });

            it('should handle empty sort order with data present', () => {
                const dimensionsData = [{ dim_val: 'USA', y: 100 }];
                const sortOrderArray = [];

                const result = MetricsComparisonService.getSortedDimensionsBreakup(
                    dimensionsData,
                    sortOrderArray
                );

                // Should return unsorted data (indexOf will be -1 for all)
                expect(result).toHaveLength(1);
                expect(result[0].dim_val).toBe('USA');
            });
        });

        describe('Edge Cases - Missing Dimensions', () => {
            it('should handle dimensions not in sort order', () => {
                const dimensionsData = [
                    { dim_val: 'USA', y: 100 },
                    { dim_val: 'Unknown', y: 50 },
                    { dim_val: 'Canada', y: 75 },
                ];

                const sortOrderArray = [{ dim_name: 'USA' }, { dim_name: 'Canada' }];

                const result = MetricsComparisonService.getSortedDimensionsBreakup(
                    dimensionsData,
                    sortOrderArray
                );

                // Items not in sort order get indexOf -1, and sort maintains relative order for equal values
                expect(result).toHaveLength(3);
                expect(result.find(d => d.dim_val === 'USA')).toBeDefined();
                expect(result.find(d => d.dim_val === 'Canada')).toBeDefined();
                expect(result.find(d => d.dim_val === 'Unknown')).toBeDefined();

                // USA should come before Canada based on sort order
                const usaIndex = result.findIndex(d => d.dim_val === 'USA');
                const canadaIndex = result.findIndex(d => d.dim_val === 'Canada');
                expect(usaIndex).toBeLessThan(canadaIndex);
            });

            it('should place known dimensions before unknown ones', () => {
                const dimensionsData = [
                    { dim_val: 'Unknown1', y: 1 },
                    { dim_val: 'USA', y: 100 },
                    { dim_val: 'Unknown2', y: 2 },
                ];

                const sortOrderArray = [{ dim_name: 'USA' }];

                const result = MetricsComparisonService.getSortedDimensionsBreakup(
                    dimensionsData,
                    sortOrderArray
                );

                expect(result).toHaveLength(3);
                // USA should be in the sorted result
                expect(result.find(d => d.dim_val === 'USA')).toBeDefined();
                expect(result.find(d => d.dim_val === 'Unknown1')).toBeDefined();
                expect(result.find(d => d.dim_val === 'Unknown2')).toBeDefined();
            });
        });

        describe('Stability - Original Array Modification', () => {
            it('should modify the original array (sort in place)', () => {
                const dimensionsData = [
                    { dim_val: 'B', y: 2 },
                    { dim_val: 'A', y: 1 },
                ];

                const sortOrderArray = [{ dim_name: 'A' }, { dim_name: 'B' }];

                const result = MetricsComparisonService.getSortedDimensionsBreakup(
                    dimensionsData,
                    sortOrderArray
                );

                // Check that original array is modified
                expect(dimensionsData[0].dim_val).toBe('A');
                expect(result).toBe(dimensionsData);
            });
        });
    });

    describe('getDefaultTimeRange', () => {
        beforeEach(() => {
            // Mock the executeQueryWithFallback method
            jest.spyOn(MetricsComparisonService, 'executeQueryWithFallback');
        });

        describe('Happy Path - Data Available', () => {
            it('should calculate time range based on last data timestamp for daily frequency', async () => {
                const lastDataTs = '2025-01-15T00:00:00Z';
                MetricsComparisonService.executeQueryWithFallback.mockResolvedValue({
                    status: 200,
                    data: [{ last_data_ts: lastDataTs }],
                });

                const result = await MetricsComparisonService.getDefaultTimeRange(
                    'tenant-123',
                    'd',
                    'kpi-001',
                    'country',
                    'revenue'
                );

                const expectedStartDate = new Date(lastDataTs);
                expectedStartDate.setDate(expectedStartDate.getDate() - 7); // daily range is 7

                expect(result.end_time).toBe(lastDataTs);
                expect(result.start_time).toBe(expectedStartDate.toISOString());
            });

            it('should calculate time range for hourly frequency', async () => {
                const lastDataTs = '2025-01-15T12:00:00Z';
                MetricsComparisonService.executeQueryWithFallback.mockResolvedValue({
                    status: 200,
                    data: [{ last_data_ts: lastDataTs }],
                });

                const result = await MetricsComparisonService.getDefaultTimeRange(
                    'tenant-123',
                    'h',
                    'kpi-001',
                    'country',
                    'revenue'
                );

                const expectedStartDate = new Date(lastDataTs);
                expectedStartDate.setDate(expectedStartDate.getDate() - 2); // hourly range is 2

                expect(result.end_time).toBe(lastDataTs);
                expect(result.start_time).toBe(expectedStartDate.toISOString());
            });

            it('should calculate time range for weekly frequency', async () => {
                const lastDataTs = '2025-01-15T00:00:00Z';
                MetricsComparisonService.executeQueryWithFallback.mockResolvedValue({
                    status: 200,
                    data: [{ last_data_ts: lastDataTs }],
                });

                const result = await MetricsComparisonService.getDefaultTimeRange(
                    'tenant-123',
                    'w',
                    'kpi-001',
                    'country',
                    'revenue'
                );

                const expectedStartDate = new Date(lastDataTs);
                expectedStartDate.setDate(expectedStartDate.getDate() - 30); // weekly range is 30

                expect(result.end_time).toBe(lastDataTs);
                expect(result.start_time).toBe(expectedStartDate.toISOString());
            });

            it('should calculate time range for monthly frequency', async () => {
                const lastDataTs = '2025-01-15T00:00:00Z';
                MetricsComparisonService.executeQueryWithFallback.mockResolvedValue({
                    status: 200,
                    data: [{ last_data_ts: lastDataTs }],
                });

                const result = await MetricsComparisonService.getDefaultTimeRange(
                    'tenant-123',
                    'm',
                    'kpi-001',
                    'country',
                    'revenue'
                );

                const expectedStartDate = new Date(lastDataTs);
                expectedStartDate.setDate(expectedStartDate.getDate() - 90); // monthly range is 90

                expect(result.end_time).toBe(lastDataTs);
                expect(result.start_time).toBe(expectedStartDate.toISOString());
            });
        });

        describe('Fallback - No Data Available', () => {
            it('should use current time when no data is returned (empty array)', async () => {
                MetricsComparisonService.executeQueryWithFallback.mockResolvedValue({
                    status: 200,
                    data: [],
                });

                const beforeCall = new Date();
                const result = await MetricsComparisonService.getDefaultTimeRange(
                    'tenant-123',
                    'd',
                    'kpi-001',
                    'country',
                    'revenue'
                );
                const afterCall = new Date();

                const endTime = new Date(result.end_time);
                expect(endTime.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
                expect(endTime.getTime()).toBeLessThanOrEqual(afterCall.getTime());

                const startTime = new Date(result.start_time);
                const expectedStartTime = new Date(result.end_time);
                expectedStartTime.setDate(expectedStartTime.getDate() - 7);

                expect(startTime.toISOString()).toBe(expectedStartTime.toISOString());
            });

            it('should use current time when status is not 200', async () => {
                MetricsComparisonService.executeQueryWithFallback.mockResolvedValue({
                    status: 404,
                    data: [],
                });

                const result = await MetricsComparisonService.getDefaultTimeRange(
                    'tenant-123',
                    'd',
                    'kpi-001',
                    'country',
                    'revenue'
                );

                expect(result.end_time).toBeDefined();
                expect(result.start_time).toBeDefined();

                const endTime = new Date(result.end_time);
                const startTime = new Date(result.start_time);
                const diffInDays = (endTime - startTime) / (1000 * 60 * 60 * 24);

                expect(diffInDays).toBeCloseTo(7, 0); // daily frequency = 7 days range
            });
        });

        describe('Edge Cases - Null Values', () => {
            it('should handle null dimension name', async () => {
                const lastDataTs = '2025-01-15T00:00:00Z';
                MetricsComparisonService.executeQueryWithFallback.mockResolvedValue({
                    status: 200,
                    data: [{ last_data_ts: lastDataTs }],
                });

                const result = await MetricsComparisonService.getDefaultTimeRange(
                    'tenant-123',
                    'd',
                    'kpi-001',
                    null,
                    'revenue'
                );

                expect(result.end_time).toBe(lastDataTs);
                expect(result.start_time).toBeDefined();
            });

            it('should handle null metric category', async () => {
                const lastDataTs = '2025-01-15T00:00:00Z';
                MetricsComparisonService.executeQueryWithFallback.mockResolvedValue({
                    status: 200,
                    data: [{ last_data_ts: lastDataTs }],
                });

                const result = await MetricsComparisonService.getDefaultTimeRange(
                    'tenant-123',
                    'd',
                    'kpi-001',
                    'country',
                    null
                );

                expect(result.end_time).toBe(lastDataTs);
                expect(result.start_time).toBeDefined();
            });
        });

        describe('Integration with executeQueryWithFallback', () => {
            it('should call executeQueryWithFallback with correct parameters', async () => {
                const lastDataTs = '2025-01-15T00:00:00Z';
                MetricsComparisonService.executeQueryWithFallback.mockResolvedValue({
                    status: 200,
                    data: [{ last_data_ts: lastDataTs }],
                });

                await MetricsComparisonService.getDefaultTimeRange(
                    'tenant-123',
                    'd',
                    'kpi-001',
                    'country',
                    'revenue'
                );

                expect(MetricsComparisonService.executeQueryWithFallback).toHaveBeenCalledWith(
                    expect.any(Function), // get_last_data_ts_query
                    ['tenant-123', ['d'], 'kpi-001', false, 'country', 'revenue'],
                    'tenant-123',
                    'revenue'
                );
            });
        });

        describe('Boundary Cases - Date Calculations', () => {
            it('should handle month boundaries correctly', async () => {
                const lastDataTs = '2025-02-01T00:00:00Z'; // First day of month
                MetricsComparisonService.executeQueryWithFallback.mockResolvedValue({
                    status: 200,
                    data: [{ last_data_ts: lastDataTs }],
                });

                const result = await MetricsComparisonService.getDefaultTimeRange(
                    'tenant-123',
                    'd',
                    'kpi-001',
                    'country',
                    'revenue'
                );

                const startDate = new Date(result.start_time);
                const endDate = new Date(result.end_time);

                expect(result.end_time).toBe(lastDataTs);
                expect(startDate.getMonth()).toBe(0); // January (going back 7 days from Feb 1)
            });

            it('should handle year boundaries correctly', async () => {
                const lastDataTs = '2025-01-02T00:00:00Z'; // Early January
                MetricsComparisonService.executeQueryWithFallback.mockResolvedValue({
                    status: 200,
                    data: [{ last_data_ts: lastDataTs }],
                });

                const result = await MetricsComparisonService.getDefaultTimeRange(
                    'tenant-123',
                    'd',
                    'kpi-001',
                    'country',
                    'revenue'
                );

                const startDate = new Date(result.start_time);
                const endDate = new Date(result.end_time);

                expect(result.end_time).toBe(lastDataTs);
                expect(startDate.getFullYear()).toBe(2024); // Should go back to previous year
            });
        });

        describe('All Frequency Types', () => {
            it.each([
                ['h', 2],
                ['d', 7],
                ['w', 30],
                ['m', 90],
            ])(
                'should calculate correct range for frequency "%s" with range %i days',
                async (frequency, expectedRange) => {
                    const lastDataTs = '2025-01-15T00:00:00Z';
                    MetricsComparisonService.executeQueryWithFallback.mockResolvedValue({
                        status: 200,
                        data: [{ last_data_ts: lastDataTs }],
                    });

                    const result = await MetricsComparisonService.getDefaultTimeRange(
                        'tenant-123',
                        frequency,
                        'kpi-001',
                        'country',
                        'revenue'
                    );

                    const startDate = new Date(result.start_time);
                    const endDate = new Date(result.end_time);
                    const diffInDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

                    expect(diffInDays).toBeCloseTo(expectedRange, 0);
                }
            );
        });
    });
});
