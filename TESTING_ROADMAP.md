# Testing Implementation Roadmap

## Overview

This roadmap outlines the phased approach to implementing comprehensive test coverage for the metrics and insights modules using AI-powered test generation.

**Goal**: Achieve 80%+ test coverage with maintainable, AI-generated tests that developers can easily update as the codebase evolves.

---

## Phase 1: Foundation (Week 1-2)

### ✅ Infrastructure Setup (Completed)

- [x] Create `.claude/` directory structure
- [x] Create slash commands (`/test-unit`, `/test-integration`, `/test-api`, `/test-update`)
- [x] Create context files for metrics and insights modules
- [x] Create test generation guide for developers
- [x] Create README documentation

### 🔄 Test Organization (In Progress)

- [ ] Create `__tests__/unit/` directory structure
- [ ] Create `__tests__/integration/` directory structure
- [ ] Create `__tests__/fixtures/` directory
- [ ] Set up test helper utilities
- [ ] Configure Jest for new test structure

### 📝 Documentation

- [ ] Add quick start guide to main README
- [ ] Create video walkthrough (optional)
- [ ] Add examples to developer documentation

---

## Phase 2: Critical Path Testing (Week 3-4)

### Priority: Formatting Functions

**Why**: Pure functions, easy wins, high impact on user-facing data

- [ ] `src/controllers/metrics.controller.js`
  - [ ] `formatImpactValue()` - Number formatting with K/M/B suffixes
  - [ ] `formatImpactPercentage()` - Percentage formatting

**Command**:

```bash
/test-unit src/controllers/metrics.controller.js "Generate tests for formatImpactValue and formatImpactPercentage functions. Test edge cases: 0, null, undefined, NaN, very large numbers (>1T), very small decimals (<0.001), negative values"
```

**Success Criteria**:

- ✅ 100% coverage of format functions
- ✅ All edge cases covered
- ✅ Tests run in <1s
- ✅ Clear test names

---

### Priority: Metrics Comparison Service

**Why**: Core business logic, complex calculations, high risk

- [ ] `src/services/metrics/metricsComparison.service.js`
  - [ ] `calculateBreakupForRatioMetrics()` - Ratio calculations
  - [ ] `getSortedDimensionsBreakup()` - Sorting logic
  - [ ] `getDefaultTimeRange()` - Date logic
  - [ ] `executeQueryWithFallback()` - Query fallback

**Commands**:

```bash
# Unit tests
/test-unit src/services/metrics/metricsComparison.service.js "Generate unit tests for calculateBreakupForRatioMetrics, getSortedDimensionsBreakup, and getDefaultTimeRange methods. Test division by zero, empty arrays, mismatched array lengths, null values"

# Integration tests
/test-integration src/services/metrics/metricsComparison.service.js "Generate integration tests for getMetricsComparisonData with mocked Polaris queries. Test successful queries, 404 fallback logic, empty result sets, and query parameter validation"
```

**Success Criteria**:

- ✅ 85%+ coverage
- ✅ Ratio calculation edge cases tested
- ✅ Fallback mechanism tested
- ✅ Integration tests with mocked DB

---

### Priority: Insights Controller (Enhance Existing)

**Why**: User-facing API, already has tests, enhance coverage

- [ ] Enhance `__tests__/api/insights.test.js`
  - [ ] Add pattern type filtering tests
  - [ ] Add severity filtering tests
  - [ ] Add KPI filtering tests
  - [ ] Add dimension filtering tests
  - [ ] Add rootcause endpoint tests
  - [ ] Add summary histogram tests

**Command**:

```bash
/test-update __tests__/api/insights.test.js "Add tests for pattern_type filtering (spike_up, spike_down), severity filtering (low, medium, high), kpis filtering (comma-separated UUIDs), dimensions filtering (dim_name:dim_val format), and summary/histogram endpoints"
```

**Success Criteria**:

- ✅ All query parameters tested
- ✅ All endpoints have tests
- ✅ Edge cases covered (invalid params)

---

## Phase 3: Data Access Layer (Week 5-6)

### Metrics DAO

- [ ] `src/models/postgres/metrics/kpi.operational.dao.js`
  - [ ] CRUD operations
  - [ ] Query filters
  - [ ] Associations (dimensions, funnels, categories)

**Command**:

```bash
/test-integration src/models/postgres/metrics/kpi.operational.dao.js "Generate integration tests for getMetricById, createKpi, updateKpiById, and findMetricsByFilter methods. Test with valid data, invalid IDs, tenant isolation, and associations with dimensions and categories"
```

---

### Insights DAO

- [ ] `src/models/postgres/insight/insight.dao.js`
  - [ ] Complex query builders
  - [ ] State filtering
  - [ ] Pagination

**Command**:

