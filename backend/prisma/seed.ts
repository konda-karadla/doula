import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const systems = [
    {
      name: 'Doula Care',
      slug: 'doula',
    },
    {
      name: 'Functional Health',
      slug: 'functional_health',
    },
    {
      name: 'Elderly Care',
      slug: 'elderly_care',
    },
  ];

  for (const systemData of systems) {
    const system = await prisma.system.upsert({
      where: { slug: systemData.slug },
      update: {},
      create: systemData,
    });
    console.log(`✅ Created/verified system: ${system.name} (${system.slug})`);

    const sampleConfig = await prisma.systemConfig.upsert({
      where: {
        systemId_configKey: {
          systemId: system.id,
          configKey: 'max_file_upload_size',
        },
      },
      update: {},
      create: {
        systemId: system.id,
        configKey: 'max_file_upload_size',
        configValue: '10485760',
        dataType: 'number',
      },
    });
    console.log(
      `  ⚙️  Config: ${sampleConfig.configKey} = ${sampleConfig.configValue}`,
    );

    const labUploadFlag = await prisma.featureFlag.upsert({
      where: {
        systemId_flagName: {
          systemId: system.id,
          flagName: 'lab_upload_enabled',
        },
      },
      update: {},
      create: {
        systemId: system.id,
        flagName: 'lab_upload_enabled',
        isEnabled: true,
        rolloutPercentage: 100,
      },
    });
    console.log(
      `  🚩 Feature flag: ${labUploadFlag.flagName} = ${labUploadFlag.isEnabled}`,
    );
  }

  // Create sample users (including admin)
  console.log('\n👥 Creating sample users...');
  
  const doulaSystem = await prisma.system.findUnique({
    where: { slug: 'doula' },
  });

  if (doulaSystem) {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@healthplatform.com' },
      update: {
        role: 'admin', // Ensure role is set to admin
      },
      create: {
        email: 'admin@healthplatform.com',
        username: 'admin',
        password: adminPassword,
        role: 'admin',
        language: 'en',
        profileType: 'individual',
        journeyType: 'optimizer',
        systemId: doulaSystem.id,
      },
    });
    console.log(`✅ Admin user: ${adminUser.email} (password: admin123)`);

    // Create sample regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const regularUser = await prisma.user.upsert({
      where: { email: 'user@healthplatform.com' },
      update: {},
      create: {
        email: 'user@healthplatform.com',
        username: 'johndoe',
        password: userPassword,
        role: 'user',
        language: 'en',
        profileType: 'individual',
        journeyType: 'optimizer',
        systemId: doulaSystem.id,
      },
    });
    console.log(`✅ Regular user: ${regularUser.email} (password: user123)`);

    // Create sample doctors
    console.log('\n👨‍⚕️ Creating sample doctors...');
    
    const doctors = [
      {
        name: 'Dr. Sarah Johnson',
        specialization: 'Obstetrics & Gynecology',
        bio: 'Board-certified OBGYN with 15+ years of experience specializing in prenatal and postnatal care. Passionate about supporting families through their fertility journey.',
        qualifications: ['MD - Johns Hopkins University', 'MBBS - Stanford Medical School', 'Board Certified OBGYN'],
        experience: 15,
        consultationFee: '2500.00',
        imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        isActive: true,
        availability: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
          { dayOfWeek: 3, startTime: '09:00', endTime: '13:00' }, // Wednesday
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
          { dayOfWeek: 5, startTime: '09:00', endTime: '15:00' }, // Friday
        ],
      },
      {
        name: 'Dr. Michael Chen',
        specialization: 'Functional Medicine',
        bio: 'Functional medicine specialist focusing on root cause analysis and personalized wellness plans. Expertise in metabolic health and hormonal balance.',
        qualifications: ['MD - Mayo Clinic', 'Institute for Functional Medicine Certified Practitioner'],
        experience: 12,
        consultationFee: '3000.00',
        imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
        isActive: true,
        availability: [
          { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 5, startTime: '10:00', endTime: '16:00' },
        ],
      },
      {
        name: 'Dr. Priya Sharma',
        specialization: 'Reproductive Endocrinology',
        bio: 'Leading fertility specialist with expertise in IVF, IUI, and fertility preservation. Committed to helping couples achieve their dream of parenthood.',
        qualifications: ['MD - AIIMS New Delhi', 'Fellowship in Reproductive Medicine - Harvard'],
        experience: 10,
        consultationFee: '3500.00',
        imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        isActive: true,
        availability: [
          { dayOfWeek: 1, startTime: '08:00', endTime: '16:00' },
          { dayOfWeek: 2, startTime: '08:00', endTime: '16:00' },
          { dayOfWeek: 4, startTime: '08:00', endTime: '16:00' },
          { dayOfWeek: 5, startTime: '08:00', endTime: '14:00' },
        ],
      },
      {
        name: 'Dr. James Wilson',
        specialization: 'Nutritional Medicine',
        bio: 'Certified nutritionist and wellness coach specializing in personalized nutrition plans for optimal health and fertility.',
        qualifications: ['MD - UCLA', 'Certified Nutrition Specialist', 'Integrative Medicine Fellowship'],
        experience: 8,
        consultationFee: '2000.00',
        imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
        isActive: true,
        availability: [
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 6, startTime: '10:00', endTime: '14:00' }, // Saturday
        ],
      },
    ];

    for (const doctorData of doctors) {
      const { availability, ...doctorInfo } = doctorData;
      
      // Check if doctor already exists
      const existingDoctor = await prisma.doctor.findFirst({
        where: {
          systemId: doulaSystem.id,
          name: doctorInfo.name,
        },
      });

      let doctor;
      if (existingDoctor) {
        doctor = await prisma.doctor.update({
          where: { id: existingDoctor.id },
          data: doctorInfo,
        });
        console.log(`✅ Updated doctor: ${doctor.name} (${doctor.specialization})`);
      } else {
        doctor = await prisma.doctor.create({
          data: {
            ...doctorInfo,
            systemId: doulaSystem.id,
          },
        });
        console.log(`✅ Created doctor: ${doctor.name} (${doctor.specialization})`);
      }

      // Delete existing availability slots and recreate
      await prisma.availabilitySlot.deleteMany({
        where: { doctorId: doctor.id },
      });

      // Add new availability slots
      for (const slot of availability) {
        await prisma.availabilitySlot.create({
          data: {
            doctorId: doctor.id,
            ...slot,
          },
        });
      }
      console.log(`  📅 Added ${availability.length} availability slots`);
    }

    // Create a sample consultation
    console.log('\n📅 Creating sample consultation...');
    const sampleDoctor = await prisma.doctor.findFirst({
      where: { systemId: doulaSystem.id },
    });

    if (sampleDoctor) {
      // Delete any existing sample consultation
      await prisma.consultation.deleteMany({
        where: {
          userId: regularUser.id,
          doctorId: sampleDoctor.id,
        },
      });

      // Create a consultation scheduled for next week
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(10, 0, 0, 0); // 10:00 AM

      const consultation = await prisma.consultation.create({
        data: {
          userId: regularUser.id,
          doctorId: sampleDoctor.id,
          scheduledAt: nextWeek,
          duration: 30,
          type: 'VIDEO',
          status: 'SCHEDULED',
          fee: sampleDoctor.consultationFee,
          isPaid: false,
        },
      });
      console.log(`✅ Sample consultation: ${new Date(consultation.scheduledAt).toLocaleString()}`);
    }
  }

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`  - Systems: ${systems.length}`);
  console.log(`  - System Configs: ${systems.length}`);
  console.log(`  - Feature Flags: ${systems.length}`);
  console.log(`  - Users: 2 (1 admin, 1 regular)`);
  console.log(`  - Doctors: 4`);
  console.log(`  - Availability Slots: 17`);
  console.log(`  - Sample Consultations: 1`);
  console.log('');
  console.log('🔑 Default Credentials:');
  console.log('  Admin:  admin@healthplatform.com / admin123');
  console.log('  User:   user@healthplatform.com / user123');
  console.log('');
  console.log('👨‍⚕️ Sample Doctors:');
  console.log('  - Dr. Sarah Johnson (OBGYN) - ₹2,500');
  console.log('  - Dr. Michael Chen (Functional Medicine) - ₹3,000');
  console.log('  - Dr. Priya Sharma (Reproductive Endocrinology) - ₹3,500');
  console.log('  - Dr. James Wilson (Nutritional Medicine) - ₹2,000');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
