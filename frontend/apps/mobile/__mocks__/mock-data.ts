/**
 * Mock Data for Testing
 * 
 * Toggle between mock and real data by setting USE_MOCK_DATA
 */

export const USE_MOCK_DATA = true; // Set to false to use real API

// Mock Lab Results
export const mockLabResults = [
  {
    id: '1',
    userId: 'user-1',
    systemId: 'functional_health',
    fileName: 'Complete Blood Count - Jan 2025.pdf',
    fileUrl: 'https://example.com/lab1.pdf',
    processingStatus: 'completed',
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    processedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    userId: 'user-1',
    systemId: 'functional_health',
    fileName: 'Comprehensive Metabolic Panel.pdf',
    fileUrl: 'https://example.com/lab2.pdf',
    processingStatus: 'completed',
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    processedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    userId: 'user-1',
    systemId: 'functional_health',
    fileName: 'Thyroid Panel - TSH, T3, T4.pdf',
    fileUrl: 'https://example.com/lab3.pdf',
    processingStatus: 'processing',
    uploadedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    processedAt: null,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    userId: 'user-1',
    systemId: 'functional_health',
    fileName: 'Vitamin D & B12 Levels.pdf',
    fileUrl: 'https://example.com/lab4.pdf',
    processingStatus: 'completed',
    uploadedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    processedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    userId: 'user-1',
    systemId: 'functional_health',
    fileName: 'Lipid Panel - Cholesterol.pdf',
    fileUrl: 'https://example.com/lab5.pdf',
    processingStatus: 'completed',
    uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    processedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    userId: 'user-1',
    systemId: 'functional_health',
    fileName: 'Hemoglobin A1C - Diabetes Check.pdf',
    fileUrl: 'https://example.com/lab6.pdf',
    processingStatus: 'completed',
    uploadedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    userId: 'user-1',
    systemId: 'functional_health',
    fileName: 'Liver Function Test.pdf',
    fileUrl: 'https://example.com/lab7.pdf',
    processingStatus: 'completed',
    uploadedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    userId: 'user-1',
    systemId: 'functional_health',
    fileName: 'Kidney Function - Creatinine.pdf',
    fileUrl: 'https://example.com/lab8.pdf',
    processingStatus: 'failed',
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Action Plans
export const mockActionPlans = [
  {
    id: '1',
    userId: 'user-1',
    systemId: 'functional_health',
    title: 'Improve Vitamin D Levels',
    description: 'Increase vitamin D through supplementation and sun exposure to reach optimal levels of 50-70 ng/mL',
    status: 'active',
    priority: 'high',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    actionItems: [
      {
        id: 'item-1',
        title: 'Take Vitamin D3 5000 IU daily',
        description: 'Take with a fatty meal for better absorption',
        status: 'completed',
        order: 1,
      },
      {
        id: 'item-2',
        title: 'Get 15 minutes of sun exposure daily',
        description: 'Expose arms and legs between 10am-2pm',
        status: 'in_progress',
        order: 2,
      },
      {
        id: 'item-3',
        title: 'Retest vitamin D levels in 3 months',
        description: 'Schedule follow-up blood test',
        status: 'pending',
        order: 3,
      },
    ],
  },
  {
    id: '2',
    userId: 'user-1',
    systemId: 'functional_health',
    title: 'Lower Cholesterol Naturally',
    description: 'Reduce LDL cholesterol through diet and exercise to below 100 mg/dL',
    status: 'active',
    priority: 'high',
    targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    actionItems: [
      {
        id: 'item-4',
        title: 'Add 2 servings of fatty fish weekly',
        description: 'Salmon, mackerel, or sardines',
        status: 'in_progress',
        order: 1,
      },
      {
        id: 'item-5',
        title: 'Exercise 30 minutes, 5 days/week',
        description: 'Cardio or brisk walking',
        status: 'in_progress',
        order: 2,
      },
      {
        id: 'item-6',
        title: 'Eliminate trans fats from diet',
        description: 'Read labels and avoid partially hydrogenated oils',
        status: 'completed',
        order: 3,
      },
      {
        id: 'item-7',
        title: 'Add soluble fiber (oats, beans)',
        description: '5-10 grams daily',
        status: 'pending',
        order: 4,
      },
    ],
  },
  {
    id: '3',
    userId: 'user-1',
    systemId: 'functional_health',
    title: 'Optimize Sleep Quality',
    description: 'Improve sleep duration and quality to 7-8 hours per night with deep sleep phases',
    status: 'active',
    priority: 'medium',
    targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    actionItems: [
      {
        id: 'item-8',
        title: 'Set consistent bedtime at 10 PM',
        description: 'Go to bed and wake up at same time daily',
        status: 'in_progress',
        order: 1,
      },
      {
        id: 'item-9',
        title: 'No screens 1 hour before bed',
        description: 'Use blue light blocking glasses if needed',
        status: 'pending',
        order: 2,
      },
      {
        id: 'item-10',
        title: 'Create dark, cool bedroom',
        description: 'Temperature 65-68°F, blackout curtains',
        status: 'completed',
        order: 3,
      },
    ],
  },
  {
    id: '4',
    userId: 'user-1',
    systemId: 'functional_health',
    title: 'Reduce Inflammation',
    description: 'Lower C-reactive protein (CRP) levels through anti-inflammatory lifestyle',
    status: 'paused',
    priority: 'medium',
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    actionItems: [
      {
        id: 'item-11',
        title: 'Add turmeric and ginger to diet',
        description: 'Use in cooking or as tea',
        status: 'pending',
        order: 1,
      },
      {
        id: 'item-12',
        title: 'Eliminate refined sugar',
        description: 'No added sugars or sweetened beverages',
        status: 'pending',
        order: 2,
      },
    ],
  },
  {
    id: '5',
    userId: 'user-1',
    systemId: 'functional_health',
    title: 'Improve Gut Health',
    description: 'Restore healthy gut microbiome and reduce digestive issues',
    status: 'completed',
    priority: 'low',
    targetDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    actionItems: [
      {
        id: 'item-13',
        title: 'Take probiotic supplement daily',
        description: '10+ billion CFU, multiple strains',
        status: 'completed',
        order: 1,
      },
      {
        id: 'item-14',
        title: 'Eat fermented foods',
        description: 'Yogurt, kefir, sauerkraut, kimchi',
        status: 'completed',
        order: 2,
      },
      {
        id: 'item-15',
        title: 'Increase prebiotic fiber',
        description: 'Onions, garlic, asparagus, bananas',
        status: 'completed',
        order: 3,
      },
    ],
  },
];

// Mock Health Score
export const mockHealthScore = {
  // Dashboard expects these field names:
  overall: 78,  // overall score (not overallScore)
  overallScore: 78,  // Keep for compatibility
  overallStatus: 'good',  // overall status (not status)
  status: 'good',  // Keep for compatibility
  trend: 'improving',  // trend at top level (not trends.trend)
  totalBiomarkers: 30,  // total biomarkers analyzed
  lastUpdated: new Date().toISOString(),
  
  // Additional data
  categories: [
    {
      category: 'Cardiovascular',
      score: 85,
      status: 'excellent',
      biomarkerCount: 5,
      description: 'Your heart health metrics are excellent',
    },
    {
      category: 'Metabolic',
      score: 72,
      status: 'good',
      biomarkerCount: 8,
      description: 'Good metabolic function with room for improvement',
    },
    {
      category: 'Immune',
      score: 68,
      status: 'fair',
      biomarkerCount: 4,
      description: 'Immune markers show some areas of concern',
    },
    {
      category: 'Hormonal',
      score: 80,
      status: 'good',
      biomarkerCount: 6,
      description: 'Hormones are well balanced',
    },
    {
      category: 'Nutritional',
      score: 65,
      status: 'fair',
      biomarkerCount: 7,
      description: 'Several nutritional deficiencies detected',
    },
  ],
  trends: {
    lastMonth: 75,
    trend: 'improving',
    change: 3,
  },
  recommendations: [
    'Increase vitamin D supplementation to 5000 IU daily',
    'Add more omega-3 rich foods to your diet',
    'Consider stress management techniques for cortisol levels',
  ],
};

// Mock Profile Stats
export const mockProfileStats = {
  // Dashboard expects these fields:
  totalLabResults: 8,
  totalActionPlans: 4,  // Total action plans (not just active)
  activeActionPlans: 3,  // Keep for compatibility
  completedActionPlans: 1,
  completedActionItems: 12,  // Completed action items
  pendingActionItems: 8,  // Pending action items
  healthScore: 78,
  accountCreated: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months ago
};

// Mock User Profile
export const mockUserProfile = {
  id: 'user-1',
  email: 'demo@healthplatform.com',
  name: 'Demo User',
  firstName: 'Demo',
  lastName: 'User',
  dateOfBirth: new Date(1990, 0, 1).toISOString(),
  gender: 'other',
  phone: '+1 (555) 123-4567',
  systemId: 'functional_health',
  profileType: 'individual',
  journeyType: 'optimizer',
  language: 'en',
  onboardingCompleted: true,
  createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock Insights
export const mockInsights = {
  summary: 'Based on your recent lab results, you show good overall health with a few areas requiring attention.',
  keyFindings: [
    {
      type: 'concern',
      title: 'Low Vitamin D',
      description: 'Your vitamin D level is 22 ng/mL, which is below optimal range (30-50 ng/mL)',
      recommendation: 'Increase supplementation and sun exposure',
    },
    {
      type: 'positive',
      title: 'Excellent Cholesterol Ratio',
      description: 'Your HDL/LDL ratio is optimal at 2.5, indicating good cardiovascular health',
      recommendation: 'Continue current diet and exercise routine',
    },
    {
      type: 'watch',
      title: 'Borderline Blood Sugar',
      description: 'Fasting glucose at 98 mg/dL is slightly elevated but still in normal range',
      recommendation: 'Monitor carbohydrate intake and consider reducing sugar',
    },
  ],
  insights: [
    {
      category: 'Cardiovascular',
      message: 'Your heart health markers are excellent. Total cholesterol is 180 mg/dL with good HDL at 60 mg/dL.',
      biomarkers: ['Total Cholesterol', 'HDL', 'LDL', 'Triglycerides'],
    },
    {
      category: 'Metabolic',
      message: 'Blood sugar control is good but could be optimized. A1C at 5.6% is normal but on the higher end.',
      biomarkers: ['Glucose', 'HbA1C', 'Insulin'],
    },
    {
      category: 'Nutritional',
      message: 'Vitamin D deficiency detected. Other vitamins and minerals are within normal range.',
      biomarkers: ['Vitamin D', 'Vitamin B12', 'Iron', 'Magnesium'],
    },
  ],
  aiInsights: 'Your lab results show a pattern consistent with a healthy lifestyle. The vitamin D deficiency is common and easily correctable. Focus on maintaining your good cardiovascular health while addressing the vitamin deficiency.',
  generatedAt: new Date().toISOString(),
};

// Generate additional mock data for performance testing
export function generateMockLabResults(count: number) {
  const statuses = ['completed', 'processing', 'failed'];
  const fileNames = [
    'Complete Blood Count',
    'Metabolic Panel',
    'Thyroid Panel',
    'Vitamin Levels',
    'Lipid Panel',
    'Hormone Panel',
    'Liver Function Test',
    'Kidney Function Test',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `lab-${i + 1}`,
    userId: 'user-1',
    systemId: 'functional_health',
    fileName: `${fileNames[i % fileNames.length]} - ${new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}.pdf`,
    fileUrl: `https://example.com/lab${i + 1}.pdf`,
    processingStatus: statuses[i % statuses.length],
    uploadedAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: statuses[i % statuses.length] === 'completed' 
      ? new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString() 
      : null,
    createdAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

export function generateMockActionPlans(count: number) {
  const statuses = ['active', 'completed', 'paused'];
  const priorities = ['high', 'medium', 'low'];
  const titles = [
    'Improve Vitamin D Levels',
    'Lower Cholesterol',
    'Optimize Sleep',
    'Reduce Inflammation',
    'Improve Gut Health',
    'Boost Energy Levels',
    'Balance Hormones',
    'Strengthen Immune System',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `plan-${i + 1}`,
    userId: 'user-1',
    systemId: 'functional_health',
    title: titles[i % titles.length],
    description: `Action plan ${i + 1} to improve overall health and wellness`,
    status: statuses[i % statuses.length],
    priority: priorities[i % priorities.length],
    targetDate: new Date(Date.now() + (30 + i * 15) * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - (i % 3) * 24 * 60 * 60 * 1000).toISOString(),
    actionItems: Array.from({ length: 2 + (i % 3) }, (_, j) => ({
      id: `item-${i}-${j}`,
      title: `Action item ${j + 1}`,
      description: `Description for action item ${j + 1}`,
      status: j === 0 ? 'completed' : 'pending',
      order: j + 1,
    })),
  }));
}