```bash
/test-integration src/models/postgres/insight/insight.dao.js "Generate integration tests for findLatestInsightsByState, getInsightById, and pagination queries. Test user states (important, snoozed, archived), team states (flagged, resolved), date range filtering, and pagination edge cases"
```

**Success Criteria**:

- ✅ 75%+ DAO coverage
- ✅ Database operations tested
- ✅ Transaction handling tested
- ✅ Tenant isolation verified

---

## Phase 4: API Completeness (Week 7-8)

### New Metrics API Tests

- [ ] `src/routes/v1/metrics_hub/metrics/metrics.route.js`

**Command**:

```bash
/test-api src/routes/v1/metrics_hub/metrics/metrics.route.js "Generate comprehensive API tests for all metrics endpoints. Test GET /metrics (list with pagination), GET /metrics/:id (single metric), GET /metrics/:id/comparison (metric comparison with date range and dimensions), GET /metrics/:id/dimensions (dimension breakup). Test authentication, validation, and error cases"
```

---

### New Dimensions API Tests

- [ ] `src/routes/v1/metrics_hub/dimensions/dimensions.route.js`

**Success Criteria**:

- ✅ 80%+ API coverage
- ✅ All endpoints tested (GET, POST, PUT, DELETE)
- ✅ Authentication tested
- ✅ Validation tested
- ✅ Response schemas validated

---

## Phase 5: Utilities & Helpers (Week 9)

### String Utilities

- [ ] `src/utils/common/string.js`
  - [ ] `formatKpiValue()`
  - [ ] `convertFromString()`

**Command**:

```bash
/test-unit src/utils/common/string.js "Generate tests for formatKpiValue and convertFromString functions. Test currency formatting, type conversions, null handling, and edge cases"
```

---

### Date/Time Utilities

- [ ] `src/utils/common/dateTime.js`
  - [ ] ISO string conversions
  - [ ] Week of month calculations
  - [ ] Timezone handling

**Command**:

```bash
/test-unit src/utils/common/dateTime.js "Generate tests for convertToISOString, getWeekOfMonth, and timezone conversion functions. Test valid dates, invalid dates, timezone edge cases, and DST transitions"
```

**Success Criteria**:

- ✅ 90%+ utility coverage
- ✅ All edge cases tested
- ✅ Fast execution (<100ms per suite)

---

## Phase 6: Additional Services (Week 10)

### Metrics Dimensional Data Service

- [ ] `src/services/analysis/metricsDimensionalData.service.js`

**Command**:

```bash
/test-integration src/services/analysis/metricsDimensionalData.service.js "Generate tests for dimensional analysis methods. Test with multiple dimensions, single dimension, null dimensions, and aggregation logic"
```

---

### Notification Services

- [ ] `src/controllers/notification/metricsCollect.controller.js`
- [ ] `src/controllers/notification/insightsCollect.controller.js`

**Success Criteria**:

- ✅ 70%+ service coverage
- ✅ Business logic tested
- ✅ External dependencies mocked

---

## Phase 7: Coverage Gaps & Quality (Week 11-12)

### Coverage Analysis

- [ ] Run full coverage report
- [ ] Identify gaps in coverage
- [ ] Prioritize missing tests
- [ ] Generate tests for gaps

**Commands**:

```bash
npm test -- --coverage --coverageReporters=text --coverageReporters=html
# Review report, identify gaps
# Generate tests for uncovered files
```

---

### Test Quality Review

- [ ] Review all generated tests
- [ ] Ensure test names are descriptive
- [ ] Verify edge cases are covered
- [ ] Check for flaky tests
- [ ] Optimize slow tests

---

### Refactoring

- [ ] Extract common test utilities
- [ ] Create shared fixtures
- [ ] Standardize mock patterns
- [ ] Document test conventions

**Success Criteria**:

- ✅ 80%+ overall coverage
- ✅ 85%+ critical path coverage
- ✅ 90%+ utility coverage
- ✅ Test suite runs in <5 minutes
- ✅ Zero flaky tests
- ✅ All tests documented

---

## Ongoing Maintenance

### Developer Workflow

Whenever code changes:

1. **New Feature**:

   ```bash
   # Write feature
   vim src/services/myService.js

   # Generate tests
   /test-unit src/services/myService.js "Description"

   # Run tests
   npm test

   # Commit together
   git add src/services/myService.js __tests__/unit/services/myService.test.js
   git commit -m "feat: add new feature with tests"
   ```

2. **Refactor**:

   ```bash
   # Refactor code
   vim src/services/myService.js

   # Update tests
   /test-update __tests__/unit/services/myService.test.js "Description of changes"

   # Run tests
   npm test
   ```

3. **Bug Fix**:

   ```bash
   # Fix bug
   vim src/services/myService.js

   # Add regression test
   /test-update __tests__/unit/services/myService.test.js "Add regression test for bug #1234"
   ```

