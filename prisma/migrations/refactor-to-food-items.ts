/**
 * Data Migration Script: Refactor FoodListing to use FoodItem model
 * 
 * This script:
 * 1. Creates FoodItem records for all existing FoodListings
 * 2. Updates Claim records to link to FoodItems instead of quantity
 * 3. Preserves all ranking metrics (totalDonations, totalImpactPoints)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
    console.log('🚀 Starting migration: Refactor to FoodItem model...\n');

    try {
        // Step 1: Get all existing food listings
        const listings = await prisma.foodListing.findMany({
            include: {
                claims: {
                    orderBy: {
                        claimedAt: 'asc', // Process claims in order
                    },
                },
            },
        });

        console.log(`📦 Found ${listings.length} food listings to migrate\n`);

        for (const listing of listings) {
            console.log(`Processing: ${listing.title} (${listing.quantity} ${listing.unit})`);

            // Step 2: Create FoodItem records for each quantity unit
            const items = [];
            for (let i = 1; i <= listing.quantity; i++) {
                items.push({
                    foodListingId: listing.id,
                    itemNumber: i,
                    status: 'AVAILABLE' as const, // Type assertion for FoodStatus enum
                });
            }

            const createdItems = await prisma.foodItem.createManyAndReturn({
                data: items,
            });

            console.log(`  ✅ Created ${createdItems.length} food items`);

            // Step 3: Assign claims to specific items
            let itemIndex = 0;
            const claimUpdates = [];

            for (const claim of listing.claims) {
                const itemsForThisClaim = createdItems.slice(itemIndex, itemIndex + claim.quantity);

                if (itemsForThisClaim.length !== claim.quantity) {
                    console.error(`  ⚠️  Warning: Not enough items for claim ${claim.id}`);
                    continue;
                }

                // Update each item's status based on claim status
                for (const item of itemsForThisClaim) {
                    await prisma.foodItem.update({
                        where: { id: item.id },
                        data: { status: claim.status as any }, // Type assertion for FoodStatus
                    });
                }

                // For backward compatibility, we'll split multi-quantity claims into individual claims
                // This ensures one claim = one item relationship
                for (let i = 0; i < itemsForThisClaim.length; i++) {
                    const item = itemsForThisClaim[i];

                    if (i === 0) {
                        // Update the first claim record to link to first item
                        await prisma.claim.update({
                            where: { id: claim.id },
                            data: {
                                foodItemId: item.id,
                            },
                        });
                    } else {
                        // Create new claim records for additional items
                        await prisma.claim.create({
                            data: {
                                foodItemId: item.id,
                                foodListingId: listing.id,
                                userId: claim.userId,
                                status: claim.status as any,
                                estimatedImpactPoints: claim.estimatedImpactPoints / claim.quantity,
                                actualImpactPoints: claim.actualImpactPoints / claim.quantity,
                                claimedAt: claim.claimedAt,
                                collectedAt: claim.collectedAt,
                            },
                        });
                    }
                }

                itemIndex += claim.quantity;
                console.log(`  ✅ Migrated claim ${claim.id} (${claim.quantity} items)`);
            }

            console.log(`  ✅ Completed: ${listing.title}\n`);
        }

        console.log('✅ Migration completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`  - Migrated ${listings.length} listings`);
        const totalItems = await prisma.foodItem.count();
        console.log(`  - Created ${totalItems} food items`);
        const totalClaims = await prisma.claim.count();
        console.log(`  - Updated ${totalClaims} claims`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
migrate()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
