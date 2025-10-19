# Mock Data for Testing 🎭

This directory contains mock/fake data for testing the mobile app without needing a backend connection.

## 🎯 Purpose

- **Test UI components** with realistic data
- **Test performance** with large datasets (20+ items)
- **Test loading states** with simulated API delays
- **Develop offline** without backend connection
- **Demo the app** with sample data

---

## 🚀 Quick Start

### Enable Mock Data

Open `__mocks__/mock-data.ts` and set:

```typescript
export const USE_MOCK_DATA = true; // Set to false to use real API
```

### Disable Mock Data

```typescript
export const USE_MOCK_DATA = false; // Use real backend API
```

---

## 📦 What's Included

### **Lab Results** (20 items)
- 8 predefined realistic lab results
- Status: completed, processing, failed
- Various test types (blood count, metabolic panel, thyroid, etc.)
- Recent to historical (1 hour to 60 days old)
- Generator function for more items: `generateMockLabResults(count)`

### **Action Plans** (15 items)
- 5 predefined action plans with items
- Status: active, completed, paused
- Priority levels: high, medium, low
- 2-4 action items per plan
- Generator function for more items: `generateMockActionPlans(count)`

### **Health Score**
- Overall score: 78
- 5 category scores (Cardiovascular, Metabolic, Immune, Hormonal, Nutritional)
- Trends and recommendations
- Status indicators

### **Profile Stats**
- Total lab results count
- Active/completed action plans
- Health score
- Account creation date

### **User Profile**
- Demo user information
- System settings
- Onboarding status

### **Health Insights**
- AI-generated insights
- Key findings (concerns, positives, watch items)
- Category-specific insights
- Recommendations

---

## 🔧 How It Works

### Automatic Hook Integration

The mock data is automatically used when `USE_MOCK_DATA = true`:

```typescript
// hooks/use-lab-results.ts
export function useLabResults() {
  return useQuery({
    queryKey: ['labs', 'list'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API
        return generateMockLabResults(20); // Return mock data
      }
      return labService.list(); // Real API call
    },
  });
}
```

### Simulated API Delays

Mock data includes realistic delays:
- Lab results: 800ms
- Action plans: 600ms
- Health score: 700ms
- Profile stats: 500ms

This lets you test loading states and skeleton loaders!

---

## 🎨 Customizing Mock Data

### Change Number of Items

In `__mocks__/mock-data.ts`, modify the generator calls:

```typescript
// More items for stress testing
return generateMockLabResults(100); // 100 lab results

// Fewer items for quick testing
return mockLabResults; // Just 8 items
```

### Add Custom Data

Edit the arrays in `mock-data.ts`:

```typescript
export const mockLabResults = [
  // Add your custom lab result here
  {
    id: 'custom-1',
    fileName: 'My Custom Lab.pdf',
    processingStatus: 'completed',
    // ... other fields
  },
  // ... existing items
];
```

### Change API Delays

Adjust the timeout values in hooks:

```typescript
// Faster for quick testing
await new Promise(resolve => setTimeout(resolve, 100));

// Slower to test slow networks
await new Promise(resolve => setTimeout(resolve, 3000));

// No delay
// Remove the await line completely
```

---

## 🧪 Testing Scenarios

### Test Performance with Large Lists

```typescript
// In mock-data.ts
return generateMockLabResults(100); // 100 items
return generateMockActionPlans(50);  // 50 items
```

Now test:
- Scroll performance
- Memory usage
- FlatList virtualization
- Skeleton loaders

### Test Loading States

```typescript
// Increase delay to see skeletons longer
await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds
```

### Test Empty States

```typescript
// Return empty arrays
return []; // No items
```

### Test Error States

```typescript
// Throw an error
throw new Error('Mock API error');
```

### Test Different Statuses

The mock data includes various statuses:
- Lab results: `completed`, `processing`, `failed`
- Action plans: `active`, `completed`, `paused`

---

## 📱 What You Can Test

### ✅ **UI Components**
- Card layouts
- List rendering
- Empty states
- Loading states

