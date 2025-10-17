# Metrics Module Test Context

This file provides context for AI agents generating tests for the metrics module.

## Module Overview

The metrics module handles KPI definitions, metric calculations, dimensional analysis, and comparisons. It's the core of the analytics dashboard.

## Key Files

### Controllers
- `src/controllers/metrics.controller.js` - Main metrics API controller
- `src/controllers/metricsSummary.controller.js` - Summary views

### Services
- `src/services/metrics/metricsComparison.service.js` - Metric comparison logic
- `src/services/analysis/metricsDimensionalData.service.js` - Dimensional analysis

### DAOs
- `src/models/postgres/metrics/kpi.operational.dao.js` - Metric CRUD operations
- `src/models/postgres/metrics/dimension.dao.js` - Dimension operations

### Routes
- `src/routes/v1/metrics_hub/metrics/metrics.route.js` - Metrics API endpoints

## Domain Concepts

### Metrics (KPIs)
- **Operational KPI**: A measurable business metric
- **Types**:
  - `simple`: Direct metric (e.g., revenue, orders)
  - `ratio`: Calculated metric (e.g., conversion rate = checkouts / visitors)
- **Format**: `number`, `percentage`, `currency`
- **Aggregation**: `SUM`, `AVG`, `COUNT`, `MAX`, `MIN`

### Dimensions
- Attributes used to slice metrics (e.g., `country`, `product_category`, `channel`)
- Can be hierarchical (e.g., `region > country > city`)
- Used for root cause analysis

### Metric Comparison
- Compare metrics across time periods
- Break down metrics by dimensions
- Calculate ratio metrics from numerator/denominator

### Frequencies
- `h`: Hourly
- `d`: Daily
- `w`: Weekly
- `m`: Monthly

## Common Patterns

### Formatting Values

```javascript
// Format impact values with K/M/B/T suffixes
formatImpactValue(1500000) // "1.5M"
formatImpactValue(0.05) // "0.05"
formatImpactValue(0) // "0"

// Format percentages
formatImpactPercentage(0.125) // "12.5%"
formatImpactPercentage(0.0005) // "0.05%"
```

**Edge Cases to Test:**
- Zero values
- Null/undefined
- NaN
- Very large numbers (>1T)
- Very small decimals (<0.001)
- Negative values

### Ratio Metric Calculations

```javascript
// numerator / denominator
const conversionRate = checkouts / visitors;

// Handle division by zero
if (denominator === 0) return null;

// Element-wise for arrays
const ratios = numerators.map((num, i) => num / denominators[i]);
```

**Edge Cases to Test:**
- Division by zero
- Mismatched array lengths
- Empty arrays
- All-zero denominators

### Database Queries

```javascript
// Polaris (TimescaleDB) queries
const query = get_metrics_comparison_query(
  tenant_id,
  kpi_ids,
  dimension_filters,
  frequency,
  start_time,
  end_time
);

// Fallback mechanism
if (response.status === 404) {
  // Retry with fallback table
  const fallbackQuery = get_metrics_comparison_query(...params, true);
}
```

**Edge Cases to Test:**
- 404 responses (fallback to alternate table)
- Empty result sets
- Invalid date ranges
- Missing tenant data

## Dependencies

### External Libraries
- `mathjs`: Expression evaluation for calculated metrics
- `moment`: Date/time manipulation
- `sequelize`: PostgreSQL ORM

### Internal Modules
- `src/models/polaris/metric/metric.model.js`: Polaris query builders
- `src/utils/common/string.js`: String formatters
- `src/utils/common/number.js`: Number formatters

## Mock Patterns

### Mock Polaris Queries
```javascript
jest.mock('../../../src/models/polaris/common/common.model', () => ({
  polarisQueryCall: jest.fn()
}));

// In test
const mockPolarisQueryCall = require('../../../src/models/polaris/common/common.model').polarisQueryCall;
mockPolarisQueryCall.mockResolvedValue({
  status: 200,
  data: [/* test data */],
  success: true
});
```