---

### Context File Maintenance

**Monthly Review**:

- [ ] Review `src/test/test-contexts/metrics.context.md`
- [ ] Review `src/test/test-contexts/insights.context.md`
- [ ] Add new patterns discovered
- [ ] Update edge cases
- [ ] Refine mock patterns

---

### Metrics Tracking

**Weekly**:

- [ ] Check test coverage percentage
- [ ] Monitor test execution time
- [ ] Track flaky test count
- [ ] Review new tests added

**Monthly**:

- [ ] Generate coverage trend report
- [ ] Review test quality metrics
- [ ] Identify improvement areas
- [ ] Update roadmap if needed

---

## Success Metrics

### Coverage Targets

| Layer | Target | Phase | Status |
|-------|--------|-------|--------|
| Utils | 90% | Phase 5 | 🔴 0% |
| Services | 85% | Phase 2-6 | 🔴 0% |
| Controllers | 70% | Phase 2-4 | 🔴 0% |
| DAOs | 75% | Phase 3 | 🔴 0% |
| Routes (API) | 80% | Phase 4 | 🟡 ~40% |

### Quality Metrics

- **Test Execution Time**: <5 minutes for full suite
- **Flaky Tests**: 0
- **Test Failures on Main**: 0
- **Coverage Trend**: Increasing
- **Developer Satisfaction**: High (easy to generate/maintain)

### Adoption Metrics

- **% of PRs with Tests**: >90%
- **Test Generation Usage**: Daily
- **Context File Updates**: Monthly
- **Developer Training**: 100% of team

---

## Risk Mitigation

### Risk 1: Tests Take Too Long

**Mitigation**:

- Mock external services (Polaris, APIs)
- Use transactions for DB tests
- Parallelize test execution
- Optimize slow queries

### Risk 2: Tests Are Flaky

**Mitigation**:

- Avoid time-dependent assertions
- Seed random data deterministically
- Use beforeEach/afterEach for isolation
- Mock system time if needed

### Risk 3: Low Adoption

**Mitigation**:

- Provide clear documentation
- Create video tutorials
- Pair programming sessions
- Make it easier than manual testing

### Risk 4: Generated Tests Are Poor Quality

**Mitigation**:

- Improve context files with real examples
- Review generated tests in code reviews
- Iterate on prompts
- Update slash commands based on feedback

---

## Review & Retrospective

### After Phase 2 (Week 4)

- [ ] Review progress vs. roadmap
- [ ] Gather developer feedback
- [ ] Adjust approach if needed
- [ ] Update documentation

### After Phase 4 (Week 8)

- [ ] Mid-point review
- [ ] Coverage assessment
- [ ] Quality check
- [ ] Roadmap adjustment

### After Phase 7 (Week 12)

- [ ] Final review
- [ ] Celebrate success
- [ ] Document learnings
- [ ] Plan future enhancements

---

## Next Steps

1. **Immediate** (This Week):
   - [ ] Create `__tests__/unit/` and `__tests__/integration/` directories
   - [ ] Set up test fixtures directory
   - [ ] Run first test generation: `/test-unit src/controllers/metrics.controller.js`
   - [ ] Review and commit

2. **Short Term** (Next 2 Weeks):
   - [ ] Complete Phase 2 (Critical Path Testing)
   - [ ] Train 2-3 developers on test generation
   - [ ] Document any issues or improvements

3. **Medium Term** (Next 3 Months):
   - [ ] Complete all 7 phases
   - [ ] Achieve 80%+ coverage
   - [ ] Establish maintenance routine

---

## Questions & Answers

**Q: What if generated tests don't match my needs?**
A: Improve your prompt with more detail, or use `/test-update` to refine the generated tests. Over time, updating context files will improve generation quality.

**Q: How much time will this save?**
A: Writing tests manually typically takes 2-3x as long as writing code. With AI generation, you spend seconds describing what to test instead of hours writing boilerplate.

**Q: Do I still need to review generated tests?**
A: Yes! Always review and run tests before committing. The AI generates the structure, but you verify correctness.

**Q: What about edge cases I didn't think of?**
A: The AI uses context files to remember common edge cases. As you discover new ones, add them to context files for future generation.

**Q: How do I test really complex logic?**
A: Break it down in your prompt: "Test X when Y is true and Z is false. Test error case when A throws exception. Test edge case when B is null."

---

## Resources

- [Test Generation Guide](./.claude/test-generation-guide.md)
- [Metrics Context](./src/test/test-contexts/metrics.context.md)
- [Insights Context](./src/test/test-contexts/insights.context.md)
- [Claude README](./.claude/README.md)

---

**Last Updated**: 2025-01-15
**Next Review**: 2025-02-01
