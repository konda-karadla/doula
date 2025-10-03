"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
        console.log(`  ⚙️  Config: ${sampleConfig.configKey} = ${sampleConfig.configValue}`);
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
        console.log(`  🚩 Feature flag: ${labUploadFlag.flagName} = ${labUploadFlag.isEnabled}`);
    }
    console.log('');
    console.log('🎉 Seed completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`  - Systems: ${systems.length}`);
    console.log(`  - System Configs: ${systems.length}`);
    console.log(`  - Feature Flags: ${systems.length}`);
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map