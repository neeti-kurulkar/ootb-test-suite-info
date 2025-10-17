# Test Suite Development with Claude Code

This repository demonstrates how to build a comprehensive test suite using Claude Code's AI-assisted workflow. It contains the test infrastructure for a metrics analytics module with **235+ test cases**, achieving **72% code coverage** and a **100% pass rate**.

---

## Repository Structure

### Test Files (`__tests__/`)

Contains all test files organized by test type:

```
__tests__/
├── unit/
│   ├── controllers/
│   │   └── metrics.controller.test.js       # 140+ tests for formatting functions
│   └── services/
│       └── metrics/
│           └── metricsComparison.service.test.js  # 80+ tests for business logic
└── integration/
    └── services/
        └── metrics/
            └── metricsComparison.service.test.js  # 15+ end-to-end tests
```

**Why this organization?**
- **Unit tests**: Fast, isolated tests for pure functions and business logic (no external dependencies)
- **Integration tests**: Tests that verify interactions between components, with mocked external services

---

### Test Configuration (`src/test/`)

Configuration and setup files for the test environment:

```
src/test/
├── jest.unit.setup.js       # Unit test environment setup
├── jest.setup.js            # Integration test environment setup
├── global.setup.js          # Global test configuration
└── test-contexts/
    ├── metrics.context.md   # Domain knowledge for AI test generation
    └── insights.context.md  # Additional module context
```

**Why test contexts?**
These markdown files provide domain knowledge that helps Claude Code generate better tests. They include:
- Module overview and architecture
- Common patterns and edge cases
- Mock patterns and test data examples
- Business logic constraints

Without these files, Claude Code would have to infer patterns from code alone. With them, it generates contextually appropriate tests on the first try.

---

### Jest Configuration Files

```
├── jest.config.unit.js          # Configuration for unit tests
└── jest.config.integration.js   # Configuration for integration tests
```

**Why separate configs?**
- **Unit tests**: Fast execution, no database, mocked dependencies
- **Integration tests**: Database setup, external service mocking, longer timeouts

Separating them allows running unit tests quickly during development while keeping integration tests for CI/CD.

---

### Claude Code Configuration (`.claude/`)

The AI-powered test generation system:

```
.claude/
├── README.md                    # Guide for using test generation commands
├── test-generation-guide.md     # Detailed developer guide
├── commands/
│   ├── test-unit.md             # Agent for generating unit tests
│   ├── test-integration.md      # Agent for generating integration tests
│   ├── test-api.md              # Agent for generating API tests
│   └── test-update.md           # Agent for updating existing tests
└── SUMMARY.md                   # Overview of Claude Code setup
```

**What is the `.claude/` folder?**

This folder contains custom slash commands and agent configurations that extend Claude Code's capabilities. When you use a command like `/test-unit`, Claude Code reads the corresponding `.md` file and follows its instructions to generate tests.

**How slash commands work:**

Each `.md` file in `.claude/commands/` defines a specialized agent:

1. **test-unit.md** - Creates unit tests for pure functions
   - Reads the source file you specify
   - Reads the relevant context file (e.g., `metrics.context.md`)
   - Generates comprehensive tests with edge cases
   - Places them in `__tests__/unit/`

2. **test-integration.md** - Creates integration tests
   - Tests interactions between components
   - Includes database mocking patterns
   - Places them in `__tests__/integration/`

3. **test-api.md** - Creates API endpoint tests
   - Tests HTTP methods (GET, POST, PUT, DELETE)
   - Tests authentication and validation
   - Tests response schemas

4. **test-update.md** - Updates existing tests
   - Modifies tests when code changes
   - Adds new test cases
   - Maintains coverage

**How agents use context:**

When you run `/test-unit src/controllers/metrics.controller.js "test formatValue"`, the agent:

