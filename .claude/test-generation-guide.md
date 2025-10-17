# Test Generation Guide for Developers

## Quick Start: Generate Tests with AI Agents

This guide helps you automatically generate maintainable tests using AI agents whenever you add features or refactor code.

---

## 🎯 Philosophy

**Tests should be as easy to generate as writing a prompt**. When you change code, you shouldn't manually write boilerplate tests—let AI agents do it for you while maintaining quality and consistency.

---

## 📁 Test Organization

```bash
__tests__/
├── api/              # API contract tests (existing)
├── unit/             # Pure function & business logic tests
│   ├── services/
│   ├── utils/
│   └── controllers/
├── integration/      # Tests with DB/external dependencies
│   ├── dao/
│   └── services/
├── fixtures/         # Shared test data
└── helpers/          # Test utilities

src/test/
├── jest.setup.js     # Test configuration
├── global.setup.js   # Database setup
└── test-contexts/    # Context files for test generation
    ├── metrics.context.md
    ├── insights.context.md
    └── common.context.md
```

---

## 🤖 How to Generate Tests

### Step 1: Identify What Changed

Whenever you modify code, ask yourself:

- Did I add a new function/method?
- Did I change business logic?
- Did I add a new API endpoint?
- Did I modify data transformations?

### Step 2: Use the Right Agent Command

We provide specialized slash commands for test generation:

```bash
# For unit tests (pure functions, utilities)
/test-unit <file-path> "<description of what changed>"

# For integration tests (DAOs, services with DB)
/test-integration <file-path> "<description of what changed>"

# For API tests (new endpoints)
/test-api <route-file-path> "<description of new endpoint>"

# For refactoring (update existing tests)
/test-update <test-file-path> "<description of refactor>"
```

---

## 📝 Example Usage

### Example 1: New Utility Function

**You wrote:**

```javascript
// src/utils/common/number.js
function formatCurrency(amount, currencyCode = 'USD') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  });
  return formatter.format(amount);
}
```

**Generate tests:**

```bash
/test-unit src/utils/common/number.js "Added formatCurrency function that formats numbers as currency with locale support"
```

**Agent will create:**

`__tests__/unit/utils/number.test.js` with:

- Tests for different currency codes
- Tests for edge cases (0, negative, very large numbers)
- Tests for null/undefined handling
- Tests for decimal precision

---

### Example 2: New Service Method

**You wrote:**

```javascript
// src/services/metrics/metricsAggregation.service.js
async getMetricsByCategory(categoryId, startDate, endDate) {
  // Complex aggregation logic
}
```

**Generate tests:**

```bash
/test-integration src/services/metrics/metricsAggregation.service.js "Added getMetricsByCategory method that aggregates metrics within a date range for a specific category"
```

**Agent will create:**

- Unit tests for the business logic
- Integration tests with mocked DB calls
- Tests for date boundary conditions
- Tests for empty result sets

---

### Example 3: New API Endpoint

**You added:**

```javascript
// src/routes/v1/metrics_hub/metrics.route.js
router.get('/:id/trend', metricsController.getTrendData);
```

**Generate tests:**

```bash
/test-api src/routes/v1/metrics_hub/metrics.route.js "Added GET /:id/trend endpoint that returns historical trend data for a metric"
```

**Agent will create:**

- Happy path tests (200 OK)
- Authentication tests (401)
- Validation tests (400)
- Not found tests (404)
- Response schema validation

---

### Example 4: Refactored Existing Code

**You refactored:**

```javascript
// Before: formatImpactValue(value)
// After: formatImpactValue(value, options = {})
// Now supports: { precision, notation, locale }
```

**Update tests:**

```bash
/test-update __tests__/unit/controllers/metrics.controller.test.js "Updated formatImpactValue to accept options parameter with precision, notation, and locale"
```

**Agent will:**

- Update existing tests to use new signature
- Add new tests for options parameter
- Keep existing coverage intact

---

## 🧬 Test Context Files

Context files help agents understand your codebase patterns. They're located in `src/test/test-contexts/`.

### What's in a Context File?

```markdown
# Metrics Module Context

## Key Patterns
- All metric calculations use BigQuery/Polaris
- Ratio metrics = numerator / denominator
- Always handle division by zero
- Format with formatImpactValue/Percentage

## Common Dependencies
- mathjs for expressions
- moment for dates
- Sequelize for DB

## Edge Cases to Always Test
- Null/undefined values
- Empty arrays
- Division by zero
- Very large numbers (>1T)
- Very small decimals (<0.001)

## Test Data Fixtures
- Use fixtures/metrics.fixture.js
- Sample tenant: 'test-tenant-001'
- Sample KPI IDs: See fixtures

## Mocking Patterns
- Mock polarisQueryCall for DB queries
- Mock sendTrackingEvent for analytics
- Use jest.fn() for callbacks
```

Agents read these files to generate contextually appropriate tests.

---

## ✅ What Makes a Good Test Generation Prompt?

