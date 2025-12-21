/**
 * Script to recalculate SDG scores for all organizations
 * Run this once to fix existing organizations with 0.0 SDG scores
 * 
 * Usage: npx tsx prisma/recalculate-sdg-scores.ts
 */

import { PrismaClient } from '@prisma/client';
import { calculateOrganizationSDGScore } from '../src/lib/sdg-calculator';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Starting SDG Score recalculation...\n');

    const organizations = await prisma.organization.findMany({
        where: {
            status: 'APPROVED',
        },
        select: {
            id: true,
            name: true,
            totalImpactPoints: true,
            totalDonations: true,
            sdgScore: true,
        },
    });

    console.log(`Found ${organizations.length} approved organizations\n`);

    let updated = 0;
    let failed = 0;

    for (const org of organizations) {
        try {
            console.log(`Processing: ${org.name}`);
            console.log(`  Current: Impact=${org.totalImpactPoints}, Donations=${org.totalDonations}, SDG Score=${org.sdgScore}`);

            const newScore = await calculateOrganizationSDGScore(org.id);

            await prisma.organization.update({
                where: { id: org.id },
                data: { sdgScore: newScore },
            });

            console.log(`  ✅ Updated SDG Score: ${org.sdgScore} → ${newScore}\n`);
            updated++;
        } catch (error) {
            console.error(`  ❌ Failed to update ${org.name}:`, error);
            failed++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Successfully updated: ${updated} organizations`);
    if (failed > 0) {
        console.log(`❌ Failed: ${failed} organizations`);
    }
    console.log('='.repeat(50));
}

main()
    .catch((e) => {
        console.error('Fatal error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
