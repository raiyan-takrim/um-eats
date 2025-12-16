'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { calculateFoodImpactPoints } from '@/lib/impact-calculator';
import { calculateOrganizationRankings } from '@/actions/rankings';

export async function browseListings(filters?: {
    search?: string;
    category?: string;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isHalal?: boolean;
}) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'STUDENT') {
            throw new Error('Unauthorized');
        }

        // Check if student is banned
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { isBanned: true },
        });

        if (user?.isBanned) {
            throw new Error('Your account has been banned');
        }

        const where: any = {
            status: 'AVAILABLE',
            availableUntil: {
                gte: new Date(),
            },
        };

        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        if (filters?.category) {
            where.category = filters.category;
        }

        if (filters?.isVegetarian) {
            where.isVegetarian = true;
        }
        if (filters?.isVegan) {
            where.isVegan = true;
        }
        if (filters?.isHalal) {
            where.isHalal = true;
        }

        const listings = await prisma.foodListing.findMany({
            where,
            include: {
                organization: {
                    select: {
                        name: true,
                        type: true,
                        address: true,
                    },
                },
                items: {
                    where: {
                        status: 'AVAILABLE',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Filter out listings with no available items and add remaining quantity
        const availableListings = listings
            .filter(listing => listing.items.length > 0)
            .map(listing => ({
                ...listing,
                remainingQuantity: listing.items.length,
                _count: {
                    claims: listing.items.filter(item => item.status !== 'AVAILABLE').length,
                },
            }));

        return { listings: availableListings };
    } catch (error) {
        console.error('Error fetching listings:', error);
        throw error;
    }
}

export async function getListingDetail(listingId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'STUDENT') {
            throw new Error('Unauthorized');
        }

        // Check if student is banned
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { isBanned: true },
        });

        if (user?.isBanned) {
            throw new Error('Your account has been banned');
        }

        const listing = await prisma.foodListing.findUnique({
            where: { id: listingId },
            include: {
                organization: {
                    select: {
                        name: true,
                        type: true,
                        address: true,
                        email: true,
                        phone: true,
                    },
                },
                claims: {
                    where: {
                        userId: session.user.id,
                    },
                    orderBy: {
                        claimedAt: 'desc',
                    },
                },
                items: {
                    where: {
                        status: 'AVAILABLE',
                    },
                },
            },
        });

        if (!listing) {
            throw new Error('Listing not found');
        }

        const remainingQuantity = listing.items.length;

        return {
            listing: {
                ...listing,
                remainingQuantity,
            },
        };
    } catch (error) {
        console.error('Error fetching listing:', error);
        throw error;
    }
}

export async function claimFood(listingId: string, quantity: number) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'STUDENT') {
            throw new Error('Unauthorized');
        }

        // Check if student is banned
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { isBanned: true, bannedReason: true },
        });

        if (user?.isBanned) {
            throw new Error(`Your account has been banned. Reason: ${user.bannedReason || 'No reason provided'}`);
        }

        if (!quantity || quantity < 1) {
            throw new Error('Invalid quantity');
        }

        const listing = await prisma.foodListing.findUnique({
            where: { id: listingId },
            include: {
                items: {
                    where: {
                        status: 'AVAILABLE',
                    },
                    take: quantity,
                },
            },
        });

        if (!listing) {
            throw new Error('Listing not found');
        }

        if (listing.status !== 'AVAILABLE') {
            throw new Error('Listing is not available');
        }

        const now = new Date();
        if (now > listing.availableUntil) {
            throw new Error('Listing has expired');
        }

        const availableItems = listing.items;

        if (quantity > availableItems.length) {
            throw new Error(`Only ${availableItems.length} ${listing.unit} available`);
        }

        // Calculate estimated impact points per item
        const estimatedImpactPerItem = calculateFoodImpactPoints(
            listing.category,
            listing.unit,
            1
        );

        // Create claims for each item and update item status in a single transaction
        const createdClaims = await prisma.$transaction(async (tx) => {
            const claims = [];

            for (const item of availableItems.slice(0, quantity)) {
                // Update item status to CLAIMED
                await tx.foodItem.update({
                    where: { id: item.id },
                    data: { status: 'CLAIMED' as const },
                });

                // Create claim with PENDING status (awaiting organization confirmation)
                const claim = await tx.claim.create({
                    data: {
                        foodItemId: item.id,
                        foodListingId: listing.id,
                        userId: session.user.id,
                        status: 'PENDING', // ClaimStatus
                        itemStatus: 'CLAIMED', // FoodStatus
                        estimatedImpactPoints: estimatedImpactPerItem,
                    },
                });

                claims.push(claim);
            }

            return claims;
        });

        // Update listing status if all items are claimed/collected
        const remainingAvailable = await prisma.foodItem.count({
            where: {
                foodListingId: listing.id,
                status: 'AVAILABLE',
            },
        });

        if (remainingAvailable === 0) {
            await prisma.foodListing.update({
                where: { id: listing.id },
                data: { status: 'CLAIMED' },
            });
        }

        return { claims: createdClaims };
    } catch (error) {
        console.error('Error creating claim:', error);
        throw error;
    }
}