### ❌ Bad Prompts

```bash
"Generate tests for metrics controller"
"Test the new function"
"Add tests"
```

### ✅ Good Prompts

```bash
"Generate unit tests for calculateRatioMetric function in MetricsComparisonService. It divides numerator by denominator arrays element-wise and handles mismatched lengths."

"Create integration tests for getMetricsByDimension DAO method. It queries Polaris with dimension filters and returns time-series data. Test with valid dimensions, null dimensions, and empty results."

"Generate API tests for POST /v1/insights/:id/feedback endpoint. It accepts feedback_ishelpful (boolean) and feedback_comment (string). Test validation, authentication, and success cases."
```

**Good prompts include:**

1. **What** you're testing (function/method name)
2. **Where** it is (file/class)
3. **What it does** (brief description)
4. **Key behaviors** (handles X, validates Y, returns Z)

---

## 🎨 Test Templates

Agents use these templates. You can reference them in your prompts.

### Unit Test Template

```javascript
describe('<Module/Class>', () => {
  describe('<function/method>', () => {
    // Happy path
    it('should <expected behavior> when <condition>', () => {});

    // Edge cases
    it('should handle null/undefined gracefully', () => {});
    it('should handle empty arrays/objects', () => {});

    // Error cases
    it('should throw error when <invalid condition>', () => {});
  });
});
```

### Integration Test Template

```javascript
describe('<Service/DAO> Integration', () => {
  beforeAll(async () => {
    // Setup test DB, fixtures
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('<method>', () => {
    it('should <behavior> with valid data', async () => {});
    it('should handle database errors', async () => {});
  });
});
```

### API Test Template

```javascript
describe('<Endpoint> API', () => {
  const TEST_SESSION_COOKIE = signIn();

  it('should return 200 with valid request', async () => {
    const response = await request
      .get('/v1/...')
      .set('Cookie', [`session=${TEST_SESSION_COOKIE}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({...});
  });

  it('should return 400 with invalid params', async () => {});
  it('should return 401 without authentication', async () => {});
});
```

---

## 🔄 Continuous Test Maintenance

### When to Regenerate Tests

1. **After PR Reviews**: If reviewers find edge cases

   ```bash
   /test-update <test-file> "Add test for edge case: negative metric values"
   ```

2. **After Bug Fixes**: Generate regression tests

   ```bash
   /test-unit <file> "Add regression test for bug #1234: division by zero in ratio calculation"
   ```

3. **API Contract Changes**: Update API tests

   ```bash
   /test-update __tests__/api/metrics.test.js "Updated response schema to include new 'trend_direction' field"
   ```

4. **Deprecations**: Mark and replace tests

   ```bash
   /test-update <test-file> "Replace deprecated formatValue with new formatImpactValue"
   ```

---

## 📊 Test Coverage Goals

Agents aim for these coverage targets:

| Layer | Target | Priority |
|-------|--------|----------|
| Utils | 90% | Critical |
| Services | 85% | High |
| Controllers | 70% | Medium |
| DAOs | 75% | High |
| Routes | 80% | Medium |

Check coverage:

```bash
npm test -- --coverage
```

---

## 🚨 Common Pitfalls & Solutions

### Pitfall 1: Over-mocking

**Problem**: Tests pass but don't catch real bugs
**Solution**: Use integration tests for critical paths

### Pitfall 2: Brittle tests

**Problem**: Tests break on unrelated changes
**Solution**: Test behavior, not implementation

### Pitfall 3: Slow tests

**Problem**: Test suite takes too long
**Solution**: Mock external services, use test DB

### Pitfall 4: Flaky tests

**Problem**: Tests randomly fail
**Solution**: Avoid time dependencies, seed random data

---

## 🎓 Advanced: Custom Test Generators

You can create module-specific test generators:

```bash
# Create custom generator
/create-test-generator metrics-comparison "Specialized generator for metrics comparison tests with ratio calculations"
```

This creates a reusable agent that knows your module's specific patterns.

---

## 📚 Further Reading

- `test-contexts/metrics.context.md` - Metrics module patterns
- `test-contexts/insights.context.md` - Insights module patterns
- `test-contexts/common.context.md` - Common testing patterns
- `fixtures/README.md` - How to use test fixtures

---

## 🆘 Need Help?

If tests aren't generating correctly:

1. Check your prompt includes enough detail
2. Make sure the context file for your module exists
3. Verify the file path is correct
4. Ask: "Why didn't this test generate correctly?" with the prompt you used

---

## 🎯 Quick Reference

```bash
# Generate unit tests
/test-unit <file> "<description>"

# Generate integration tests
/test-integration <file> "<description>"

# Generate API tests
/test-api <route-file> "<description>"

# Update existing tests
/test-update <test-file> "<changes>"

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- <test-file>
```

---

**Remember**: Good tests are generated from good prompts. Take 30 seconds to write a clear description, save hours of manual test writing!
