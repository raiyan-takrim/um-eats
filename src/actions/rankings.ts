'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * Calculate and update rankings for all approved organizations
 * Based on weighted SDG score formula considering multiple performance factors
 * 
 * @param skipAuth - Skip authentication check (for internal auto-recalculation)
 * @see docs/IMPACT_MEASUREMENT_SYSTEM.md for full methodology
 */
export async function calculateOrganizationRankings(skipAuth: boolean = false) {
    try {
        if (!skipAuth) {
            const session = await auth.api.getSession({
                headers: await headers(),
            });

            // Only admins can manually trigger ranking recalculation
            if (!session?.user || session.user.role !== 'ADMIN') {
                throw new Error('Unauthorized');
            }
        }

        // Get all approved organizations with their metrics
        const organizations = await prisma.organization.findMany({
            where: {
                status: 'APPROVED',
            },
            include: {
                listings: {
                    include: {
                        claims: true,
                    },
                },
            },
        });

        // Filter organizations that have at least 1 completed donation
        const eligibleOrgs = organizations.filter(org => org.totalDonations > 0);

        if (eligibleOrgs.length === 0) {
            return { success: true, message: 'No eligible organizations to rank' };
        }

        // Calculate metrics for normalization
        const maxImpactPoints = Math.max(...eligibleOrgs.map(org => org.totalImpactPoints));
        const maxDonations = Math.max(...eligibleOrgs.map(org => org.totalDonations));

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Calculate scores for each organization
        const orgScores = await Promise.all(
            eligibleOrgs.map(async (org) => {
                // 1. Impact Points Score (25%)
                const impactPointsScore = maxImpactPoints > 0
                    ? (org.totalImpactPoints / maxImpactPoints) * 25
                    : 0;

                // 2. Donation Frequency Score (20%)
                const donationScore = maxDonations > 0
                    ? (org.totalDonations / maxDonations) * 20
                    : 0;

                // 3. Success Rate Score (15%)
                // Percentage of claimed food that was actually collected
                const totalClaims = await prisma.claim.count({
                    where: {
                        foodListing: {
                            organizationId: org.id,
                        },
                    },
                });

                const collectedClaims = await prisma.claim.count({
                    where: {
                        foodListing: {
                            organizationId: org.id,
                        },
                        status: 'PICKED_UP',
                    },
                });

                const successRate = totalClaims > 0 ? collectedClaims / totalClaims : 0;
                const successRateScore = successRate * 15;

                // 4. Active Listings Score (10%)
                const activeListings = await prisma.foodListing.count({
                    where: {
                        organizationId: org.id,
                        status: 'AVAILABLE',
                        availableUntil: {
                            gte: now,
                        },
                    },
                });

                const maxActiveListings = Math.max(
                    ...await Promise.all(
                        eligibleOrgs.map(o =>
                            prisma.foodListing.count({
                                where: {
                                    organizationId: o.id,
                                    status: 'AVAILABLE',
                                    availableUntil: { gte: now },
                                },
                            })
                        )
                    )
                );

                const activeListingsScore = maxActiveListings > 0
                    ? (activeListings / maxActiveListings) * 10
                    : 0;

                // 5. Response Time Score (10%)
                // Average time from listing creation to first claim
                const listingsWithClaims = await prisma.foodListing.findMany({
                    where: {
                        organizationId: org.id,
                        claims: {
                            some: {},
                        },
                    },
                    include: {
                        claims: {
                            orderBy: {
                                claimedAt: 'asc',
                            },
                            take: 1,
                        },
                    },
                });

                let avgResponseTimeHours = 0;
                if (listingsWithClaims.length > 0) {
                    const totalResponseTime = listingsWithClaims.reduce((sum, listing) => {
                        const firstClaim = listing.claims[0];
                        if (firstClaim) {
                            const responseTime = firstClaim.claimedAt.getTime() - listing.createdAt.getTime();
                            return sum + responseTime;
                        }
                        return sum;
                    }, 0);
                    avgResponseTimeHours = totalResponseTime / listingsWithClaims.length / (1000 * 60 * 60);
                }

                // Lower response time is better, normalize to 0-10 scale (max 48 hours)
                const maxResponseTime = 48;
                const responseTimeScore = avgResponseTimeHours > 0
                    ? Math.max(0, (1 - Math.min(avgResponseTimeHours / maxResponseTime, 1)) * 10)
                    : 5; // Default score if no data

                // 6. Variety Score (10%)
                // Diversity of food categories offered
                const categories = await prisma.foodListing.findMany({
                    where: {
                        organizationId: org.id,
                    },
                    select: {
                        category: true,
                    },
                    distinct: ['category'],
                });

                const uniqueCategories = categories.length;
                const totalCategories = 6; // Meals, Bakery, Snacks, Beverages, Fruits, Others
                const varietyScore = (uniqueCategories / totalCategories) * 10;

                // 7. Recent Activity Score (5%)
                // Donations in last 30 days vs all-time average
                const recentDonations = await prisma.claim.count({
                    where: {
                        foodListing: {
                            organizationId: org.id,
                        },
                        status: 'PICKED_UP',
                        collectedAt: {
                            gte: thirtyDaysAgo,
                        },
                    },
                });

                const accountAgeMonths = Math.max(
                    (now.getTime() - org.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30),
                    1
                );
                const avgMonthlyDonations = org.totalDonations / accountAgeMonths;
                const recentActivityRatio = avgMonthlyDonations > 0
                    ? Math.min(recentDonations / avgMonthlyDonations, 1)
                    : (recentDonations > 0 ? 1 : 0);
                const recentActivityScore = recentActivityRatio * 5;

                // 8. Account Age Score (5%)
                // Time since approval (diminishing returns after 6 months)
                const monthsActive = Math.min(accountAgeMonths, 6);
                const accountAgeScore = (monthsActive / 6) * 5;

                // Calculate total SDG score (0-100)
                const sdgScore =
                    impactPointsScore +
                    donationScore +
                    successRateScore +
                    activeListingsScore +
                    responseTimeScore +
                    varietyScore +
                    recentActivityScore +
                    accountAgeScore;

                return {
                    id: org.id,
                    name: org.name,
                    sdgScore: parseFloat(sdgScore.toFixed(2)),
                    breakdown: {
                        impactPointsScore: parseFloat(impactPointsScore.toFixed(2)),
                        donationScore: parseFloat(donationScore.toFixed(2)),
                        successRateScore: parseFloat(successRateScore.toFixed(2)),
                        activeListingsScore: parseFloat(activeListingsScore.toFixed(2)),
                        responseTimeScore: parseFloat(responseTimeScore.toFixed(2)),
                        varietyScore: parseFloat(varietyScore.toFixed(2)),
                        recentActivityScore: parseFloat(recentActivityScore.toFixed(2)),
                        accountAgeScore: parseFloat(accountAgeScore.toFixed(2)),
                    },
                };
            })
        );

        // Sort by SDG score descending, then by totalImpactPoints as tiebreaker
        const sortedOrgs = orgScores.sort((a, b) => {
            if (b.sdgScore !== a.sdgScore) {
                return b.sdgScore - a.sdgScore;
            }
            const orgA = eligibleOrgs.find(o => o.id === a.id)!;
            const orgB = eligibleOrgs.find(o => o.id === b.id)!;
            return orgB.totalImpactPoints - orgA.totalImpactPoints;
        });

        // Update rankings in database
        const updates = sortedOrgs.map((org, index) => {
            return prisma.organization.update({
                where: { id: org.id },
                data: {
                    sdgScore: org.sdgScore,
                    ranking: index + 1,
                },
            });
        });

        await Promise.all(updates);

        // Reset rankings for organizations that don't qualify
        const ineligibleOrgIds = organizations
            .filter(org => org.totalDonations === 0)
            .map(org => org.id);

        if (ineligibleOrgIds.length > 0) {
            await prisma.organization.updateMany({
                where: {
                    id: {
                        in: ineligibleOrgIds,
                    },
                },
                data: {
                    ranking: null,
                    sdgScore: 0,
                },
            });
        }

        return {
            success: true,
            message: `Successfully updated rankings for ${sortedOrgs.length} organizations`,
            rankings: sortedOrgs.map((org, index) => ({
                rank: index + 1,
                name: org.name,
                score: org.sdgScore,
            })),
        };
    } catch (error) {
        console.error('Error calculating rankings:', error);
        throw error;
    }
}

