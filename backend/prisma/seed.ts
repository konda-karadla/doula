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
  }

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`  - Systems: ${systems.length}`);
  console.log(`  - System Configs: ${systems.length}`);
  console.log(`  - Feature Flags: ${systems.length}`);
  console.log(`  - Users: 2 (1 admin, 1 regular)`);
  console.log('');
  console.log('🔑 Default Credentials:');
  console.log('  Admin:  admin@healthplatform.com / admin123');
  console.log('  User:   user@healthplatform.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