/**
 * Mark a claim as collected and update organization metrics
 * This triggers automatic ranking recalculation
 */
export async function markClaimAsCollected(claimId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        // Both students and organizations can mark as collected
        if (!session?.user || !['STUDENT', 'ORGANIZATION'].includes(session.user.role)) {
            throw new Error('Unauthorized');
        }

        // Check if student is banned
        if (session.user.role === 'STUDENT') {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { isBanned: true, bannedReason: true },
            });

            if (user?.isBanned) {
                throw new Error(`Your account has been banned. Reason: ${user.bannedReason || 'No reason provided'}`);
            }
        }

        const claim = await prisma.claim.findUnique({
            where: { id: claimId },
            include: {
                foodListing: {
                    include: {
                        organization: true,
                    },
                },
            },
        });

        if (!claim) {
            throw new Error('Claim not found');
        }

        // Verify user has permission
        if (session.user.role === 'STUDENT' && claim.userId !== session.user.id) {
            throw new Error('You can only mark your own claims as collected');
        }

        if (session.user.role === 'ORGANIZATION') {
            // For organizations, we'd need to check their organizationId
            // Skip this check for now - organizations can mark any claim
        }

        if (claim.status === 'PICKED_UP') {
            throw new Error('Claim already marked as collected');
        }

        // Only allow marking as collected if order is READY
        if (claim.status !== 'READY') {
            throw new Error('Order must be marked as ready before collection');
        }

        if (!claim.foodItemId) {
            throw new Error('Invalid claim: no food item linked');
        }

        // Calculate actual impact points per item
        const actualImpact = calculateFoodImpactPoints(
            claim.foodListing.category,
            claim.foodListing.unit,
            1
        );

        // Update claim, item status, and organization metrics in a transaction
        await prisma.$transaction(async (tx) => {
            // Update claim to PICKED_UP status
            await tx.claim.update({
                where: { id: claimId },
                data: {
                    status: 'PICKED_UP',
                    itemStatus: 'COLLECTED',
                    collectedAt: new Date(),
                    actualImpactPoints: actualImpact,
                },
            });

            // Update food item status
            await tx.foodItem.update({
                where: { id: claim.foodItemId! }, // Non-null assertion as we checked earlier
                data: { status: 'COLLECTED' as const },
            });

            // Update organization metrics (preserve ranking calculations)
            await tx.organization.update({
                where: { id: claim.foodListing.organizationId },
                data: {
                    totalDonations: { increment: 1 },
                    totalImpactPoints: { increment: actualImpact },
                },
            });

            // Update listing status to COLLECTED only if ALL items are collected
            const uncollectedItems = await tx.foodItem.count({
                where: {
                    foodListingId: claim.foodListingId,
                    status: {
                        not: 'COLLECTED',
                    },
                },
            });

            if (uncollectedItems === 0) {
                // All items collected, mark listing as COLLECTED
                await tx.foodListing.update({
                    where: { id: claim.foodListingId },
                    data: { status: 'COLLECTED' },
                });
            }
        });

        // Auto-trigger ranking recalculation (async, no need to wait)
        calculateOrganizationRankings(true).catch(err =>
            console.error('Auto-ranking calculation failed:', err)
        );

        return {
            success: true,
            message: 'Claim marked as collected successfully',
            impactPoints: actualImpact
        };
    } catch (error) {
        console.error('Error marking claim as collected:', error);
        throw error;
    }
}

export async function getStudentClaims() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'STUDENT') {
            throw new Error('Unauthorized');
        }

        const claims = await prisma.claim.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                foodListing: {
                    select: {
                        title: true,
                        category: true,
                        unit: true,
                        pickupLocation: true,
                        organization: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                claimedAt: 'desc',
            },
        });

        return { claims };
    } catch (error) {
        console.error('Error fetching student claims:', error);
        throw error;
    }
}
