# Claude Code Configuration for SaaS Backend

This directory contains AI-powered tools and workflows for the SaaS Backend project.

## 🎯 Quick Start

### Generate Tests for New Code

```bash
# Unit test
/test-unit src/utils/common/formatters.js "Added formatCurrency function"

# Integration test
/test-integration src/services/metrics/metricsComparison.service.js "Added getDimensionBreakup method"

# API test
/test-api src/routes/v1/metrics_hub/metrics.route.js "Added GET /:id/trend endpoint"

# Update existing test
/test-update __tests__/unit/utils/formatters.test.js "Updated formatValue to support precision parameter"
```

## 📁 Directory Structure

```bash
.claude/
├── README.md                          # This file
├── test-generation-guide.md           # Comprehensive guide for developers
├── commands/                          # Slash commands for test generation
│   ├── test-unit.md                   # Generate unit tests
│   ├── test-integration.md            # Generate integration tests
│   ├── test-api.md                    # Generate API tests
│   └── test-update.md                 # Update existing tests
└── (future: hooks, templates, etc.)

src/test/test-contexts/
├── metrics.context.md                 # Metrics module context for AI
├── insights.context.md                # Insights module context for AI
└── common.context.md                  # Common patterns (to be created)
```

## 🤖 Available Commands

### `/test-unit`

Generates unit tests for pure functions, utilities, and business logic.

**Usage:**

```bash
/test-unit <file-path> "<description of what to test>"
```

**Example:**

```bash
/test-unit src/controllers/metrics.controller.js "Generate tests for formatImpactValue and formatImpactPercentage functions"
```

**Generates:**

- `__tests__/unit/controllers/metrics.controller.test.js`
- Tests for happy paths, edge cases, error handling
- Parameterized tests for multiple input scenarios
- Proper mocking of dependencies

---

### `/test-integration`

Generates integration tests for DAOs, services with database dependencies, and multi-module interactions.

**Usage:**

```bash
/test-integration <file-path> "<description of what to test>"
```

**Example:**

```bash
/test-integration src/models/postgres/metrics/kpi.operational.dao.js "Generate tests for CRUD operations with database"
```

**Generates:**

- `__tests__/integration/dao/kpi.operational.dao.test.js`
- Database setup/teardown
- Transaction management
- Tests with real database interactions (or mocked)

---

### `/test-api`

Generates API endpoint tests for route files.

**Usage:**

```bash
/test-api <route-file-path> "<description of endpoints>"
```

**Example:**

```bash
/test-api src/routes/v1/metrics_hub/metrics.route.js "Generate tests for all metrics API endpoints"
```

**Generates:**

- `__tests__/api/metrics.test.js`
- Tests for all HTTP methods (GET, POST, PUT, DELETE)
- Authentication tests (401)
- Validation tests (400)
- Success tests (200/201)
- Response schema validation

---

### `/test-update`

Updates existing tests after refactoring or adding new features.

**Usage:**

```bash
/test-update <test-file-path> "<description of changes>"
```

**Example:**

```bash
/test-update __tests__/unit/services/metricsComparison.service.test.js "Updated to handle new options parameter with precision and locale"
```

**Updates:**

- Existing tests to match new signatures
- Adds tests for new functionality
- Removes obsolete tests
- Maintains test coverage

## 📖 Documentation

### For Developers

- **[Test Generation Guide](test-generation-guide.md)** - Complete guide on using AI to generate tests
  - How to write effective prompts
  - Test organization structure
  - Best practices and patterns
  - Common pitfalls to avoid

### For AI Agents

- **[Metrics Context](../src/test/test-contexts/metrics.context.md)** - Domain knowledge for metrics module
- **[Insights Context](../src/test/test-contexts/insights.context.md)** - Domain knowledge for insights module

These context files help AI understand your codebase patterns, common edge cases, and testing conventions.

## 🎨 Test Organization

```bash
__tests__/
├── api/                               # API contract tests
│   ├── insights.test.js               # Existing
│   ├── metrics.test.js                # To be generated
│   └── ...
├── unit/                              # Unit tests (new)
│   ├── services/
│   │   ├── metricsComparison.service.test.js
│   │   └── metricsDimensionalData.service.test.js
│   ├── utils/
│   │   ├── formatters.test.js
│   │   └── dateTime.test.js
│   └── controllers/
│       ├── metrics.controller.test.js
│       └── insights.controller.test.js
├── integration/                       # Integration tests (new)
│   ├── dao/
│   │   ├── metrics.dao.test.js
│   │   └── insights.dao.test.js
│   └── services/
│       └── metricsComparison.integration.test.js
└── fixtures/                          # Test data fixtures (new)
    ├── metrics.fixture.js
    ├── insights.fixture.js
    └── README.md
```

## 🚀 Getting Started

### 1. Read the Guide

Start with the [Test Generation Guide](test-generation-guide.md) to understand:

- When to use which command
- How to write good prompts
- Testing patterns and conventions

### 2. Try a Simple Test

Generate your first test:

```bash
/test-unit src/utils/metrics/metrics.service.js "Generate tests for metricDataBuilder and dimensionBuilder functions"
```

### 3. Review and Run

```bash
npm test -- __tests__/unit/utils/metrics/metrics.service.test.js
```

### 4. Iterate on Generated Tests

If the generated tests don't match your needs:

- Improve your prompt (be more specific)
- Update the context file for your module
- Use `/test-update` to refine the tests

## 🧠 How It Works

### AI Context System

When you use a test command, the AI:

1. **Reads your prompt** - Understands what you want to test
2. **Reads the source file** - Analyzes the code structure
3. **Reads the context file** - Learns module-specific patterns
4. **Applies templates** - Uses proven test patterns
5. **Generates tests** - Creates comprehensive, maintainable tests