1. Reads `src/controllers/metrics.controller.js` to understand the code
2. Reads `src/test/test-contexts/metrics.context.md` to learn patterns
3. Reads `test-unit.md` to understand how to structure tests
4. Generates tests that follow your codebase conventions
5. Writes them to `__tests__/unit/controllers/metrics.controller.test.js`

**Why this approach?**

Instead of manually writing boilerplate tests, you describe what changed and let specialized agents generate comprehensive tests. The agents maintain consistency because they follow the same patterns defined in `.claude/commands/`.

---

### Documentation Files

```
├── TESTING_QUICK_START.md           # Getting started guide
├── TESTING_ROADMAP.md               # Multi-phase testing strategy
├── METRICS_MODULE_TEST_REPORT.md    # Detailed coverage analysis
├── METRICS_MODULE_TEST_REPORT.docx  # Word format report
└── README.md                        # This file
```

**Purpose:**
- **TESTING_QUICK_START.md**: For developers who need to run tests immediately
- **TESTING_ROADMAP.md**: Shows the planned testing phases and progress
- **METRICS_MODULE_TEST_REPORT.md**: Comprehensive analysis of test coverage, quality, and gaps

---

## How Tests Were Created with Claude Code

### Step 1: Create Test Context Files

Before generating any tests, domain knowledge was documented in `src/test/test-contexts/metrics.context.md`:

```markdown
# Metrics Module Test Context

## Common Patterns
- Metrics use K/M/B/T suffixes for formatting
- Ratio metrics: numerator / denominator
- Always handle division by zero

## Edge Cases to Test
- Null/undefined values
- Empty arrays
- Very large numbers (>1T)
- Very small decimals (<0.001)

## Mock Patterns
- Mock polarisQueryCall for database queries
- Use fixtures from fixtures/metrics.fixture.js
```

**Why?** This teaches Claude Code about the module's specific requirements, ensuring generated tests match real-world usage.

### Step 2: Define Specialized Agents

Slash commands were created in `.claude/commands/` to handle different test types. For example, `test-unit.md` instructs the agent to:

- Read the source file
- Read the context file for the module
- Analyze functions to test
- Generate tests with edge cases
- Use parameterized tests for similar scenarios
- Mock external dependencies properly

**Why?** Each test type (unit, integration, API) has different requirements. Specialized agents ensure the right patterns are applied.

### Step 3: Generate Tests Interactively

Using prompts like:

```
"Generate unit tests for the formatImpactValue function. It formats numbers
with K/M/B/T suffixes. Test edge cases: null, undefined, zero, NaN, very large
numbers (>1T), very small decimals (<0.001), negative values."
```

Claude Code:
1. Read `src/controllers/metrics.controller.js`
2. Read `src/test/test-contexts/metrics.context.md`
3. Generated 114 test cases covering all scenarios
4. Used `it.each()` for parameterized tests
5. Organized tests into logical groups

**Result**: `__tests__/unit/controllers/metrics.controller.test.js` with comprehensive coverage.

### Step 4: Iterate and Refine

After reviewing generated tests:
- Added missing edge cases
- Improved test descriptions
- Adjusted mock configurations
- Generated integration tests for end-to-end flows

Claude Code's `/test-update` command was used to refine tests based on feedback.

---

## Key Concepts

### Test Context Files vs. Slash Commands

**Test Context Files** (`src/test/test-contexts/*.md`):
- Domain knowledge about your modules
- Business logic patterns
- Edge cases specific to your domain
- Test data examples
- Read by all agents to understand your codebase

**Slash Commands** (`.claude/commands/*.md`):
- Instructions for how to generate tests
- Test structure and organization
- Code patterns and templates
- Generic testing best practices
- Define what the agent should do

**Relationship**: Slash commands are the "how" (process), context files are the "what" (domain knowledge).

### Agent Workflow

When you use `/test-unit src/utils/format.js "test formatCurrency"`:

