# Generate API Tests

You are a test generation specialist. Generate comprehensive API endpoint tests for the specified route file.

## Context
- Project: SaaS Backend (Node.js, Express, Jest, Supertest)
- API Version: v1
- Authentication: Cookie-based sessions with JWT
- Test Framework: Jest + Supertest
- Style: API contract testing

## Instructions

1. **Read the route file** provided by the user
2. **Identify all endpoints** (GET, POST, PUT, DELETE, PATCH)
3. **Read the controller** to understand request/response shapes
4. **Generate tests** following this structure:

```javascript
const { expect, it, describe } = require('@jest/globals');
const request = require('supertest');
const signIn = require('../../src/test/jest.setup');
const app = require('../../src/app');

const ISO_8601_FULL = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;

// Test Constants
const TEST_API_VERSION_STRING = 'v1';
const TEST_SESSION_COOKIE = signIn();

describe('<ResourceName> API Test Suite', () => {

  describe('GET /<resource>', () => {
    it('should return 200 with list of resources', async () => {
      const response = await request(app)
        .get(`/${TEST_API_VERSION_STRING}/<resource>`)
        .set('Cookie', [`session=${TEST_SESSION_COOKIE}`]);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 0) {
        const item = response.body.data[0];
        // Validate schema
        expect(item).toHaveProperty('id');
        expect(typeof item.id).toBe('string');
        // ... validate all fields
      }
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/${TEST_API_VERSION_STRING}/<resource>`);

      expect(response.statusCode).toBe(401);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get(`/${TEST_API_VERSION_STRING}/<resource>?page_num=1&count=10`)
        .set('Cookie', [`session=${TEST_SESSION_COOKIE}`]);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    it('should validate pagination parameters', async () => {
      const response = await request(app)
        .get(`/${TEST_API_VERSION_STRING}/<resource>?page_num=-1`)
        .set('Cookie', [`session=${TEST_SESSION_COOKIE}`]);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should filter by query parameters', async () => {
      const response = await request(app)
        .get(`/${TEST_API_VERSION_STRING}/<resource>?filter_param=value`)
        .set('Cookie', [`session=${TEST_SESSION_COOKIE}`]);

      expect(response.statusCode).toBe(200);
      // Validate filtered results
    });
  });

  describe('GET /<resource>/:id', () => {
    const VALID_ID = 'valid-uuid-here';
    const INVALID_ID = 'invalid-id';

    it('should return 200 with resource details', async () => {
      const response = await request(app)
        .get(`/${TEST_API_VERSION_STRING}/<resource>/${VALID_ID}`)
        .set('Cookie', [`session=${TEST_SESSION_COOKIE}`]);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({});
      expect(response.body.id).toBe(VALID_ID);
      // Validate all response fields
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request(app)
        .get(`/${TEST_API_VERSION_STRING}/<resource>/${INVALID_ID}`)
        .set('Cookie', [`session=${TEST_SESSION_COOKIE}`]);

      expect(response.statusCode).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/${TEST_API_VERSION_STRING}/<resource>/${VALID_ID}`);

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /<resource>', () => {
    const validPayload = {
      field1: 'value1',
      field2: 'value2'
    };

    it('should return 200/201 with created resource', async () => {
      const response = await request(app)
        .post(`/${TEST_API_VERSION_STRING}/<resource>`)
        .set('Cookie', [`session=${TEST_SESSION_COOKIE}`])
        .send(validPayload);

      expect([200, 201]).toContain(response.statusCode);
      expect(response.body).toHaveProperty('id');
      expect(response.body.field1).toBe(validPayload.field1);
    });

    it('should return 400 with missing required fields', async () => {
      const response = await request(app)
        .post(`/${TEST_API_VERSION_STRING}/<resource>`)
        .set('Cookie', [`session=${TEST_SESSION_COOKIE}`])
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 with invalid field types', async () => {
      const invalidPayload = {
        field1: 123, // Should be string
        field2: 'value2'
      };

      const response = await request(app)
        .post(`/${TEST_API_VERSION_STRING}/<resource>`)
        .set('Cookie', [`session=${TEST_SESSION_COOKIE}`])
        .send(invalidPayload);

      expect(response.statusCode).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post(`/${TEST_API_VERSION_STRING}/<resource>`)
        .send(validPayload);

      expect(response.statusCode).toBe(401);
    });
  });

  describe('PUT/PATCH /<resource>/:id', () => {
    const VALID_ID = 'valid-uuid-here';
    const updatePayload = {
      field1: 'updated_value'
    };

    it('should return 200 with updated resource', async () => {
      const response = await request(app)
        .put(`/${TEST_API_VERSION_STRING}/<resource>/${VALID_ID}`)
        .set('Cookie', [`session=${TEST_SESSION_COOKIE}`])
        .send(updatePayload);

      expect(response.statusCode).toBe(200);
      expect(response.body.field1).toBe(updatePayload.field1);
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request(app)
        .put(`/${TEST_API_VERSION_STRING}/<resource>/invalid-id`)
        .set('Cookie', [`session=${TEST_SESSION_COOKIE}`])
        .send(updatePayload);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /<resource>/:id', () => {
    const VALID_ID = 'valid-uuid-here';

    it('should return 200/204 on successful deletion', async () => {
      const response = await request(app)
        .delete(`/${TEST_API_VERSION_STRING}/<resource>/${VALID_ID}`)
        .set('Cookie', [`session=${TEST_SESSION_COOKIE}`]);

      expect([200, 204]).toContain(response.statusCode);
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request(app)
        .delete(`/${TEST_API_VERSION_STRING}/<resource>/invalid-id`)
        .set('Cookie', [`session=${TEST_SESSION_COOKIE}`]);

      expect(response.statusCode).toBe(404);
    });
  });
});
```

## Response Schema Validation

### Field Type Validation
```javascript
// String fields
expect(typeof response.body.field).toBe('string');

// Number fields
expect(typeof response.body.field).toBe('number');

// Boolean fields
expect(typeof response.body.field).toBe('boolean');

// Date fields (ISO 8601)
expect(response.body.created_at).toMatch(ISO_8601_FULL);

// UUID fields
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
expect(response.body.id).toMatch(UUID_REGEX);

// Nullable fields
expect(
  response.body.field === null || typeof response.body.field === 'string'
).toBeTruthy();

// Array fields
expect(Array.isArray(response.body.items)).toBeTruthy();

// Nested objects
expect(response.body.metadata).toMatchObject({});
expect(response.body.metadata).toHaveProperty('key');
```

## Common Test Patterns

### Pagination Testing
```javascript
it('should paginate results correctly', async () => {
  const page1 = await request(app)
    .get(`/${TEST_API_VERSION_STRING}/<resource>?page_num=1&count=5`)
    .set('Cookie', [`session=${TEST_SESSION_COOKIE}`]);

  const page2 = await request(app)
    .get(`/${TEST_API_VERSION_STRING}/<resource>?page_num=2&count=5`)
    .set('Cookie', [`session=${TEST_SESSION_COOKIE}`]);

  expect(page1.body.data.length).toBeLessThanOrEqual(5);
  expect(page2.body.data.length).toBeLessThanOrEqual(5);

  // Ensure different results
  const page1Ids = page1.body.data.map(item => item.id);
  const page2Ids = page2.body.data.map(item => item.id);
  expect(page1Ids).not.toEqual(page2Ids);
});
```

### Date Range Filtering
```javascript
it('should filter by date range', async () => {
  const response = await request(app)
    .get(`/${TEST_API_VERSION_STRING}/<resource>?start_time=2024-01-01T00:00:00Z&end_time=2024-01-31T23:59:59Z`)
    .set('Cookie', [`session=${TEST_SESSION_COOKIE}`]);

  expect(response.statusCode).toBe(200);

  // Validate all results are within range
  response.body.data.forEach(item => {
    const itemDate = new Date(item.created_at);
    expect(itemDate >= new Date('2024-01-01')).toBeTruthy();
    expect(itemDate <= new Date('2024-01-31')).toBeTruthy();
  });
});
```

### Validation Testing
```javascript
const invalidTestCases = [
  { desc: 'empty string', payload: { field: '' }, expected: 400 },
  { desc: 'too long string', payload: { field: 'a'.repeat(1000) }, expected: 400 },
  { desc: 'invalid enum value', payload: { status: 'invalid' }, expected: 400 },
  { desc: 'negative number', payload: { count: -1 }, expected: 400 },
  { desc: 'invalid UUID', payload: { id: 'not-a-uuid' }, expected: 400 },
];

invalidTestCases.forEach(({ desc, payload, expected }) => {
  it(`should return ${expected} for ${desc}`, async () => {
    const response = await request(app)
      .post(`/${TEST_API_VERSION_STRING}/<resource>`)
      .set('Cookie', [`session=${TEST_SESSION_COOKIE}`])
      .send(payload);

    expect(response.statusCode).toBe(expected);
  });
});
```

## Output Location

Place tests in `__tests__/api/<resource>.test.js`

## Test IDs

Use real UUIDs from your test database:
- Run a query to get valid test IDs
- Or create fixtures that set up test data
- Document test IDs in comments

```javascript
// Test IDs (from test database)
const TEST_METRIC_ID = '96860a4a-fd12-4ba1-9fc3-527c2177854e'; // test_metric_revenue
const TEST_TENANT_ID = 'test-tenant-001';
```

## After Generation

1. Verify test IDs exist in test database
2. Run tests: `npm test -- __tests__/api/<resource>.test.js`
3. Check all endpoints are covered
4. Verify response schemas match actual responses
5. Test against actual API (not mocks)
6. Commit with message: "test: add API tests for <resource> endpoints"

---

**Now, generate API tests for the route file the user specifies.**

Read the route file, identify all endpoints, and create comprehensive API contract tests.
