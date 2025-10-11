# Testing Guide 🧪

## Overview

This guide covers testing strategies and practices for the Health Platform Mobile App.

---

## 🎯 Testing Stack

- **Test Runner:** Jest 29
- **Test Utilities:** React Native Testing Library
- **Test Preset:** jest-expo
- **Assertion Library:** Jest with @testing-library/jest-native

---

## 📦 Running Tests

### **Run All Tests**
```bash
npm test
```

### **Watch Mode** (auto-rerun on changes)
```bash
npm run test:watch
```

### **Coverage Report**
```bash
npm run test:coverage
```

---

## 📁 Test Structure

```
frontend/apps/mobile/
├── stores/
│   └── __tests__/
│       ├── auth.test.ts           ✅ Auth store tests
│       ├── settings.test.ts       ✅ Settings store tests
│       └── offline.test.ts        ✅ Offline store tests
├── lib/
│   └── analytics/
│       └── __tests__/
│           └── analytics.test.ts  ✅ Analytics tests
└── __mocks__/
    └── __tests__/
        └── mock-data.test.ts      ✅ Mock data tests
```

---

## ✅ Test Coverage

### **Current Coverage:**

| Module | Coverage | Status |
|--------|----------|--------|
| **Stores** | ~90% | ✅ Complete |
| Auth Store | 100% | ✅ |
| Settings Store | 100% | ✅ |
| Offline Store | 100% | ✅ |
| **Analytics** | ~85% | ✅ Complete |
| **Mock Data** | ~90% | ✅ Complete |
| **Components** | 0% | ⏸️ Next |
| **Hooks** | 0% | ⏸️ Next |
| **Screens** | 0% | ⏸️ Next |

**Overall: ~40% coverage** (11/27 test files)

**Target: 70%+ coverage**

---

## 🧪 Unit Tests

### **What's Tested:**

#### ✅ **Auth Store** (`stores/__tests__/auth.test.ts`)
- Initial state
- Setting user and tokens
- Login flow
- Logout flow
- Token updates
- isAuthenticated derivation

#### ✅ **Settings Store** (`stores/__tests__/settings.test.ts`)
- Initial state
- Theme changes
- Language changes
- Biometric toggle
- Onboarding completion
- Offline mode toggle
- Multiple updates

#### ✅ **Offline Store** (`stores/__tests__/offline.test.ts`)
- Initial state
- Online/offline status
- Queue management
- Adding/removing requests
- Clearing queue

#### ✅ **Analytics** (`lib/analytics/__tests__/analytics.test.ts`)
- Initialization
- Enable/disable
- User identification
- Event tracking
- Screen tracking
- User properties
- Error tracking
- Timing tracking

#### ✅ **Mock Data** (`__mocks__/__tests__/mock-data.test.ts`)
- Static mock data validation
- Lab results generation
- Action plans generation
- Data consistency
- Unique IDs
- Valid statuses

---

## 🧩 Component Tests (Coming Soon)

### **Priority Components to Test:**

1. **Skeleton Loader**
   - Renders correctly
   - Animation works
   - Different variants

2. **Error Boundary**
   - Catches errors
   - Shows fallback UI
   - Reset functionality

3. **Offline Indicator**
   - Shows when offline
   - Hides when online
   - Styling correct

4. **Lab Card** (in Labs screen)
   - Renders lab data
   - Shows correct status
   - Accessibility labels

5. **Action Plan Card** (in Plans screen)
   - Renders plan data
   - Shows items count
   - Status indicators

---

## 🔗 Integration Tests (Coming Soon)

### **What to Test:**

1. **API Integration**
   - Mock API calls work
   - Real API calls work
   - Error handling

2. **Navigation Flows**
   - Auth flow (login → dashboard)
   - Tab navigation
   - Protected routes

3. **Data Flow**
   - Store updates trigger re-renders
   - API data updates stores
   - Offline queue syncs

---

## 🎭 E2E Tests (Future)

### **Critical User Flows:**

1. **Registration & Login**
   ```
   Open app → See onboarding → Skip → Register → Auto-login → Dashboard
   ```

2. **View Lab Results**
   ```
   Dashboard → Labs tab → See list → Pull to refresh → Data updates
   ```

3. **Manage Action Plans**
   ```
   Dashboard → Plans tab → See list → Tap plan → View details
   ```

4. **Offline Mode**
   ```
   Turn off network → App still works → Data from cache → Turn on network → Syncs
   ```

---

## 📝 Writing Tests

### **Test Naming Convention:**

```typescript
describe('ComponentName', () => {
  describe('Feature/Method', () => {
    it('should do something specific', () => {
      // Test code
    });
  });
});
```

### **Example Test:**

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '../auth';

describe('Auth Store', () => {
  it('should set user on login', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setUser({ id: '1', email: 'test@test.com' });
    });

    expect(result.current.user).toBeDefined();
    expect(result.current.user?.email).toBe('test@test.com');
  });
});
```

---

## 🔧 Mocking

### **What's Mocked (in jest.setup.js):**

- ✅ AsyncStorage
- ✅ SecureStore
- ✅ NetInfo
- ✅ expo-haptics
- ✅ expo-local-authentication
- ✅ expo-sharing
- ✅ expo-router

### **How to Mock a Module:**

```typescript
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
}));
```

---

## 🎯 Best Practices

### ✅ **DO:**
- Write descriptive test names
- Test one thing per test
- Use `beforeEach` to reset state
- Mock external dependencies
- Test edge cases
- Aim for 70%+ coverage

### ❌ **DON'T:**
- Test implementation details
- Write flaky tests
- Share state between tests
- Test third-party libraries
- Ignore failing tests

---

## 🐛 Troubleshooting

### **Tests Won't Run**

1. Clear Jest cache:
   ```bash
   npx jest --clearCache
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```

### **Tests Failing**

1. Check mock setup in `jest.setup.js`
2. Verify imports are correct
3. Ensure state is reset between tests
4. Check console for error messages

### **Coverage Too Low**

1. Run coverage report:
   ```bash
   npm run test:coverage
   ```

2. Check `coverage/` folder for detailed report
3. Identify untested files
4. Write tests for critical paths first

---

## 📊 Coverage Reports

### **View Coverage**

After running `npm run test:coverage`, open:
```
coverage/lcov-report/index.html
```

### **Coverage Thresholds**

```json
{
  "global": {
    "branches": 70,
    "functions": 70,
    "lines": 70,
    "statements": 70
  }
}
```

---

## 🚀 CI/CD Integration

### **GitHub Actions Example:**

```yaml
- name: Run Tests
  run: |
    cd frontend/apps/mobile
    npm test -- --coverage --watchAll=false

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./frontend/apps/mobile/coverage/lcov.info
```

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🎯 Next Steps

### **Phase 6.1 Complete** ✅
- [x] Set up Jest
- [x] Configure testing environment
- [x] Write store tests (auth, settings, offline)
- [x] Write analytics tests
- [x] Write mock data tests
- [x] Create testing documentation

### **Phase 6.2 Next** ⏸️
- [ ] Component tests
- [ ] Hook tests
- [ ] Screen tests

### **Phase 6.3 After That** ⏸️
- [ ] Integration tests
- [ ] API integration tests
- [ ] Navigation tests

---

**Testing is an ongoing process. Keep adding tests as you add features!** 🧪✅


