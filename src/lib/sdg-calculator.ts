/**
 * SDG Score Calculation System
 * 
 * Calculates organization SDG Score (0-100) based on multiple performance factors
 * 
 * @see docs/IMPACT_MEASUREMENT_SYSTEM.md for full methodology
 */

import { prisma } from './prisma';

interface OrganizationMetrics {
    organizationId: string;
    totalImpactPoints: number;
    totalDonations: number;
    totalClaims: number;
    collectedClaims: number;
    activeListings: number;
    categoriesUsed: number;
    recentDonations: number;
    accountAge: number; // in days
}

/**
 * Calculate normalized score (0-1) for impact points
 * Uses logarithmic scaling to prevent dominance by high performers
 */
function calculateImpactScore(totalImpactPoints: number): number {
    if (totalImpactPoints <= 0) return 0;

    // Log scale: score increases slowly after initial impact
    // Max realistic score ~10 FIP = 1.0
    const score = Math.log10(totalImpactPoints + 1) / Math.log10(11);
    return Math.min(score, 1.0);
}

/**
 * Calculate normalized score (0-1) for donation frequency
 * More donations = better engagement
 */
function calculateDonationFrequencyScore(totalDonations: number): number {
    if (totalDonations <= 0) return 0;

    // Linear scale up to 50 donations
    const score = totalDonations / 50;
    return Math.min(score, 1.0);
}

/**
 * Calculate success rate score (0-1)
 * Percentage of claims that were actually collected
 */
function calculateSuccessRateScore(collectedClaims: number, totalClaims: number): number {
    if (totalClaims === 0) return 0;

    return collectedClaims / totalClaims;
}

/**
 * Calculate active listings score (0-1)
 * Having available food = better availability
 */
function calculateActiveListingsScore(activeListings: number): number {
    if (activeListings <= 0) return 0;

    // Linear scale up to 10 active listings
    const score = activeListings / 10;
    return Math.min(score, 1.0);
}

/**
 * Calculate variety score (0-1)
 * Diversity of food categories offered
 */
function calculateVarietyScore(categoriesUsed: number): number {
    if (categoriesUsed <= 0) return 0;

    // Max 6 categories (Meals, Bakery, Snacks, Beverages, Fruits, Others)
    const score = categoriesUsed / 6;
    return Math.min(score, 1.0);
}

/**
 * Calculate recent activity score (0-1)
 * Donations in the last 30 days
 */
function calculateRecentActivityScore(recentDonations: number): number {
    if (recentDonations <= 0) return 0;

    // Linear scale up to 10 recent donations
    const score = recentDonations / 10;
    return Math.min(score, 1.0);
}

/**
 * Calculate account age score (0-1)
 * Longer tenure = more trust and reliability
 */
function calculateAccountAgeScore(accountAgeDays: number): number {
    if (accountAgeDays <= 0) return 0;

    // Linear scale up to 180 days (6 months)
    const score = accountAgeDays / 180;
    return Math.min(score, 1.0);
}

/**
 * Calculate overall SDG Score (0-100) for an organization
 * 
 * @param metrics - Organization performance metrics
 * @returns SDG Score from 0 to 100
 */
export function calculateSDGScore(metrics: OrganizationMetrics): number {
    const impactScore = calculateImpactScore(metrics.totalImpactPoints);
    const donationScore = calculateDonationFrequencyScore(metrics.totalDonations);
    const successScore = calculateSuccessRateScore(metrics.collectedClaims, metrics.totalClaims);
    const listingsScore = calculateActiveListingsScore(metrics.activeListings);
    const varietyScore = calculateVarietyScore(metrics.categoriesUsed);
    const recentScore = calculateRecentActivityScore(metrics.recentDonations);
    const ageScore = calculateAccountAgeScore(metrics.accountAge);

    // Weighted scoring system (must total to 1.0)
    const weightedScore =
        impactScore * 0.25 +           // 25% - Total FIP accumulated
        donationScore * 0.20 +          // 20% - Number of completed donations
        successScore * 0.15 +           // 15% - Collection rate
        listingsScore * 0.10 +          // 10% - Current active listings
        varietyScore * 0.10 +           // 10% - Category diversity
        recentScore * 0.10 +            // 10% - Recent 30-day activity
        ageScore * 0.10;                // 10% - Platform tenure

    // Convert to 0-100 scale
    return Math.round(weightedScore * 100);
}

/**
 * Gather metrics and calculate SDG score for a specific organization
 * 
 * @param organizationId - Organization ID
 * @returns Calculated SDG Score
 */
export async function calculateOrganizationSDGScore(organizationId: string): Promise<number> {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
            totalImpactPoints: true,
            totalDonations: true,
            createdAt: true,
        },
    });

    if (!organization) {
        throw new Error('Organization not found');
    }

    // Get claim statistics
    const [totalClaims, collectedClaims] = await Promise.all([
        prisma.claim.count({
            where: {
                foodListing: {
                    organizationId,
                },
            },
        }),
        prisma.claim.count({
            where: {
                foodListing: {
                    organizationId,
                },
                status: 'PICKED_UP',
            },
        }),
    ]);

    // Get active listings count
    const activeListings = await prisma.foodListing.count({
        where: {
            organizationId,
            status: 'AVAILABLE',
            availableUntil: {
                gte: new Date(),
            },
        },
    });

    // Get category diversity
    const listings = await prisma.foodListing.findMany({
        where: {
            organizationId,
        },
        select: {
            category: true,
        },
    });
    const categoriesUsed = new Set(listings.map(l => l.category)).size;

    // Get recent donations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDonations = await prisma.claim.count({
        where: {
            foodListing: {
                organizationId,
            },
            status: 'PICKED_UP',
            collectedAt: {
                gte: thirtyDaysAgo,
            },
        },
    });

    // Calculate account age in days
    const accountAgeDays = Math.floor(
        (Date.now() - organization.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const metrics: OrganizationMetrics = {
        organizationId,
        totalImpactPoints: organization.totalImpactPoints,
        totalDonations: organization.totalDonations,
        totalClaims,
        collectedClaims,
        activeListings,
        categoriesUsed,
        recentDonations,
        accountAge: accountAgeDays,
    };

    return calculateSDGScore(metrics);
}

/**
 * Update SDG score for an organization in the database
 * 
 * @param organizationId - Organization ID
 * @returns Updated SDG Score
 */
export async function updateOrganizationSDGScore(organizationId: string): Promise<number> {
    const sdgScore = await calculateOrganizationSDGScore(organizationId);

    await prisma.organization.update({
        where: { id: organizationId },
        data: { sdgScore },
    });

    return sdgScore;
}

/**
 * Recalculate SDG scores for all approved organizations
 * This can be run periodically (e.g., daily) or triggered manually
 * 
 * @returns Number of organizations updated
 */
export async function recalculateAllSDGScores(): Promise<number> {
    const organizations = await prisma.organization.findMany({
        where: {
            status: 'APPROVED',
        },
        select: {
            id: true,
        },
    });

    let updated = 0;
    for (const org of organizations) {
        try {
            await updateOrganizationSDGScore(org.id);
            updated++;
        } catch (error) {
            console.error(`Failed to update SDG score for ${org.id}:`, error);
        }
    }

    return updated;
}