/**
 * Get top ranked organizations for display on landing page
 * 
 * @param limit - Number of top organizations to return (default: 3)
 */
export async function getTopOrganizations(limit: number = 3) {
    try {
        const topOrgs = await prisma.organization.findMany({
            where: {
                status: 'APPROVED',
                ranking: {
                    not: null,
                },
            },
            select: {
                id: true,
                name: true,
                type: true,
                logo: true,
                totalImpactPoints: true,
                totalDonations: true,
                sdgScore: true,
                ranking: true,
            },
            orderBy: {
                ranking: 'asc',
            },
            take: limit,
        });

        return topOrgs;
    } catch (error) {
        console.error('Error fetching top organizations:', error);
        throw error;
    }
}

/**
 * Get all ranked organizations for rankings page
 */
export async function getAllRankedOrganizations() {
    try {
        const rankedOrgs = await prisma.organization.findMany({
            where: {
                status: 'APPROVED',
                ranking: {
                    not: null,
                },
            },
            select: {
                id: true,
                name: true,
                type: true,
                logo: true,
                totalImpactPoints: true,
                totalDonations: true,
                sdgScore: true,
                ranking: true,
            },
            orderBy: {
                ranking: 'asc',
            },
        });

        return rankedOrgs;
    } catch (error) {
        console.error('Error fetching ranked organizations:', error);
        throw error;
    }
}
