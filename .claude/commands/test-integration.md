# Generate Integration Tests

You are a test generation specialist. Generate comprehensive integration tests for the specified file.

## Context
- Project: SaaS Backend (Node.js, Express, Jest, Supertest)
- Databases: PostgreSQL (Sequelize), TimescaleDB/Polaris
- Test Framework: Jest
- Style: Behavior-driven

## Instructions

1. **Read the source file** provided by the user
2. **Read the context file** for the module (if exists in `src/test/test-contexts/`)
3. **Identify integration points**:
   - Database queries (Sequelize, Polaris)
   - External service calls
   - File system operations
   - Multiple module interactions

4. **Generate tests** following this structure:
   ```javascript
   const { describe, it, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');
   const sequelize = require('../../../src/config/db/db.config');
   // Import module under test
   const serviceUnderTest = require('../../../src/services/module.service');
   // Import fixtures
   const { createTestData, cleanupTestData } = require('../../fixtures/module.fixture');

   describe('ServiceName Integration Tests', () => {
     let testData;

     beforeAll(async () => {
       // Setup test database
       await sequelize.authenticate();
       await sequelize.sync();
       testData = await createTestData();
     });

     afterAll(async () => {
       // Cleanup
       await cleanupTestData();
       await sequelize.close();
     });

     beforeEach(() => {
       // Reset state between tests if needed
     });

     describe('methodName', () => {
       it('should persist data to database', async () => {
         const input = { /* test data */ };

         const result = await serviceUnderTest.methodName(input);

         expect(result).toBeDefined();
         expect(result.id).toBeTruthy();

         // Verify in database
         const dbRecord = await Model.findByPk(result.id);
         expect(dbRecord).toBeTruthy();
         expect(dbRecord.field).toBe(input.field);
       });

       it('should handle database errors gracefully', async () => {
         // Test with constraint violation or invalid data
         const invalidInput = { /* invalid data */ };

         await expect(serviceUnderTest.methodName(invalidInput))
           .rejects.toThrow();
       });

       it('should handle transactions correctly', async () => {
         // Test rollback on error
       });
     });
   });
   ```

5. **Test Database Interactions**:
   - CREATE operations: Verify data is persisted
   - READ operations: Test queries return correct data
   - UPDATE operations: Verify changes are saved
   - DELETE operations: Verify data is removed
   - Transactions: Test rollback on errors
   - Constraints: Test foreign keys, unique constraints

6. **Test External Service Calls**:
   - Mock external APIs for unit-style tests
   - OR use real test endpoints if available
   - Test retry logic
   - Test timeout handling
   - Test error responses

7. **Output Location**:
   - Place in `__tests__/integration/<module-path>/<filename>.test.js`

## Integration Test Patterns

### DAO Tests
```javascript
describe('MetricsDAO Integration', () => {
  const TEST_TENANT_ID = 'test-tenant-001';
  const TEST_KPI_ID = 'test-kpi-uuid';

  describe('getMetricById', () => {
    it('should return metric with all associations', async () => {
      const metric = await metricsDao.getMetricById(TEST_KPI_ID, TEST_TENANT_ID);

      expect(metric).toBeDefined();
      expect(metric.id).toBe(TEST_KPI_ID);
      expect(metric.dimensions).toBeInstanceOf(Array);
      expect(metric.category).toBeDefined();
    });

    it('should return null for non-existent metric', async () => {
      const metric = await metricsDao.getMetricById('invalid-id', TEST_TENANT_ID);
      expect(metric).toBeNull();
    });
  });

  describe('createMetric', () => {
    it('should create metric with associations', async () => {
      const metricData = {
        name: 'test_metric',
        client_id: TEST_TENANT_ID,
        category_id: 'test-category',
        // ... other fields
      };

      const metric = await metricsDao.createMetric(metricData);

      expect(metric).toBeDefined();
      expect(metric.id).toBeTruthy();

      // Cleanup
      await metric.destroy();
    });
  });
});
```

### Service Tests with Polaris
```javascript
describe('MetricsComparisonService Integration', () => {
  // Mock Polaris queries
  const mockPolarisQueryCall = jest.fn();

  beforeEach(() => {
    jest.mock('../../../src/models/polaris/common/common.model', () => ({
      polarisQueryCall: mockPolarisQueryCall
    }));
  });

  describe('getMetricsComparisonData', () => {
    it('should query Polaris and transform results', async () => {
      const mockPolarisResponse = {
        status: 200,
        data: [/* mock data */],
        success: true
      };
      mockPolarisQueryCall.mockResolvedValue(mockPolarisResponse);

      const result = await service.getMetricsComparisonData({
        kpis: ['kpi-1'],
        start_time: '2024-01-01',
        end_time: '2024-01-31',
        tenant_id: 'test-tenant'
      });

      expect(result).toBeDefined();
      expect(mockPolarisQueryCall).toHaveBeenCalled();
    });

    it('should use fallback query on 404', async () => {
      mockPolarisQueryCall
        .mockResolvedValueOnce({ status: 404, success: false })
        .mockResolvedValueOnce({ status: 200, data: [], success: true });

      const result = await service.getMetricsComparisonData({/*...*/});

      expect(mockPolarisQueryCall).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
    });
  });
});
```

### Multi-Module Integration
```javascript
describe('Insights Generation Flow Integration', () => {
  it('should create insight with metrics and dimensions', async () => {
    // Create test metric
    const metric = await metricsDao.createMetric({/*...*/});

    // Create test dimension
    const dimension = await dimensionsDao.createDimension({/*...*/});

    // Generate insight
    const insight = await insightsService.generateInsight({
      metric_id: metric.id,
      dimension_id: dimension.id,
      // ... other params
    });

    expect(insight).toBeDefined();
    expect(insight.metric_id).toBe(metric.id);

    // Verify relationships
    const insightWithRelations = await insightsDao.getInsightById(insight.id);
    expect(insightWithRelations.metric).toBeDefined();
    expect(insightWithRelations.dimension).toBeDefined();

    // Cleanup
    await insight.destroy();
    await dimension.destroy();
    await metric.destroy();
  });
});
```

## Test Data Management

### Use Fixtures
```javascript
// __tests__/fixtures/metrics.fixture.js
async function createTestMetric(overrides = {}) {
  return await Metric.create({
    name: 'test_metric',
    client_id: 'test-tenant',
    display_name: 'Test Metric',
    ...overrides
  });
}

async function cleanupTestMetrics() {
  await Metric.destroy({
    where: { client_id: 'test-tenant' }
  });
}
```

### Transaction Isolation
```javascript
describe('with transaction isolation', () => {
  let transaction;

  beforeEach(async () => {
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  it('should not affect other tests', async () => {
    await Model.create({/* data */}, { transaction });
    // Changes rolled back after test
  });
});
```

## Performance Considerations

- Use transactions for test isolation
- Clean up test data after each test suite
- Mock external APIs to avoid timeouts
- Use beforeAll for expensive setup
- Use afterAll for cleanup

## After Generation

1. Ensure test database is configured
2. Run tests: `npm test -- <test-file-path>`
3. Verify database cleanup (no orphaned records)
4. Check for test pollution (tests affecting each other)
5. Review test execution time
6. Commit with message: "test: add integration tests for <module>"

---

**Now, generate integration tests for the file the user specifies.**

Read the file, identify integration points, and create comprehensive tests.