### Context Files

Located in `src/test/test-contexts/`, these files teach the AI about:

- Module-specific patterns (e.g., ratio metric calculations)
- Common edge cases (e.g., division by zero, null values)
- Database schemas and mock patterns
- Validation rules and error scenarios
- Test data fixtures to use

**Add a new context file** when starting a new module:

```markdown
# MyModule Context

## Overview
What does this module do?

## Key Patterns
Common code patterns in this module

## Edge Cases
What edge cases should always be tested?

## Test Data
Sample fixtures and test constants

## Mocking Patterns
How to mock dependencies in this module
```

## 📊 Test Coverage Goals

| Layer | Target | Status |
|-------|--------|--------|
| Utils | 90% | 🔴 To Do |
| Services | 85% | 🔴 To Do |
| Controllers | 70% | 🔴 To Do |
| DAOs | 75% | 🔴 To Do |
| Routes (API) | 80% | 🟡 Partial |

Check current coverage:

```bash
npm test -- --coverage
```

## 🔄 Workflow Integration

### During Development

```bash
# 1. Write new feature
vim src/services/myFeature.service.js

# 2. Generate tests
/test-unit src/services/myFeature.service.js "Added calculateSomething method that does X, Y, Z"

# 3. Run tests
npm test

# 4. Commit together
git add src/services/myFeature.service.js __tests__/unit/services/myFeature.service.test.js
git commit -m "feat: add calculateSomething method with tests"
```

### During Refactoring

```bash
# 1. Refactor code
vim src/services/myFeature.service.js

# 2. Update tests
/test-update __tests__/unit/services/myFeature.service.test.js "Refactored calculateSomething to accept options parameter"

# 3. Verify tests pass
npm test

# 4. Commit
git commit -m "refactor: improve calculateSomething with options parameter"
```

### After Bug Fix

```bash
# 1. Fix bug
vim src/services/myFeature.service.js

# 2. Add regression test
/test-update __tests__/unit/services/myFeature.service.test.js "Add regression test for bug #1234: handle null input"

# 3. Verify fix
npm test

# 4. Commit
git commit -m "fix: handle null input in calculateSomething (#1234)"
```

## 🎓 Best Practices

### 1. Write Descriptive Prompts

❌ Bad:

```bash
/test-unit src/utils/format.js "test formatValue"
```

✅ Good:

```bash
/test-unit src/utils/format.js "Generate tests for formatValue function that formats numbers with K/M/B suffixes. Test edge cases: 0, null, very large numbers (>1T), very small decimals (<0.001)"
```

### 2. Use Context Files

Add module-specific patterns to context files instead of repeating them in prompts.

### 3. Review Generated Tests

Always review and run generated tests before committing:

- Verify test logic is correct
- Check edge cases are appropriate
- Ensure test names are descriptive
- Validate mocks are set up correctly

### 4. Iterate

If generated tests aren't perfect:

- Refine your prompt
- Update context files
- Use `/test-update` to improve

### 5. Maintain Context Files

When you discover new edge cases or patterns:

- Add them to the context file
- Future test generations will be better

## 🐛 Troubleshooting

### Tests Don't Generate

**Problem:** No output or error

**Solution:**

- Check file path is correct (must be absolute or relative to project root)
- Ensure `.claude/commands/test-*.md` files exist
- Try a simpler prompt first

### Tests Are Incorrect

**Problem:** Generated tests don't match expectations

**Solution:**

- Provide more detail in your prompt
- Check if context file exists for this module
- Review and edit manually, then use `/test-update` next time

### Tests Don't Run

**Problem:** `npm test` fails

**Solution:**

- Check imports are correct
- Verify test file is in correct location
- Ensure mocks are set up properly
- Check for syntax errors

### Coverage Is Low

**Problem:** Not hitting coverage targets

**Solution:**

- Generate tests for untested files
- Use `/test-update` to add missing edge cases
- Review coverage report: `npm test -- --coverage`

## 🔮 Future Enhancements

### Planned Features

- [ ] `/test-e2e` - Generate end-to-end tests
- [ ] `/test-performance` - Generate performance tests
- [ ] `/test-fixtures` - Generate test data fixtures
- [ ] `/test-analyze` - Analyze coverage gaps and suggest tests
- [ ] `/test-refactor` - Refactor existing tests for better maintainability
- [ ] Custom test generators per module
- [ ] Auto-generate tests on file save (watch mode)
- [ ] Integration with CI/CD for test generation

### Custom Generators

Create specialized generators for complex domains:

```bash
/create-test-generator metrics-comparison "Specialized generator for metrics comparison tests with ratio calculations and dimensional breakups"
```

## 📚 Additional Resources

- **Jest Documentation**: [https://jestjs.io/docs/getting-started](https://jestjs.io/docs/getting-started)
- **Supertest Documentation**: [https://github.com/visionmedia/supertest](https://github.com/visionmedia/supertest)
- **Testing Best Practices**: [https://testingjavascript.com/](https://testingjavascript.com/)

## 🤝 Contributing

### Adding New Test Commands

1. Create command file in `.claude/commands/`
2. Follow existing command structure
3. Add documentation to this README
4. Test with sample prompts

### Improving Context Files

1. Identify common patterns in your module
2. Add to `src/test/test-contexts/<module>.context.md`
3. Include edge cases and examples
4. Test by generating new tests

### Updating Templates

1. Identify improvements to test templates
2. Update relevant command files
3. Test with real-world scenarios
4. Document changes

## 📞 Support

If you encounter issues or have questions:

1. Check the [Test Generation Guide](test-generation-guide.md)
2. Review context files for examples
3. Ask: "How do I generate tests for [specific scenario]?"

## 📝 License

Internal use only - Part of SaaS Backend project
