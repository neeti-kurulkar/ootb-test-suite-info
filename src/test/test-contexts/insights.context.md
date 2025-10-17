# Insights Module Test Context

This file provides context for AI agents generating tests for the insights module.

## Module Overview

The insights module handles anomaly detection, pattern recognition, and alerting for metrics. It identifies spikes, drops, trends, and other significant changes in KPIs.

## Key Files

### Controllers

- `src/controllers/insights.controller.js` - Main insights API controller
- `src/controllers/insightsSummary.controller.js` - Summary and histogram views
- `src/controllers/insightStateUser.controller.js` - User state management
- `src/controllers/insightStateTeam.controller.js` - Team state management

### DAOs

- `src/models/postgres/insight/insight.dao.js` - Insight CRUD operations
- `src/models/postgres/insight_group/insight_group.dao.js` - Insight grouping

### Routes

- `src/routes/v1/insights/insights.route.js` - Insights API endpoints

## Domain Concepts

### Insights

- **Insight**: An anomaly or significant change detected in a metric
- **Pattern Types**:
  - `spike_up`: Sudden increase
  - `spike_down`: Sudden decrease
  - `up_trend`: Sustained upward trend
  - `down_trend`: Sustained downward trend
  - `nnign`: No notable insight (baseline)

### Severity Levels

- `low`: Minor deviation
- `medium`: Moderate deviation
- `high`: Significant deviation

### Insight States

#### User States

- `important`: Flagged as important by user
- `snoozed`: Temporarily hidden
- `archived`: Permanently hidden

#### Team States

- `flagged`: Flagged for team attention
- `resolved`: Marked as resolved

### Insight Components

- **KPI**: The metric that changed
- **Pattern**: Type of change detected
- **Dimension**: Specific dimension value (optional)
- **Root Cause**: Contributing factors (hotspots)
- **Timeline**: When the change occurred

## Common Patterns

### Filtering Insights

```javascript
// Filter by state
GET /v1/insights?state=important

// Filter by date range
GET /v1/insights?start_time=2024-01-01T00:00:00Z&end_time=2024-01-31T23:59:59Z

// Filter by pattern type
GET /v1/insights?pattern_type=spike_up,spike_down

// Filter by severity
GET /v1/insights?severity=high,medium

// Filter by KPI
GET /v1/insights?kpis=kpi-uuid-1,kpi-uuid-2

// Filter by dimension
GET /v1/insights?dimensions=country:US,channel:organic

// Pagination
GET /v1/insights?page_num=1&count=10
```

### State Management API

```javascript
// Set user state
POST /v1/insights/:id/user_state
{
  "current_state": "important",
  "state_data": {} // Optional metadata
}

// Set team state
POST /v1/insights/:id/team_state
{
  "current_state": "resolved",
  "state_data": {
    "resolved_by": "user@example.com",
    "resolution_notes": "Fixed by deploying hotfix"
  }
}
```

### Annotations

```javascript
// Add annotation
POST /v1/insights/:id/annotate
{
  "title": "Annotation Title",
  "summary": "Detailed explanation of what happened"
}
```

## Database Schema

### Insight Fields

```javascript
{
  insight_id: 'uuid',
  _client_id: 'tenant_id',
  _pipeline_id: 'pipeline_uuid',
  _guid: 'pipeline_guid',
  _start: 'timestamp',
  insertion_dt: 'timestamp',
  json_str: {
    // Pattern data
    issue_id: 'uuid',
    issue_type: 'spike_up',
    direction: 'up',
    alert_tier: 'high',

    // Metric data
    kpi: 'metric_name',
    kpi_display_name: 'Display Name',
    kpi_value: 12345,
    expected_kpi_value: 10000,
    kpi_format: 'number',
    accent: '#FF0000',

    // Dimension (optional)
    dimension_name: 'country',
    dimension_value: 'US',

    // Chart data
    chart_title: 'Revenue spiked up by 23%',
    xmin: 'start_timestamp',
    xmax: 'end_timestamp',

    // Pattern-specific data
    pct_expected_delta: 0.23,
    pct_expected_delta_decimal: 0.23,
    pct: 0.23,

    // For trend changes
    lastcp: 'change_point_timestamp',
    lastcp_trend: 0.05,
    pre_trend: 0.02,
    post_trend: 0.08,
    trend_unit: 'per day',

    // For point anomalies
    yhat_upper: 12000,
    yhat_lower: 8000,
    zscore: 3.5,

    // Root cause
    rootcause_id: 'uuid',
    hotspot_data: [/* hotspots */]
  }
}
```

## Mock Patterns

### Mock Insights DAO

```javascript
jest.mock('../../../src/models/postgres/insight/insight.dao');

const insightsDao = require('../../../src/models/postgres/insight/insight.dao');

insightsDao.getInsightById.mockResolvedValue({
  insight_id: 'test-insight-id',
  _client_id: 'test-tenant',
  json_str: {/* insight data */}
});
```

### Mock Polaris for Time Series

```javascript
const mockPolarisQueryCall = require('../../../src/models/polaris/common/common.model').polarisQueryCall;

mockPolarisQueryCall.mockResolvedValue({
  status: 200,
  data: [
    { __time: '2024-01-01T00:00:00Z', y: 100 },
    { __time: '2024-01-02T00:00:00Z', y: 150 }
  ],
  success: true
});
```

## Test Data

### Sample Insight (Spike Up)

