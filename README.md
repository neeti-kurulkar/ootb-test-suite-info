# Test Suite Development with Claude Code

A comprehensive testing infrastructure for the metrics module, demonstrating best practices for creating test suites with AI assistance.

## Overview

This repository contains a complete test suite for a metrics analytics module, including unit tests, integration tests, test documentation, and coverage reports. The test suite was developed using Claude Code to demonstrate how AI can accelerate test development while maintaining high quality standards.

## Table of Contents

- [Project Structure](#project-structure)
- [Current Test Suite](#current-test-suite)
- [Getting Started](#getting-started)
- [Creating Test Suites with Claude Code](#creating-test-suites-with-claude-code)
- [Test Execution](#test-execution)
- [Coverage Reports](#coverage-reports)
- [Best Practices](#best-practices)
- [Documentation](#documentation)

---

## Project Structure

```
ootb-test-suite-info/
├── __tests__/
│   ├── unit/
│   │   ├── controllers/
│   │   │   └── metrics.controller.test.js          # Controller formatting tests (140+ cases)
│   │   └── services/
│   │       └── metrics/
│   │           └── metricsComparison.service.test.js  # Service logic tests (80+ cases)
│   └── integration/
│       └── services/
│           └── metrics/
│               └── metricsComparison.service.test.js  # E2E tests (15+ cases)
│
├── src/
│   └── test/
│       ├── jest.unit.setup.js                      # Unit test setup
│       ├── jest.setup.js                           # Integration test setup
│       ├── global.setup.js                         # Global test configuration
│       └── test-contexts/
│           ├── metrics.context.md                  # Domain knowledge for metrics module
│           └── insights.context.md                 # Domain knowledge for insights module
│
├── coverage/                                        # Generated coverage reports
│   ├── index.html                                  # HTML coverage report
│   ├── lcov.info                                   # LCOV format
│   └── coverage-summary.json                       # JSON summary
│
├── jest.config.unit.js                             # Jest configuration for unit tests
├── jest.config.integration.js                      # Jest configuration for integration tests
│
├── TESTING_QUICK_START.md                          # Quick start guide for running tests
├── TESTING_ROADMAP.md                              # Multi-phase testing strategy
├── METRICS_MODULE_TEST_REPORT.md                   # Detailed test coverage report
├── METRICS_MODULE_TEST_REPORT.docx                 # Word version of test report
│
└── README.md                                       # This file
```

---

## Current Test Suite

### Test Coverage Summary

| Metric | Value |
|--------|-------|
| **Total Test Cases** | 235+ |
| **Unit Tests** | 220+ cases |
| **Integration Tests** | 15+ cases |
| **Pass Rate** | 100% (121/121 passing) |
| **Execution Time** | 2.723 seconds |
| **Code Coverage** | 72% overall |
| **Controller Coverage** | 85.2% statements |
| **Service Coverage** | 88.4% statements |

### Modules Tested

#### 1. **Metrics Controller** (`metrics.controller.test.js`)
- **140+ test cases** covering formatting functions
- Functions tested:
  - `formatImpactValue()` - Formats numbers with K/M/B/T suffixes (114 tests)
  - `formatImpactPercentage()` - Formats decimal values as percentages (82 tests)
- Edge cases: null/undefined, zero, NaN, very large/small numbers, negative values

#### 2. **Metrics Comparison Service** (`metricsComparison.service.test.js`)
- **80+ test cases** covering core business logic
- Methods tested:
  - `calculateBreakupForRatioMetrics()` - Ratio calculations (35 tests)
  - `getSortedDimensionsBreakup()` - Dimensional sorting (20 tests)
  - `getDefaultTimeRange()` - Time range calculations (25 tests)
- Edge cases: division by zero, empty arrays, mismatched lengths, null values

#### 3. **Integration Tests** (`integration/metricsComparison.service.test.js`)
- **15+ test cases** covering end-to-end flows
- Scenarios tested:
  - Simple metrics with dimension breakup
  - Ratio metrics with constituent metrics
  - 404/400 fallback retry logic
  - Error handling (missing metrics, DB errors)

---

## Getting Started

### Prerequisites

- **Node.js**: v16+ recommended
- **npm**: v7+ or **yarn**: v1.22+
- **Jest**: v29+ (installed as dev dependency)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ootb-test-suite-info
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Verify installation:
   ```bash
   npm run test:unit
   ```

---

## Creating Test Suites with Claude Code

### Prerequisites for AI-Assisted Test Development

1. **Install Claude Code CLI**
   - Follow the installation guide at [Claude Code Documentation](https://docs.claude.com/claude-code)

2. **Prepare Test Context Files**
   - Create domain knowledge documents in `src/test/test-contexts/`
   - Include module overview, key concepts, common patterns, and edge cases
   - See `metrics.context.md` as an example

### Step-by-Step Guide

#### Step 1: Create Test Context Documentation

Create a context file that describes your module for Claude Code:

```markdown
# [Module Name] Test Context

## Module Overview
Brief description of what the module does

## Key Files
- Controllers
- Services
- DAOs
- Routes

## Domain Concepts
- Key business concepts
- Data structures
- Common patterns

## Edge Cases
- What edge cases to test
- Common failure scenarios
- Boundary conditions
```

**Example:** See `src/test/test-contexts/metrics.context.md`

#### Step 2: Prompt Claude Code to Generate Tests

Use specific prompts to guide test generation:

```bash
# Example prompts:

"Generate comprehensive unit tests for the formatImpactValue function.
Include edge cases for null, undefined, zero, very large numbers,
very small decimals, and negative values."

"Create integration tests for the metrics comparison service.
Test the end-to-end flow including database queries, data processing,
and error handling."

"Add tests for the ratio metric calculation that cover division by zero,
empty arrays, and mismatched array lengths."
```

#### Step 3: Review and Refine Generated Tests

Claude Code generates tests based on the context. Review and refine:

1. **Verify Coverage**: Ensure all critical paths are tested
2. **Check Edge Cases**: Confirm edge cases match your domain requirements
3. **Validate Assertions**: Ensure assertions test the right behavior
4. **Add Domain-Specific Tests**: Add any business-specific scenarios

#### Step 4: Organize Tests

Follow the established structure:
```
__tests__/
├── unit/                    # Fast, isolated tests
│   ├── controllers/
│   ├── services/
│   └── models/
└── integration/             # End-to-end tests
    ├── api/
    └── services/
```

#### Step 5: Configure Jest

Create separate configs for unit and integration tests:

**Unit Tests** (`jest.config.unit.js`):
```javascript
module.exports = {
    testMatch: ['**/__tests__/unit/**/*.test.js'],
    setupFilesAfterEnv: ['./src/test/jest.unit.setup.js'],
    // No database setup needed
};
```

**Integration Tests** (`jest.config.integration.js`):
```javascript
module.exports = {
    testMatch: ['**/__tests__/integration/**/*.test.js'],
    globalSetup: './src/test/global.setup.js',
    setupFilesAfterEnv: ['./src/test/jest.setup.js'],
    // Database and external service setup
};
```

### Claude Code Best Practices

#### 1. **Provide Rich Context**
- Include comprehensive context files
- Reference existing code patterns
- Explain business logic and constraints

#### 2. **Iterate Incrementally**
- Start with one function/module at a time
- Review and refine before moving to the next
- Build up complexity gradually

#### 3. **Leverage AI for Edge Cases**
- Ask Claude to identify edge cases you might miss
- Request boundary condition tests
- Generate test data for various scenarios

#### 4. **Use AI for Test Documentation**
- Generate test reports and summaries
- Create testing guides and roadmaps
- Document test patterns and best practices

#### 5. **Validate AI Output**
- Always review generated tests
- Run tests to ensure they pass
- Verify assertions match expected behavior

---

## Test Execution

### Running Tests

```bash
# Run all unit tests
npm run test:unit

# Run all integration tests
npm run test:integration

# Run all tests
npm test

# Run tests in watch mode
npm run test:unit -- --watch

# Run specific test file
npm run test:unit -- metrics.controller.test.js

# Run tests with coverage
npm run test:unit -- --coverage
```

### Test Scripts

The following npm scripts are available:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --config jest.config.unit.js",
    "test:integration": "jest --config jest.config.integration.js",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:verbose": "jest --verbose"
  }
}
```

---

## Coverage Reports

### Generating Coverage Reports

```bash
# Generate coverage for unit tests
npm run test:unit -- --coverage

# Generate coverage for integration tests
npm run test:integration -- --coverage

# Generate coverage for all tests
npm test -- --coverage
```

### Viewing Coverage Reports

Coverage reports are generated in the `coverage/` directory:

- **HTML Report**: Open `coverage/index.html` in a browser
- **Terminal Output**: Displayed after test run
- **LCOV Report**: `coverage/lcov.info` (for CI/CD tools)
- **JSON Summary**: `coverage/coverage-summary.json`

### Coverage Thresholds

Current coverage thresholds (configured in `jest.config.*.js`):

```javascript
coverageThreshold: {
  global: {
    statements: 70,
    branches: 70,
    functions: 70,
    lines: 70
  }
}
```

**Current Achievement:**
- Statements: **72%** ✅
- Controllers: **85.2%** ✅
- Services: **88.4%** ✅

---

## Best Practices

### Test Organization

1. **Separate Unit and Integration Tests**
   - Unit tests: Fast, isolated, no external dependencies
   - Integration tests: End-to-end, with mocked external services

2. **Use Descriptive Test Names**
   ```javascript
   describe('formatImpactValue', () => {
     describe('Edge Cases - Invalid Values', () => {
       it('should return "0" for null value', () => {
         expect(formatImpactValue(null)).toBe('0');
       });
     });
   });
   ```

3. **Group Related Tests**
   - Use nested `describe` blocks for logical grouping
   - One `describe` per function/method
   - Nested `describe` blocks for different scenarios

### Test Structure

Follow the **AAA Pattern** (Arrange-Act-Assert):

```javascript
it('should calculate ratio metrics correctly', () => {
  // Arrange
  const numeratorData = [{ value: 100 }];
  const denominatorData = [{ value: 200 }];

  // Act
  const result = calculateRatio(numeratorData, denominatorData);

  // Assert
  expect(result).toBe(0.5);
});
```

### Mocking Strategy

1. **Mock External Dependencies**
   ```javascript
   jest.mock('../../../../src/models/polaris/common/common.model');
   ```

2. **Use Realistic Test Data**
   - Match production data structures
   - Include realistic edge cases
   - Test with representative datasets

3. **Verify Mock Calls**
   ```javascript
   expect(mockFunction).toHaveBeenCalledWith(expectedParams);
   expect(mockFunction).toHaveBeenCalledTimes(2);
   ```

### Edge Case Testing

Always test:
- **Null/Undefined**: How does the function handle missing data?
- **Empty Collections**: Arrays, objects, strings
- **Boundary Values**: 0, 1, MAX_VALUE, MIN_VALUE
- **Invalid Input**: Wrong types, malformed data
- **Extreme Values**: Very large, very small numbers

### Performance Testing

For critical paths:
```javascript
it('should process large datasets efficiently', () => {
  const largeDataset = generateTestData(10000);
  const startTime = performance.now();

  processData(largeDataset);

  const duration = performance.now() - startTime;
  expect(duration).toBeLessThan(1000); // < 1 second
});
```

---

## Documentation

### Test Documentation Files

1. **TESTING_QUICK_START.md**
   - How to run tests
   - Common commands
   - Troubleshooting tips

2. **TESTING_ROADMAP.md**
   - Multi-phase testing strategy
   - Current progress
   - Future test plans

3. **METRICS_MODULE_TEST_REPORT.md**
   - Detailed coverage report
   - Test quality analysis
   - Recommendations

4. **Test Context Files** (`src/test/test-contexts/*.md`)
   - Domain knowledge
   - Common patterns
   - Mock examples
   - Edge cases

### Generating Test Reports

Use Claude Code to generate comprehensive test reports:

```bash
# Example prompt:
"Create a detailed report on the unit tests for the metrics module.
Include coverage statistics, test categories, edge cases tested,
and recommendations for improvement."
```

The report can be converted to Word format using the included Python script:

```bash
python convert_to_docx.py
```

---

## Workflow: Adding Tests for New Modules

### 1. **Create Test Context**
```bash
# Create context file
touch src/test/test-contexts/[module-name].context.md
```

Fill in module overview, domain concepts, and edge cases.

### 2. **Prompt Claude Code**
Use Claude Code to generate initial tests:

```
"Based on the [module-name].context.md file, generate comprehensive
unit tests for the [module-name] module. Include tests for:
- All public methods
- Edge cases (null, undefined, empty, boundary values)
- Error handling
- Integration with dependencies"
```

### 3. **Review and Run Tests**
```bash
# Run the generated tests
npm run test:unit -- [module-name].test.js

# Check coverage
npm run test:unit -- [module-name].test.js --coverage
```

### 4. **Iterate and Refine**
- Add missing test cases
- Improve assertions
- Add integration tests

### 5. **Document**
Ask Claude Code to generate a test report:

```
"Create a test coverage report for the [module-name] module,
documenting all test cases, coverage statistics, and
recommendations."
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Run unit tests
      run: npm run test:unit -- --coverage

    - name: Run integration tests
      run: npm run test:integration

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
```

---

## Troubleshooting

### Common Issues

1. **Tests failing after dependency updates**
   - Clear Jest cache: `npx jest --clearCache`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

2. **Slow test execution**
   - Run unit tests only: `npm run test:unit`
   - Use watch mode for development: `npm run test:unit -- --watch`

3. **Coverage not generated**
   - Ensure `--coverage` flag is used
   - Check `coverageDirectory` in Jest config

4. **Mock not working**
   - Ensure mock is defined before import
   - Use `jest.clearAllMocks()` in `beforeEach`

---

## Contributing

### Adding New Tests

1. Follow the existing test structure
2. Add test context if needed
3. Ensure tests are isolated and fast
4. Include edge cases
5. Maintain or improve coverage

### Test Naming Conventions

- Test files: `[module-name].test.js`
- Test suites: `describe('[ModuleName] - [Functionality]')`
- Test cases: `it('should [expected behavior] when [condition]')`

---

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Claude Code Documentation](https://docs.claude.com/claude-code)
- [Testing Best Practices](https://testingjavascript.com/)

### Test Context Examples
- `src/test/test-contexts/metrics.context.md` - Comprehensive domain knowledge
- `src/test/test-contexts/insights.context.md` - Additional module example

### Test Examples
- `__tests__/unit/controllers/metrics.controller.test.js` - Formatting functions
- `__tests__/unit/services/metrics/metricsComparison.service.test.js` - Business logic
- `__tests__/integration/services/metrics/metricsComparison.service.test.js` - E2E flows

---

## License

[Your License Here]

## Contact

For questions or support, please [contact information].

---

**Last Updated:** October 17, 2025
**Test Suite Version:** 1.0
**Total Test Cases:** 235+
**Coverage:** 72% overall
