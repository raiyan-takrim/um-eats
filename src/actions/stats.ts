'use server';

import { prisma } from '@/lib/prisma';

/**
 * Get platform-wide statistics for landing page
 */
export async function getPlatformStats() {
    try {
        // Get total impact points from all organizations
        const impactStats = await prisma.organization.aggregate({
            where: {
                status: 'APPROVED',
            },
            _sum: {
                totalImpactPoints: true,
                totalDonations: true,
            },
            _count: true,
        });

        // Get total students who have made claims
        const uniqueStudents = await prisma.claim.findMany({
            select: {
                userId: true,
            },
            distinct: ['userId'],
        });

        // Get total claims across all time
        const totalClaims = await prisma.claim.count();

        // Get claims in last 30 days for activity indicator
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentClaims = await prisma.claim.count({
            where: {
                claimedAt: {
                    gte: thirtyDaysAgo,
                },
            },
        });

        // Get active listings count
        const activeListings = await prisma.foodListing.count({
            where: {
                status: 'AVAILABLE',
                availableUntil: {
                    gte: new Date(),
                },
            },
        });

        return {
            totalImpactPoints: impactStats._sum.totalImpactPoints || 0,
            totalDonations: impactStats._sum.totalDonations || 0,
            totalPartners: impactStats._count || 0,
            uniqueStudents: uniqueStudents.length,
            totalClaims,
            recentClaims,
            activeListings,
        };
    } catch (error) {
        console.error('Error fetching platform stats:', error);
        return {
            totalImpactPoints: 0,
            totalDonations: 0,
            totalPartners: 0,
            uniqueStudents: 0,
            totalClaims: 0,
            recentClaims: 0,
            activeListings: 0,
        };
    }
}

/**
 * Get recent success stories / testimonials
 */
export async function getRecentActivity() {
    try {
        const recentCollectedClaims = await prisma.claim.findMany({
            where: {
                status: 'PICKED_UP',
            },
            include: {
                foodListing: {
                    include: {
                        organization: {
                            select: {
                                name: true,
                                type: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                collectedAt: 'desc',
            },
            take: 5,
        });

        return recentCollectedClaims.map((claim) => ({
            id: claim.id,
            studentName: claim.user.name,
            foodTitle: claim.foodListing.title,
            organizationName: claim.foodListing.organization.name,
            organizationType: claim.foodListing.organization.type,
            quantity: claim.quantity,
            unit: claim.foodListing.unit,
            impactPoints: claim.actualImpactPoints,
            collectedAt: claim.collectedAt,
        }));
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        return [];
    }
}
