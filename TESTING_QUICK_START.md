# Testing Quick Start Guide

This guide helps you quickly get started with running tests for the metrics module.

## Prerequisites

1. **Install Dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Verify Jest Installation**:
   ```bash
   npm test -- --version
   ```
   Should output: `27.3.1`

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Types

```bash
# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only API tests
npm run test:api
```

### Run Specific Test Files

```bash
# Format functions tests
npm test -- __tests__/unit/controllers/metrics.controller.test.js

# MetricsComparisonService unit tests
npm test -- __tests__/unit/services/metrics/metricsComparison.service.test.js

# MetricsComparisonService integration tests
npm test -- __tests__/integration/services/metrics/metricsComparison.service.test.js
```

### Run Tests with Coverage

```bash
# Full coverage report
npm run test:coverage

# Coverage for specific file
npm test -- __tests__/unit/controllers/metrics.controller.test.js --coverage

# Coverage with HTML report (opens in browser)
npm run test:coverage
# Then open: coverage/lcov-report/index.html
```

### Watch Mode (Auto-rerun on changes)

```bash
npm run test:watch
```

In watch mode, press:
- `a` - Run all tests
- `f` - Run only failed tests
- `p` - Filter by filename pattern
- `t` - Filter by test name pattern
- `q` - Quit

### Run Specific Test Suites

```bash
# Run tests matching a pattern
npm test -- --testNamePattern="formatImpactValue"

# Run tests in a specific describe block
npm test -- --testNamePattern="Formatting Functions"
```

## Understanding Test Output

### Success Output
```
PASS __tests__/unit/controllers/metrics.controller.test.js
  ✓ formatImpactValue should format 1000 as "1k" (2ms)
  ✓ formatImpactPercentage should format 0.125 as "12.5%" (1ms)

Test Suites: 1 passed, 1 total
Tests:       140 passed, 140 total
```

### Coverage Report
```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   72.5  |   68.3   |   75.1  |   72.8  |
 controllers          |   85.2  |   82.1   |   88.3  |   85.4  |
  metrics.controller  |   85.2  |   82.1   |   88.3  |   85.4  |
 services/metrics     |   88.4  |   85.7   |   90.2  |   88.6  |
  metricsComparison   |   88.4  |   85.7   |   90.2  |   88.6  |
----------------------|---------|----------|---------|---------|
```

## Coverage Thresholds

Current thresholds (will fail if not met):
- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

## Test Files Generated

### Unit Tests
- ✅ `__tests__/unit/controllers/metrics.controller.test.js`
  - Tests for `formatImpactValue()` and `formatImpactPercentage()`
  - 140+ test cases covering edge cases

- ✅ `__tests__/unit/services/metrics/metricsComparison.service.test.js`
  - Tests for `calculateBreakupForRatioMetrics()`
  - Tests for `getSortedDimensionsBreakup()`
  - Tests for `getDefaultTimeRange()`
  - 80+ test cases

### Integration Tests
- ✅ `__tests__/integration/services/metrics/metricsComparison.service.test.js`
  - Tests for `getMetricsComparisonData()` with mocked Polaris
  - 404 fallback logic tests
  - Empty result set handling
  - Error scenario tests
  - 15+ integration scenarios

## Troubleshooting

### Issue: "Cannot find module"
**Solution**: Run `npm install` to install dependencies

### Issue: "jest: command not found"
**Solution**: Use `npm test` instead of running `jest` directly

### Issue: Tests timeout
**Solution**: Default timeout is 240 seconds. To increase:
```javascript
jest.setTimeout(300000); // 5 minutes
```

### Issue: Database connection errors
**Solution**: Ensure your `.env` file has correct database credentials

### Issue: Tests affecting each other
**Solution**: Ensure proper cleanup in `afterEach()` or use transactions

## Next Steps (Following TESTING_ROADMAP.md)

✅ **Phase 2 Complete**: Critical Path Testing
- [x] Formatting Functions
- [x] Metrics Comparison Service

🔄 **Phase 3 Next**: Data Access Layer (Week 5-6)
- [ ] Tests for `kpi.operational.dao.js`
- [ ] Tests for `dimension.dao.js`
- [ ] Tests for `insight.dao.js`

Use slash commands to continue:
```bash
/test-integration src/models/postgres/metrics/kpi.operational.dao.js "Generate integration tests..."
```

## Useful Commands

```bash
# Run tests and generate HTML report
npm run test:coverage && open coverage/index.html

# Run tests in CI mode (no watch, with coverage)
npm run test:ci

# Run single test file in watch mode
npm test -- __tests__/unit/controllers/metrics.controller.test.js --watch

# Update snapshots (if using snapshot testing)
npm test -- -u

# Show test execution time
npm test -- --verbose

# Run tests with debugging
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Pro Tips

1. **Write tests first** - TDD helps design better APIs
2. **Keep tests fast** - Mock external dependencies
3. **Use descriptive names** - Test names should explain what/why
4. **One assertion per test** - Makes failures easier to debug
5. **Clean up test data** - Use `afterEach()` or transactions
6. **Check coverage regularly** - Aim for 80%+ on critical paths

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)
- [TESTING_ROADMAP.md](./TESTING_ROADMAP.md) - Full testing plan
- [Metrics Context](./src/test/test-contexts/metrics.context.md) - Domain knowledge

---

**Happy Testing! 🧪**
