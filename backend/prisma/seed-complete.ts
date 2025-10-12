import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedComplete() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  // 0. GET OR CREATE SYSTEMS
  const systems = await Promise.all([
    prisma.system.upsert({ where: { slug: 'doula' }, update: {}, create: { name: 'Doula Care', slug: 'doula' } }),
    prisma.system.upsert({ where: { slug: 'functional_health' }, update: {}, create: { name: 'Functional Health', slug: 'functional_health' } }),
    prisma.system.upsert({ where: { slug: 'elderly_care' }, update: {}, create: { name: 'Elderly Care', slug: 'elderly_care' } }),
  ]);
  
  const [doulaSystem, functionalSystem, elderlySystem] = systems;
  console.log(`✅ Systems ready\n`);

  // 1. CREATE USERS
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const timestamp = Date.now();
  
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        email: 'john.doe@example.com',
        username: `johndoe_${timestamp}`,
        password: hashedPassword,
        role: 'user',
        profileType: 'patient',
        journeyType: 'general',
        systemId: functionalSystem.id,
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1-555-0101',
        dateOfBirth: new Date('1985-03-15'),
        healthGoals: ['Weight loss', 'Better sleep', 'Reduce stress'],
      },
    }),
    prisma.user.upsert({
      where: { email: 'sarah.smith@example.com' },
      update: {},
      create: {
        email: 'sarah.smith@example.com',
        username: `sarahsmith_${timestamp}`,
        password: hashedPassword,
        role: 'user',
        profileType: 'patient',
        journeyType: 'prenatal',
        systemId: doulaSystem.id,
        firstName: 'Sarah',
        lastName: 'Smith',
        phoneNumber: '+1-555-0102',
        dateOfBirth: new Date('1992-07-22'),
        healthGoals: ['Healthy pregnancy', 'Nutrition tracking'],
      },
    }),
    prisma.user.upsert({
      where: { email: 'mike.johnson@example.com' },
      update: {},
      create: {
        email: 'mike.johnson@example.com',
        username: `mikej_${timestamp}`,
        password: hashedPassword,
        role: 'user',
        profileType: 'patient',
        journeyType: 'general',
        systemId: elderlySystem.id,
        firstName: 'Mike',
        lastName: 'Johnson',
        phoneNumber: '+1-555-0103',
        dateOfBirth: new Date('1955-11-08'),
        healthGoals: ['Manage diabetes', 'Improve mobility'],
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users\n`);

  // 2. CREATE LAB RESULTS
  console.log('🧪 Creating lab results...');
  
  const labResults = await Promise.all([
    // John's labs
    prisma.labResult.create({
      data: {
        userId: users[0].id,
        systemId: users[0].systemId,
        fileName: 'Complete_Metabolic_Panel_Oct2024.pdf',
        s3Key: 'labs/john/metabolic-oct2024.pdf',
        s3Url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        processingStatus: 'completed',
        biomarkers: {
          create: [
            { testName: 'Glucose', value: '105', unit: 'mg/dL', referenceRangeLow: '70', referenceRangeHigh: '100', testDate: new Date('2024-10-05'), notes: 'Slightly elevated' },
            { testName: 'Cholesterol', value: '220', unit: 'mg/dL', referenceRangeLow: '0', referenceRangeHigh: '200', testDate: new Date('2024-10-05'), notes: 'Above optimal' },
            { testName: 'Hemoglobin A1c', value: '5.9', unit: '%', referenceRangeLow: '4.0', referenceRangeHigh: '5.6', testDate: new Date('2024-10-05') },
          ],
        },
      },
    }),
    // Sarah's labs
    prisma.labResult.create({
      data: {
        userId: users[1].id,
        systemId: users[1].systemId,
        fileName: 'Prenatal_Panel_Sept2024.pdf',
        s3Key: 'labs/sarah/prenatal-sept2024.pdf',
        s3Url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        processingStatus: 'completed',
        biomarkers: {
          create: [
            { testName: 'Hemoglobin', value: '13.2', unit: 'g/dL', referenceRangeLow: '12.0', referenceRangeHigh: '16.0', testDate: new Date('2024-09-20') },
            { testName: 'Vitamin D', value: '45', unit: 'ng/mL', referenceRangeLow: '30', referenceRangeHigh: '100', testDate: new Date('2024-09-20') },
          ],
        },
      },
    }),
    // Mike's labs
    prisma.labResult.create({
      data: {
        userId: users[2].id,
        systemId: users[2].systemId,
        fileName: 'Diabetes_Monitoring_Oct2024.pdf',
        s3Key: 'labs/mike/diabetes-oct2024.pdf',
        s3Url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        processingStatus: 'completed',
        biomarkers: {
          create: [
            { testName: 'Glucose', value: '145', unit: 'mg/dL', referenceRangeLow: '70', referenceRangeHigh: '100', testDate: new Date('2024-10-08'), notes: 'Elevated - monitor closely' },
            { testName: 'Hemoglobin A1c', value: '7.2', unit: '%', referenceRangeLow: '4.0', referenceRangeHigh: '5.6', testDate: new Date('2024-10-08'), notes: 'Above target' },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${labResults.length} lab results with biomarkers\n`);

  // 3. CREATE ACTION PLANS
  console.log('🎯 Creating action plans...');
  
  const actionPlans = await Promise.all([
    // John's action plan
    prisma.actionPlan.create({
      data: {
        userId: users[0].id,
        systemId: users[0].systemId,
        title: 'Weight Management & Cholesterol Control',
        description: 'Focus on reducing cholesterol through diet and exercise',
        status: 'active',
        actionItems: {
          create: [
            { title: 'Daily 30-minute walk', status: 'pending', priority: 'high', dueDate: new Date('2024-10-20') },
            { title: 'Track daily calorie intake', status: 'pending', priority: 'medium', dueDate: new Date('2024-10-15') },
            { title: 'Reduce saturated fat intake', status: 'completed', priority: 'high', completedAt: new Date('2024-10-10') },
          ],
        },
      },
    }),
    // Sarah's action plan
    prisma.actionPlan.create({
      data: {
        userId: users[1].id,
        systemId: users[1].systemId,
        title: 'Prenatal Wellness Plan',
        description: 'Nutrition and exercise plan for healthy pregnancy',
        status: 'active',
        actionItems: {
          create: [
            { title: 'Take prenatal vitamins daily', status: 'completed', priority: 'urgent', completedAt: new Date('2024-10-01') },
            { title: 'Weekly prenatal yoga classes', status: 'pending', priority: 'medium', dueDate: new Date('2024-10-25') },
            { title: 'Monitor weight weekly', status: 'pending', priority: 'high', dueDate: new Date('2024-10-15') },
            { title: 'Maintain food diary', status: 'completed', priority: 'medium', completedAt: new Date('2024-10-05') },
          ],
        },
      },
    }),
    // Mike's action plan
    prisma.actionPlan.create({
      data: {
        userId: users[2].id,
        systemId: users[2].systemId,
        title: 'Diabetes Management Plan',
        description: 'Blood sugar control through diet, exercise, and medication',
        status: 'active',
        actionItems: {
          create: [
            { title: 'Check blood sugar 3x daily', status: 'pending', priority: 'urgent', dueDate: new Date('2024-10-30') },
            { title: 'Take medication as prescribed', status: 'completed', priority: 'urgent', completedAt: new Date('2024-10-12') },
            { title: 'Low-carb meal planning', status: 'pending', priority: 'high', dueDate: new Date('2024-10-20') },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${actionPlans.length} action plans with items\n`);

  // 4. CREATE DOCTORS
  console.log('👨‍⚕️ Creating doctors...');
  
  const doctors = await Promise.all([
    prisma.doctor.upsert({
      where: { id: 'doctor-1' },
      update: {},
      create: {
        id: 'doctor-1',
        systemId: functionalSystem.id,
        name: 'Dr. Emily Chen',
        specialization: 'Functional Medicine',
        bio: 'Board-certified functional medicine physician with 15 years of experience in metabolic health and chronic disease management.',
        qualifications: ['MD', 'Board Certified Internal Medicine', 'Institute for Functional Medicine Certified'],
        experience: 15,
        consultationFee: 150,
        isActive: true,
        availabilitySlots: {
          create: [
            { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true }, // Monday
            { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isActive: true }, // Tuesday
            { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isActive: true }, // Wednesday
            { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isActive: true }, // Thursday
          ],
        },
      },
    }),
    prisma.doctor.upsert({
      where: { id: 'doctor-2' },
      update: {},
      create: {
        id: 'doctor-2',
        systemId: doulaSystem.id,
        name: 'Dr. Maria Rodriguez',
        specialization: 'Obstetrics & Prenatal Care',
        bio: 'Experienced OB-GYN specializing in high-risk pregnancies and holistic prenatal care.',
        qualifications: ['MD', 'OB-GYN', 'Certified Doula Trainer'],
        experience: 12,
        consultationFee: 200,
        isActive: true,
        availabilitySlots: {
          create: [
            { dayOfWeek: 1, startTime: '10:00', endTime: '16:00', isActive: true },
            { dayOfWeek: 3, startTime: '10:00', endTime: '16:00', isActive: true },
            { dayOfWeek: 5, startTime: '10:00', endTime: '16:00', isActive: true },
          ],
        },
      },
    }),
    prisma.doctor.upsert({
      where: { id: 'doctor-3' },
      update: {},
      create: {
        id: 'doctor-3',
        systemId: elderlySystem.id,
        name: 'Dr. Robert Williams',
        specialization: 'Geriatrics & Diabetes',
        bio: 'Geriatric specialist focusing on diabetes management and elderly care coordination.',
        qualifications: ['MD', 'Geriatrics Board Certified', 'Diabetes Educator'],
        experience: 20,
        consultationFee: 175,
        isActive: true,
        availabilitySlots: {
          create: [
            { dayOfWeek: 2, startTime: '08:00', endTime: '14:00', isActive: true },
            { dayOfWeek: 4, startTime: '08:00', endTime: '14:00', isActive: true },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${doctors.length} doctors with availability\n`);

  // 5. CREATE CONSULTATIONS
  console.log('📅 Creating consultations...');
  
  const consultations = await Promise.all([
    prisma.consultation.create({
      data: {
        userId: users[0].id,
        doctorId: doctors[0].id,
        scheduledAt: new Date('2024-10-15T10:00:00Z'),
        duration: 30,
        type: 'VIDEO',
        status: 'SCHEDULED',
        fee: 150,
        isPaid: true,
        meetingLink: 'https://meet.example.com/john-dr-chen-12345',
      },
    }),
    prisma.consultation.create({
      data: {
        userId: users[1].id,
        doctorId: doctors[1].id,
        scheduledAt: new Date('2024-10-16T14:00:00Z'),
        duration: 45,
        type: 'VIDEO',
        status: 'CONFIRMED',
        fee: 200,
        isPaid: true,
        meetingLink: 'https://meet.example.com/sarah-dr-rodriguez-67890',
      },
    }),
    prisma.consultation.create({
      data: {
        userId: users[2].id,
        doctorId: doctors[2].id,
        scheduledAt: new Date('2024-10-12T09:00:00Z'),
        duration: 30,
        type: 'IN_PERSON',
        status: 'COMPLETED',
        fee: 175,
        isPaid: true,
        notes: 'Patient discussed diabetes management. Blood sugar levels improving.',
        prescription: 'Continue Metformin 500mg twice daily. Increase fiber intake.',
      },
    }),
  ]);

  console.log(`✅ Created ${consultations.length} consultations\n`);

  // 6. SUMMARY
  console.log('📊 SEEDING COMPLETE!\n');
  console.log('Summary:');
  console.log(`  👥 Users: ${users.length}`);
  console.log(`  🧪 Lab Results: ${labResults.length}`);
  console.log(`  🎯 Action Plans: ${actionPlans.length}`);
  console.log(`  👨‍⚕️ Doctors: ${doctors.length}`);
  console.log(`  📅 Consultations: ${consultations.length}\n`);
  
  console.log('🔐 Test Credentials:');
  console.log('  Email: john.doe@example.com');
  console.log('  Email: sarah.smith@example.com');
  console.log('  Email: mike.johnson@example.com');
  console.log('  Password: password123\n');
}

seedComplete()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

