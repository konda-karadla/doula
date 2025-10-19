import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedLabResults() {
  console.log('🌱 Seeding lab results...');

  // Get the first user (or create a test user)
  let user = await prisma.user.findFirst({
    where: {
      role: 'user',
    },
  });

  if (!user) {
    console.log('No users found, creating test user...');
    user = await prisma.user.create({
      data: {
        email: 'testuser@example.com',
        username: 'testuser',
        password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // password: password123
        role: 'user',
        profileType: 'patient',
        journeyType: 'general',
        systemId: 'doula-system-id',
      },
    });
    console.log('✅ Created test user:', user.email);
  }

  // Create mock lab results
  const labResult1 = await prisma.labResult.create({
    data: {
      userId: user.id,
      systemId: user.systemId,
      fileName: 'Complete_Blood_Count_2024.pdf',
      s3Key: 'mock/lab-results/cbc-2024.pdf',
      s3Url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Public test PDF
      processingStatus: 'completed',
      rawOcrText: 'Complete Blood Count Test Results...',
      biomarkers: {
        create: [
          {
            testName: 'Hemoglobin',
            value: '14.5',
            unit: 'g/dL',
            referenceRangeLow: '12.0',
            referenceRangeHigh: '16.0',
            testDate: new Date('2024-10-01'),
          },
          {
            testName: 'White Blood Cells',
            value: '7.2',
            unit: 'K/uL',
            referenceRangeLow: '4.0',
            referenceRangeHigh: '11.0',
            testDate: new Date('2024-10-01'),
          },
          {
            testName: 'Platelets',
            value: '250',
            unit: 'K/uL',
            referenceRangeLow: '150',
            referenceRangeHigh: '400',
            testDate: new Date('2024-10-01'),
          },
        ],
      },
    },
  });

  const labResult2 = await prisma.labResult.create({
    data: {
      userId: user.id,
      systemId: user.systemId,
      fileName: 'Metabolic_Panel_2024.pdf',
      s3Key: 'mock/lab-results/metabolic-2024.pdf',
      s3Url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Public test PDF
      processingStatus: 'completed',
      rawOcrText: 'Comprehensive Metabolic Panel...',
      biomarkers: {
        create: [
          {
            testName: 'Glucose',
            value: '95',
            unit: 'mg/dL',
            referenceRangeLow: '70',
            referenceRangeHigh: '100',
            testDate: new Date('2024-09-15'),
          },
          {
            testName: 'Cholesterol',
            value: '185',
            unit: 'mg/dL',
            referenceRangeLow: '0',
            referenceRangeHigh: '200',
            testDate: new Date('2024-09-15'),
          },
          {
            testName: 'HDL Cholesterol',
            value: '55',
            unit: 'mg/dL',
            referenceRangeLow: '40',
            referenceRangeHigh: '100',
            testDate: new Date('2024-09-15'),
          },
          {
            testName: 'LDL Cholesterol',
            value: '110',
            unit: 'mg/dL',
            referenceRangeLow: '0',
            referenceRangeHigh: '100',
            testDate: new Date('2024-09-15'),
            notes: 'Slightly elevated',
          },
        ],
      },
    },
  });

  const labResult3 = await prisma.labResult.create({
    data: {
      userId: user.id,
      systemId: user.systemId,
      fileName: 'Thyroid_Panel_2024.pdf',
      s3Key: 'mock/lab-results/thyroid-2024.pdf',
      s3Url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Public test PDF
      processingStatus: 'processing',
      rawOcrText: null,
    },
  });

  console.log('✅ Created lab results:');
  console.log('  - Complete Blood Count (completed)');
  console.log('  - Metabolic Panel (completed)');
  console.log('  - Thyroid Panel (processing)');
  console.log(`\n📊 Total biomarkers created: 7`);
  console.log(`👤 User: ${user.email} (ID: ${user.id})`);
}

seedLabResults()
  .catch((e) => {
    console.error('❌ Error seeding lab results:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