### Mock Database Models
```javascript
jest.mock('../../../src/models/postgres/metrics/kpi.operational.model');

const Kpi = require('../../../src/models/postgres/metrics/kpi.operational.model');
Kpi.findOne.mockResolvedValue({
  id: 'test-kpi',
  name: 'test_metric',
  type: 'ratio'
});
```

## Test Data

### Sample Tenant
```javascript
const TEST_TENANT_ID = 'test-tenant-001';
```

### Sample KPIs
```javascript
const SAMPLE_SIMPLE_KPI = {
  id: 'kpi-001',
  name: 'revenue',
  display_name: 'Revenue',
  type: 'simple',
  kpi_format: 'currency',
  aggregation_operation: 'SUM',
  client_id: 'test-tenant-001'
};

const SAMPLE_RATIO_KPI = {
  id: 'kpi-002',
  name: 'conversion_rate',
  display_name: 'Conversion Rate',
  type: 'ratio',
  kpi_format: 'percentage',
  constituent_metrics: {
    numerator: [{ id: 'kpi-003', name: 'checkouts' }],
    denominator: [{ id: 'kpi-004', name: 'visitors' }]
  },
  rca_aggregation_operation: 'checkouts / visitors',
  client_id: 'test-tenant-001'
};
```

### Sample Dimensions
```javascript
const SAMPLE_DIMENSION = {
  id: 'dim-001',
  name: 'country',
  display_name: 'Country',
  type: 'categorical'
};
```

## Validation Rules

### Metric Names
- Lowercase with underscores
- No special characters except underscore
- Max 255 characters

### Date Ranges
- Must be ISO 8601 format
- `end_time` must be after `start_time`
- Max range: 90 days (configurable by frequency)

### Frequencies
- Must be one of: `h`, `d`, `w`, `m`
- Determines data aggregation level

## Error Scenarios

### Expected Errors
- 404: Metric not found
- 400: Invalid date range
- 400: Invalid frequency
- 500: Database connection error
- 500: Polaris query timeout

### Error Handling Patterns
```javascript
try {
  const result = await service.method();
} catch (error) {
  logger.log('error', `Error in method: ${error.message}`);
  throw error; // Re-throw or handle gracefully
}
```

## Performance Considerations

- Polaris queries can be slow for large date ranges
- Dimension breakups with many values can be expensive
- Use pagination for large result sets
- Cache frequently accessed metrics

## Business Logic Constraints

### Metric Categories
- `revenue`: Revenue metrics
- `traffic`: Traffic/visitor metrics
- `conversion`: Conversion metrics
- `engagement`: Engagement metrics
- `experience`: User experience metrics

### Impact Calculations
- Impact = (actual - expected)
- Percentage impact = (actual - expected) / expected * 100
- Formatted for display

### Trend Analysis
- Compare current period vs previous period
- Detect spikes, drops, trends
- Calculate statistical significance

## Common Test Scenarios

### Happy Paths
1. Get metrics list with pagination
2. Get single metric by ID
3. Get metric comparison for date range
4. Get dimension breakup
5. Calculate ratio metrics

### Edge Cases
1. Empty result sets
2. Single data point
3. All nulls/zeros
4. Mismatched array lengths
5. Very large datasets

### Error Cases
1. Non-existent metric
2. Invalid date range
3. Invalid frequency
4. Unauthorized tenant access
5. Database errors

## Related Modules

- **Insights**: Uses metrics for anomaly detection
- **Patterns**: Uses metrics for pattern matching
- **Dimensions**: Used to slice metrics
- **Pipelines**: Orchestrate metric calculations

## Tips for Test Generation

1. **Always test formatters** with edge cases (0, null, very large/small)
2. **Mock Polaris queries** to avoid slow tests
3. **Test fallback logic** (404 → retry with fallback)
4. **Test ratio metrics separately** from simple metrics
5. **Verify dimensional breakup sorting** is correct
6. **Test date range boundaries** (inclusive/exclusive)
7. **Test pagination** (page 1, page 2, last page, empty)
8. **Test authentication** (with/without cookie)
9. **Test tenant isolation** (can't access other tenant's data)
10. **Use fixtures** for consistent test data