### ✅ **Performance**
- Scroll performance with 20+ items
- FlatList virtualization
- Memory usage
- Render optimization

### ✅ **Navigation**
- Navigate between screens
- Pull-to-refresh
- Deep linking (when added)

### ✅ **Interactions**
- Tap cards
- Swipe actions (when added)
- Share functionality
- Haptic feedback

### ✅ **Offline Mode**
- Works without internet
- No backend needed
- Perfect for airplane coding ✈️

---

## 🎭 Realistic Data

The mock data is designed to be realistic:

### Lab Results
- ✅ Real lab test names (CBC, CMP, Thyroid Panel)
- ✅ Realistic file names with dates
- ✅ Various processing states
- ✅ Chronological ordering

### Action Plans
- ✅ Real health goals (Vitamin D, Cholesterol, Sleep)
- ✅ Actionable items with descriptions
- ✅ Progress tracking
- ✅ Multiple priorities

### Health Score
- ✅ Realistic score ranges (0-100)
- ✅ Category breakdowns
- ✅ Trend analysis
- ✅ Actionable recommendations

---

## 🔄 Switching Between Mock and Real

### Development Workflow

1. **Start with mock data** - Test UI quickly
   ```typescript
   export const USE_MOCK_DATA = true;
   ```

2. **Switch to real API** - Test integration
   ```typescript
   export const USE_MOCK_DATA = false;
   ```

3. **Toggle as needed** - Best of both worlds!

### Environment-Based Toggle (Optional)

You can make it automatic based on environment:

```typescript
// In mock-data.ts
export const USE_MOCK_DATA = __DEV__ && process.env.EXPO_PUBLIC_USE_MOCK === 'true';
```

Then in `.env`:
```bash
EXPO_PUBLIC_USE_MOCK=true  # Use mock data
```

---

## 📊 Mock Data Statistics

| Data Type | Default Count | Max Count | Delay |
|-----------|--------------|-----------|-------|
| Lab Results | 8 | 100+ | 800ms |
| Action Plans | 5 | 50+ | 600ms |
| Health Score | 1 | 1 | 700ms |
| Profile Stats | 1 | 1 | 500ms |

---

## 🎯 Best Practices

### ✅ DO:
- Use mock data for UI development
- Test with realistic data volumes
- Simulate API delays for loading states
- Switch to real API before production

### ❌ DON'T:
- Commit with `USE_MOCK_DATA = true` to production
- Use mock data for real user testing
- Skip testing with real API entirely
- Forget to test error states

---

## 🐛 Troubleshooting

### Mock data not showing?

1. Check `USE_MOCK_DATA` is `true`
2. Clear Metro cache: `npm run start:clean`
3. Restart the app
4. Check console for errors

### Loading forever?

- Check if API delay is too long
- Reduce timeout in hooks
- Check if query is enabled

### Empty screens?

- Verify mock data arrays aren't empty
- Check `console.log` in hooks to see what's returned
- Ensure hooks are being called

---

## 🚀 Next Steps

Now that you have mock data:

1. **Test the app**: Run `npm start` and navigate through screens
2. **Test performance**: Increase item counts and scroll
3. **Test loading**: Increase delays to see skeleton loaders
4. **Test accessibility**: Enable VoiceOver/TalkBack
5. **Demo the app**: Show stakeholders with realistic data

---

## 📝 Example Usage

```typescript
// In your component
import { useLabResults } from '@/hooks/use-lab-results';

function LabResultsScreen() {
  const { data, isLoading } = useLabResults();
  
  // If USE_MOCK_DATA = true:
  // - data will be mock lab results
  // - isLoading will be true for 800ms
  
  // If USE_MOCK_DATA = false:
  // - data will come from real API
  // - isLoading depends on network
  
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <LabCard lab={item} />}
    />
  );
}
```

---

**Happy Testing! 🎉**

Remember: Toggle `USE_MOCK_DATA` in `__mocks__/mock-data.ts` to switch between mock and real data.


