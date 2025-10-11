import {
  mockLabResults,
  mockActionPlans,
  mockHealthScore,
  mockProfileStats,
  mockUserProfile,
  generateMockLabResults,
  generateMockActionPlans,
} from '../mock-data';

describe('Mock Data', () => {
  describe('Static Mock Data', () => {
    it('should have lab results', () => {
      expect(mockLabResults).toBeDefined();
      expect(Array.isArray(mockLabResults)).toBe(true);
      expect(mockLabResults.length).toBeGreaterThan(0);
    });

    it('should have valid lab result structure', () => {
      const lab = mockLabResults[0];
      expect(lab).toHaveProperty('id');
      expect(lab).toHaveProperty('fileName');
      expect(lab).toHaveProperty('processingStatus');
      expect(lab).toHaveProperty('uploadedAt');
    });

    it('should have action plans', () => {
      expect(mockActionPlans).toBeDefined();
      expect(Array.isArray(mockActionPlans)).toBe(true);
      expect(mockActionPlans.length).toBeGreaterThan(0);
    });

    it('should have valid action plan structure', () => {
      const plan = mockActionPlans[0];
      expect(plan).toHaveProperty('id');
      expect(plan).toHaveProperty('title');
      expect(plan).toHaveProperty('description');
      expect(plan).toHaveProperty('status');
      expect(plan).toHaveProperty('actionItems');
      expect(Array.isArray(plan.actionItems)).toBe(true);
    });

    it('should have health score', () => {
      expect(mockHealthScore).toBeDefined();
      expect(mockHealthScore).toHaveProperty('overall');
      expect(mockHealthScore).toHaveProperty('overallStatus');
      expect(mockHealthScore).toHaveProperty('categories');
      expect(Array.isArray(mockHealthScore.categories)).toBe(true);
    });

    it('should have valid health score values', () => {
      expect(mockHealthScore.overall).toBeGreaterThanOrEqual(0);
      expect(mockHealthScore.overall).toBeLessThanOrEqual(100);
      expect(['excellent', 'good', 'fair', 'poor']).toContain(mockHealthScore.overallStatus);
    });

    it('should have profile stats', () => {
      expect(mockProfileStats).toBeDefined();
      expect(mockProfileStats).toHaveProperty('totalLabResults');
      expect(mockProfileStats).toHaveProperty('totalActionPlans');
      expect(mockProfileStats).toHaveProperty('healthScore');
    });

    it('should have user profile', () => {
      expect(mockUserProfile).toBeDefined();
      expect(mockUserProfile).toHaveProperty('id');
      expect(mockUserProfile).toHaveProperty('email');
      expect(mockUserProfile).toHaveProperty('name');
    });
  });

  describe('Lab Results Generator', () => {
    it('should generate specified number of lab results', () => {
      const count = 10;
      const results = generateMockLabResults(count);
      
      expect(results).toHaveLength(count);
    });

    it('should generate valid lab results', () => {
      const results = generateMockLabResults(5);
      
      results.forEach(lab => {
        expect(lab).toHaveProperty('id');
        expect(lab).toHaveProperty('fileName');
        expect(lab).toHaveProperty('processingStatus');
        expect(lab).toHaveProperty('uploadedAt');
        expect(['completed', 'processing', 'failed']).toContain(lab.processingStatus);
      });
    });

    it('should generate unique IDs', () => {
      const results = generateMockLabResults(10);
      const ids = results.map(r => r.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should handle large counts', () => {
      const results = generateMockLabResults(100);
      
      expect(results).toHaveLength(100);
      expect(results[0].id).toBe('lab-1');
      expect(results[99].id).toBe('lab-100');
    });
  });

  describe('Action Plans Generator', () => {
    it('should generate specified number of action plans', () => {
      const count = 10;
      const plans = generateMockActionPlans(count);
      
      expect(plans).toHaveLength(count);
    });

    it('should generate valid action plans', () => {
      const plans = generateMockActionPlans(5);
      
      plans.forEach(plan => {
        expect(plan).toHaveProperty('id');
        expect(plan).toHaveProperty('title');
        expect(plan).toHaveProperty('description');
        expect(plan).toHaveProperty('status');
        expect(plan).toHaveProperty('actionItems');
        expect(['active', 'completed', 'paused']).toContain(plan.status);
        expect(Array.isArray(plan.actionItems)).toBe(true);
      });
    });

    it('should generate plans with action items', () => {
      const plans = generateMockActionPlans(5);
      
      plans.forEach(plan => {
        expect(plan.actionItems.length).toBeGreaterThan(0);
        expect(plan.actionItems.length).toBeLessThanOrEqual(5);
      });
    });

    it('should generate unique IDs', () => {
      const plans = generateMockActionPlans(10);
      const ids = plans.map(p => p.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Data Consistency', () => {
    it('should have consistent date formats', () => {
      const lab = mockLabResults[0];
      expect(() => new Date(lab.uploadedAt)).not.toThrow();
      expect(new Date(lab.uploadedAt).getTime()).not.toBeNaN();
    });

    it('should have valid statuses', () => {
      const validLabStatuses = ['completed', 'processing', 'failed'];
      const validPlanStatuses = ['active', 'completed', 'paused'];
      
      mockLabResults.forEach(lab => {
        expect(validLabStatuses).toContain(lab.processingStatus);
      });
      
      mockActionPlans.forEach(plan => {
        expect(validPlanStatuses).toContain(plan.status);
      });
    });

    it('should have consistent user IDs', () => {
      const userId = mockLabResults[0].userId;
      
      mockLabResults.forEach(lab => {
        expect(lab.userId).toBe(userId);
      });
      
      mockActionPlans.forEach(plan => {
        expect(plan.userId).toBe(userId);
      });
    });
  });
});

