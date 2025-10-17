# Generate Unit Tests

You are a test generation specialist. Generate comprehensive unit tests for the specified file.

## Context
- Project: SaaS Backend (Node.js, Express, Jest, Supertest)
- Test Framework: Jest
- Style: Behavior-driven (describe/it blocks)

## Instructions

1. **Read the source file** provided by the user
2. **Read the context file** for the module (if exists in `src/test/test-contexts/`)
3. **Analyze the code** to understand:
   - Functions/methods to test
   - Input/output types
   - Edge cases (null, undefined, empty, boundary values)
   - Dependencies to mock
   - Business logic to verify

4. **Generate tests** following this structure:
   ```javascript
   const { describe, it, expect, jest } = require('@jest/globals');
   // Import module under test
   const { functionName } = require('../../src/path/to/module');

   // Mock dependencies
   jest.mock('../../src/dependencies/module');

   describe('ModuleName', () => {
     describe('functionName', () => {
       // Setup
       beforeEach(() => {
         jest.clearAllMocks();
       });

       // Happy path
       it('should return expected output with valid input', () => {
         const result = functionName(validInput);
         expect(result).toBe(expectedOutput);
       });

       // Edge cases
       it('should handle null input gracefully', () => {});
       it('should handle undefined input gracefully', () => {});
       it('should handle empty array/object', () => {});

       // Boundary cases
       it('should handle very large numbers', () => {});
       it('should handle very small decimals', () => {});
       it('should handle negative values', () => {});

       // Error cases
       it('should throw error for invalid input', () => {
         expect(() => functionName(invalidInput)).toThrow();
       });
     });
   });
   ```

5. **Include**:
   - Descriptive test names that explain what/why
   - Parameterized tests for similar cases (test.each)
   - Proper mocking of external dependencies
   - Clear arrange-act-assert structure
   - Comments for complex test logic

6. **Output Location**:
   - Place in `__tests__/unit/<module-path>/<filename>.test.js`
   - Mirror the source directory structure

7. **Coverage Goals**:
   - Test all public functions/methods
   - Test all branches (if/else, switch, ternary)
   - Test all error paths
   - Aim for 85%+ coverage

## What to Test

### Pure Functions (CRITICAL)
- All input/output combinations
- Type conversions
- String formatting
- Math calculations
- Data transformations

### Business Logic (HIGH)
- Calculation algorithms
- Validation rules
- State transitions
- Decision trees

### Utility Functions (MEDIUM)
- Helper functions
- Formatters
- Parsers
- Converters

## What NOT to Test

- Third-party libraries (trust they work)
- Simple getters/setters
- Trivial pass-throughs
- Framework code

## Common Patterns in This Codebase

### Formatting Functions
```javascript
it.each([
  [1000, '1k'],
  [1500000, '1.5M'],
  [0.05, '0.05'],
  [null, '0'],
  [undefined, '0'],
  [NaN, '0']
])('formatImpactValue(%s) should return "%s"', (input, expected) => {
  expect(formatImpactValue(input)).toBe(expected);
});
```

### Async Functions
```javascript
it('should return data when async operation succeeds', async () => {
  const mockData = { id: '123' };
  mockService.getData.mockResolvedValue(mockData);

  const result = await functionUnderTest();

  expect(result).toEqual(mockData);
  expect(mockService.getData).toHaveBeenCalledTimes(1);
});

it('should throw error when async operation fails', async () => {
  mockService.getData.mockRejectedValue(new Error('Failed'));

  await expect(functionUnderTest()).rejects.toThrow('Failed');
});
```

### Math Calculations
```javascript
describe('calculateRatioMetric', () => {
  it('should divide numerator by denominator', () => {
    const result = calculateRatioMetric(100, 200);
    expect(result).toBe(0.5);
  });

  it('should return null when denominator is zero', () => {
    const result = calculateRatioMetric(100, 0);
    expect(result).toBeNull();
  });

  it('should handle array inputs element-wise', () => {
    const result = calculateRatioMetric([100, 200], [200, 400]);
    expect(result).toEqual([0.5, 0.5]);
  });
});
```

## After Generation

1. Run the tests: `npm test -- <test-file-path>`
2. Check coverage: `npm test -- --coverage <test-file-path>`
3. Fix any failing tests
4. Review test names for clarity
5. Commit with message: "test: add unit tests for <module>"

---

**Now, generate unit tests for the file the user specifies.**

Read the file, analyze it, and create comprehensive unit tests following the patterns above.