1. **Agent Activation**: Claude Code loads `test-unit.md` instructions
2. **Context Loading**: Reads `src/test/test-contexts/common.context.md` (if exists)
3. **Code Analysis**: Reads `src/utils/format.js` to understand the function
4. **Test Generation**: Creates tests following patterns from both files
5. **File Creation**: Writes to `__tests__/unit/utils/format.test.js`
6. **Output**: Returns the generated test file for review

### Subagents and Specialization

Each slash command creates a **specialized subagent** - a temporary AI instance with specific instructions:

- **test-unit agent**: Expert in unit testing patterns, mocking, edge cases
- **test-integration agent**: Expert in database mocking, setup/teardown
- **test-api agent**: Expert in HTTP testing, authentication, validation
- **test-update agent**: Expert in refactoring tests while maintaining coverage

**Why subagents?** Different test types require different expertise. A unit test agent focuses on pure function testing, while an API test agent knows about HTTP status codes and request/response validation.

---

## Workflow Example

### Scenario: Adding a New Feature

**1. Write the feature:**
```javascript
// src/services/analytics.service.js
function calculateGrowthRate(current, previous) {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}
```

**2. Create context (if new module):**
```bash
# Add to src/test/test-contexts/analytics.context.md
## Edge Cases
- Division by zero (previous = 0)
- Negative values
- Very small differences
```

**3. Generate tests using slash command:**
```
/test-unit src/services/analytics.service.js "Added calculateGrowthRate function that calculates percentage growth. Handles division by zero."
```

**4. Review generated tests:**
Claude Code creates `__tests__/unit/services/analytics.service.test.js` with:
- Happy path tests
- Division by zero handling
- Negative value tests
- Boundary value tests

**5. Run and verify:**
Tests are immediately runnable and achieve high coverage.

---

## Current Test Suite Stats

| Metric | Value |
|--------|-------|
| Total Test Cases | 235+ |
| Unit Tests | 220+ |
| Integration Tests | 15+ |
| Pass Rate | 100% (121/121) |
| Execution Time | 2.7 seconds |
| Code Coverage | 72% overall |
| Controller Coverage | 85.2% |
| Service Coverage | 88.4% |

---

## Benefits of This Approach

### 1. **Consistency**
All tests follow the same patterns because agents use the same templates and context.

### 2. **Speed**
Generate 100+ tests in minutes instead of hours of manual writing.

### 3. **Completeness**
Agents systematically test edge cases that humans might forget.

### 4. **Maintainability**
Tests are well-organized and follow clear naming conventions.

### 5. **Knowledge Sharing**
Context files document domain knowledge that persists beyond individual developers.

---

## Why This Structure Works

### Separation of Concerns

- **Test files** contain the actual tests
- **Configuration files** control test execution
- **Context files** provide domain knowledge
- **Slash commands** define generation patterns

Each component has a single responsibility, making the system maintainable.

### AI-Friendly Organization

Claude Code works best when:
- Context is explicit (context files)
- Instructions are clear (slash commands)
- Structure is consistent (test organization)
- Patterns are documented (test templates)

This repository follows all these principles.

### Scalability

Adding tests for new modules requires:
1. Create a context file (10 minutes)
2. Use existing slash commands (instant)
3. Review and refine (5-10 minutes)

No need to redesign test structure or write boilerplate.

---

## Learning Resources

- **`.claude/README.md`** - Guide to using slash commands
- **`.claude/test-generation-guide.md`** - Comprehensive developer guide
- **`src/test/test-contexts/metrics.context.md`** - Example context file
- **`TESTING_QUICK_START.md`** - How to run tests
- **`METRICS_MODULE_TEST_REPORT.md`** - Detailed coverage analysis

---

## Summary

This repository demonstrates a **systematic approach to test development** using Claude Code:

1. **Test contexts** provide domain knowledge
2. **Slash commands** define specialized test generation agents
3. **Agents** read context and generate comprehensive tests
4. **Developers** review and refine the generated tests

The result: **235+ tests** with **100% pass rate** and **72% coverage**, created efficiently with AI assistance while maintaining high quality.
