# TODO Tasks - Prioritized by Ease & Impact

## ✅ COMPLETED (Safe to complete now)
These are documentation/comment improvements with zero impact:

### Priority 1: Already Safe Comments (Keep as-is)
- ✅ `frontend/apps/mobile/lib/analytics/analytics.ts` - Analytics placeholders are well documented
- ✅ `frontend/apps/mobile/components/error-boundary.tsx` - Error handling TODOs are documented
- ✅ Navigation placeholders in admin pages - Console logs are appropriate

## 🟢 EASY & NO IMPACT (Can complete immediately)
These require minimal code changes with zero risk:

### Group A: Remove Unnecessary TODOs (Already handled by console.logs)
1. **`frontend/apps/mobile/app/(tabs)/plans.tsx:201`**
   - Current: `// TODO: Implement create functionality`
   - Action: Console.log is fine for now, mark as future feature
   - Impact: None - just a placeholder

2. **`frontend/apps/mobile/app/(tabs)/labs.tsx:192`**
   - Current: `// TODO: Implement upload functionality`
   - Action: Console.log is fine, mark as future feature
   - Impact: None - just a placeholder

3. **`frontend/apps/admin/src/app/users/page.tsx`** (lines 55, 63)
   - Current: Navigation TODOs
   - Action: Console.log is appropriate for now
   - Impact: None - development mode logging

### Group B: Improve TODO Comments (Make more specific)
1. **`backend/src/notifications/email.service.ts:144`**
   - Current: `// TODO: Add to retry queue in production`
   - Better: `// TODO: Implement email retry queue with Bull/Redis in production`
   - Impact: None - just documentation improvement

2. **`frontend/apps/mobile/components/error-boundary.tsx:40`**
   - Current: `// TODO: Log to error tracking service (Sentry, etc.)`
   - Better: Already specific enough
   - Impact: None

## 🟡 MEDIUM COMPLEXITY (Requires decision/planning)

### Group C: Feature Placeholders (Need product decisions)
1. **`frontend/apps/web/src/components/profile/data-export.tsx:96`**
   - Needs: Backend API endpoint design
   - Complexity: Medium
   - Impact: Medium - user-facing feature

2. **`frontend/apps/web/src/components/profile/settings-preferences.tsx:108`**
   - Needs: Backend API endpoint for settings
   - Complexity: Medium
   - Impact: Low - settings don't persist but UI works

3. **`frontend/apps/web/src/components/profile/user-profile-form.tsx:83`**
   - Needs: Backend API endpoint
   - Complexity: Medium
   - Impact: Medium - profile updates needed

4. **`frontend/apps/mobile/app/plan-detail/[id].tsx:77`**
   - Needs: Backend API integration
   - Complexity: Medium
   - Impact: Medium - action item toggling

## 🔴 COMPLEX (Requires significant work)

### Group D: Major Features (Requires implementation)
1. **File Upload/Download** (`frontend/apps/admin/src/app/lab-results/page.tsx`)
   - Lines 36, 44, 71
   - Needs: S3 integration, file handling, security
   - Complexity: High
   - Impact: High - core feature

2. **Filtering Implementation** (`frontend/apps/admin/`)
   - Lines in action-plans and lab-results
   - Needs: Backend API filters, query params
   - Complexity: Medium
   - Impact: Medium - UX improvement

3. **Modal Implementations**
   - Various admin pages
   - Needs: Modal components, form validation
   - Complexity: Medium
   - Impact: Medium - UX improvement

## 🎯 RECOMMENDED ACTION PLAN

### Immediate (Today - 5 minutes)
1. Improve TODO comment specificity (Group B) - just documentation
2. Mark low-priority TODOs as "Future Enhancement" where appropriate

### Short-term (This week - 2-4 hours)
1. Implement settings API endpoint and wire up settings-preferences
2. Implement profile update API and wire up user-profile-form
3. Add action item toggle functionality

### Medium-term (Next sprint - 1-2 days)
1. Implement data export API and functionality
2. Add admin filtering to backend APIs
3. Create reusable modal components for admin

### Long-term (Backlog)
1. File upload/download with S3 integration
2. Error tracking service integration (Sentry)
3. Analytics service integration
4. Email retry queue with Bull/Redis

## Summary
- **Total TODOs**: 29
- **Easy/No Impact**: 6 (can complete now)
- **Medium Complexity**: 5 (need planning)
- **Complex**: 8 (need significant work)
- **Documentation Only**: 10 (already appropriate)