```javascript
const SAMPLE_SPIKE_INSIGHT = {
  insight_id: '96860a4a-fd12-4ba1-9fc3-527c2177854e',
  _client_id: 'test-tenant-001',
  _pipeline_id: 'pipeline-uuid',
  _guid: 'pipeline-guid',
  _start: '2024-01-15T00:00:00Z',
  insertion_dt: '2024-01-15T01:00:00Z',
  json_str: {
    issue_id: 'pattern-uuid',
    issue_type: 'spike_up',
    direction: 'up',
    alert_tier: 'high',
    kpi: 'revenue',
    kpi_display_name: 'Revenue',
    kpi_value: 125000,
    expected_kpi_value: 100000,
    kpi_format: 'currency',
    accent: '#FF0000',
    chart_title: 'Revenue spiked up by 25%',
    pct_expected_delta: 0.25,
    yhat_upper: 110000,
    yhat_lower: 90000,
    zscore: 4.2
  }
};
```

### Sample Insight (Trend Change)

```javascript
const SAMPLE_TREND_INSIGHT = {
  insight_id: 'trend-insight-uuid',
  _client_id: 'test-tenant-001',
  json_str: {
    issue_type: 'Trend Change',
    direction: 'up',
    alert_tier: 'medium',
    kpi: 'daily_active_users',
    kpi_display_name: 'Daily Active Users',
    lastcp: '2024-01-10T00:00:00Z',
    lastcp_trend: 0.05,
    pre_trend: 0.02,
    post_trend: 0.08,
    trend_unit: 'per day',
    chart_title: 'Daily Active Users trend changed',
    pre_trend_line: {
      coords: [
        ['2024-01-01T00:00:00Z', 1000],
        ['2024-01-10T00:00:00Z', 1200]
      ],
      accent: '#00FF00'
    },
    post_trend_line: {
      coords: [
        ['2024-01-10T00:00:00Z', 1200],
        ['2024-01-20T00:00:00Z', 1600]
      ],
      accent: '#FF0000'
    }
  }
};
```

## Validation Rules

### Query Parameters

- `start_time`/`end_time`: ISO 8601 format, end > start
- `pattern_type`: One of `spike_up`, `spike_down`, `up_trend`, `down_trend`, `nnign`
- `severity`: One of `low`, `medium`, `high`
- `kpis`: Comma-separated UUIDs
- `page_num`: Positive integer
- `count`: Positive integer
- `pipeline_schedule`: One of `h`, `d`, `w`, `m`

### State Values

- User states: `important`, `snoozed`, `archived`
- Team states: `flagged`, `resolved`

## Error Scenarios

### Expected Errors

- 404: Insight not found
- 400: Invalid date range (end < start)
- 400: Invalid pattern_type
- 400: Invalid severity
- 400: Invalid UUIDs in kpis parameter
- 400: Invalid pagination parameters (negative, non-integer)
- 401: Unauthorized (no session cookie)
- 403: Forbidden (wrong tenant)

## Business Logic

### Insight Summary

- Total count of insights
- Breakdown by severity
- Breakdown by pattern type
- Timeline histogram

### Grouping Logic

- Related insights are grouped together
- Based on:
  - Same metric
  - Same dimension
  - Overlapping time periods
- Group recurrence count tracks repeated patterns

### Root Cause Analysis

- Hotspots identify which dimension values contributed most
- Ranked by impact/contribution
- Multiple hotspots can explain a single insight

## Common Test Scenarios

### Happy Paths

1. Get insights list with no filters
2. Get insights filtered by date range
3. Get insights filtered by state (user/team)
4. Get insights filtered by pattern type
5. Get insights filtered by severity
6. Get insights filtered by KPI IDs
7. Get insights filtered by dimensions
8. Get single insight by ID
9. Get insight summary
10. Get insight summary histogram
11. Set user state (important/snoozed/archived)
12. Set team state (flagged/resolved)
13. Get insight history (state changes + annotations)
14. Post annotation
15. Get root cause details

### Edge Cases

1. Empty result set (no insights)
2. Very long date range
3. Multiple filters combined
4. Pagination edge cases (first page, last page, beyond last page)
5. Duplicate state changes (idempotency)
6. State transitions (important → archived → important)

### Error Cases

1. Invalid insight ID (404)
2. Invalid date range (400)
3. End time before start time (400)
4. Invalid pattern types (400)
5. Invalid severity values (400)
6. Invalid UUIDs (400)
7. Negative page numbers (400)
8. Non-integer page numbers (400)
9. No authentication (401)
10. Wrong tenant access (403)

### State Management

1. User can set multiple states over time
2. Latest state is shown in list view
3. History preserves all state changes
4. Team states independent of user states
5. State data is optional metadata
6. Delete state reverts to previous state

## Performance Considerations

- Insights queries can return thousands of results
- Use pagination for large datasets
- Date range filtering reduces query size
- State filtering uses database views (optimized)
- Summary/histogram queries are expensive

## Related Modules

- **Metrics**: Insights are generated from metric anomalies
- **Patterns**: Pattern detection algorithms
- **Hotspots**: Root cause identification
- **Groups**: Related insights grouped together
- **Notifications**: Alerts sent for high-severity insights

## Tips for Test Generation

1. **Test all filter combinations** (date + severity + pattern + KPI)
2. **Test pagination thoroughly** (edge cases matter)
3. **Test date validation** (ISO 8601, end > start)
4. **Test state management** (set, update, delete, history)
5. **Test response schema** (all fields, nested objects, arrays)
6. **Test authentication** (with/without cookie)
7. **Test tenant isolation** (can't see other tenant's insights)
8. **Use real insight IDs** from test database
9. **Test both spike and trend patterns** (different JSON structures)
10. **Test summary aggregations** (counts, breakdowns)
11. **Mock Polaris queries** for time series data
12. **Test annotation CRUD** operations
13. **Validate ISO 8601 timestamps** in responses
14. **Test null/optional fields** (dimension, rootcause)
15. **Test array fields** (hotspots, groups)
