'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getOrganizationStatus() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ORGANIZATION') {
            throw new Error('Unauthorized');
        }

        const organization = await prisma.organization.findFirst({
            where: {
                userId: session.user.id,
            },
        });

        if (!organization) {
            return { organization: null };
        }

        return { organization };
    } catch (error) {
        console.error('Error fetching organization status:', error);
        throw error;
    }
}

export async function applyForOrganization(data: {
    name: string;
    type: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    latitude: number;
    longitude: number;
}) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error('Unauthorized');
        }

        // Check if user already has an organization
        const existingOrganization = await prisma.organization.findFirst({
            where: {
                userId: session.user.id,
            },
        });

        if (existingOrganization) {
            throw new Error('You already have an organization application');
        }

        // Create slug from name
        const slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if auto-approve is enabled
        const autoApproveSetting = await prisma.systemSettings.findUnique({
            where: { key: 'auto_approve_orgs' },
        });

        const autoApprove = autoApproveSetting?.value === 'true';
        const status = autoApprove ? 'APPROVED' : 'PENDING';

        const organization = await prisma.organization.create({
            data: {
                userId: session.user.id,
                name: data.name,
                type: data.type as any,
                description: data.description,
                address: data.address,
                phone: data.phone,
                email: data.email,
                latitude: data.latitude,
                longitude: data.longitude,
                slug,
                status,
            },
        });

        revalidatePath('/dashboard/organization');
        return { organization };
    } catch (error) {
        console.error('Error applying for organization:', error);
        throw error;
    }
}

export async function updateOrganization(data: {
    name: string;
    description?: string;
    address: string;
    phone: string;
    email: string;
}) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ORGANIZATION') {
            throw new Error('Unauthorized');
        }

        const existingOrganization = await prisma.organization.findFirst({
            where: {
                userId: session.user.id,
            },
        });

        if (!existingOrganization) {
            throw new Error('Organization not found');
        }

        const organization = await prisma.organization.update({
            where: {
                id: existingOrganization.id,
            },
            data: {
                name: data.name,
                description: data.description,
                address: data.address,
                phone: data.phone,
                email: data.email,
            },
        });

        revalidatePath('/dashboard/organization');
        revalidatePath('/dashboard/organization/settings');
        return { organization };
    } catch (error) {
        console.error('Error updating organization:', error);
        throw error;
    }
}

export async function getOrganizationListings() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ORGANIZATION') {
            throw new Error('Unauthorized');
        }

        const organization = await prisma.organization.findFirst({
            where: {
                userId: session.user.id,
                status: 'APPROVED',
            },
        });

        if (!organization) {
            throw new Error('No approved organization found');
        }

        const listings = await prisma.foodListing.findMany({
            where: {
                organizationId: organization.id,
            },
            include: {
                items: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Calculate remaining quantity for each listing based on item status
        const listingsWithRemaining = listings.map(listing => {
            const availableCount = listing.items.filter(item => item.status === 'AVAILABLE').length;
            return {
                ...listing,
                remainingQuantity: availableCount,
            };
        });

        return { listings: listingsWithRemaining };
    } catch (error) {
        console.error('Error fetching listings:', error);
        throw error;
    }
}

export async function createListing(data: {
    title: string;
    description: string;
    category: string;
    quantity: number;
    unit: string;
    availableFrom: Date;
    availableUntil: Date;
    pickupLocation: string;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isHalal?: boolean;
    allergens?: string;
    tags?: string;
}) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ORGANIZATION') {
            throw new Error('Unauthorized');
        }

        const organization = await prisma.organization.findFirst({
            where: {
                userId: session.user.id,
            },
        });

        if (!organization) {
            throw new Error('No organization found');
        }

        if (organization.status === 'BANNED') {
            throw new Error('Your organization has been banned and cannot create listings');
        }

        if (organization.status !== 'APPROVED') {
            throw new Error('Your organization must be approved before creating listings');
        }

        // Create listing and food items in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const listing = await tx.foodListing.create({
                data: {
                    organizationId: organization.id,
                    title: data.title,
                    description: data.description,
                    category: data.category,
                    quantity: data.quantity,
                    unit: data.unit,
                    availableFrom: data.availableFrom,
                    availableUntil: data.availableUntil,
                    pickupLocation: data.pickupLocation,
                    latitude: organization.latitude,
                    longitude: organization.longitude,
                    status: 'AVAILABLE',
                    isVegetarian: data.isVegetarian || false,
                    isVegan: data.isVegan || false,
                    isHalal: data.isHalal || false,
                    allergens: data.allergens ? data.allergens.split(',').map(a => a.trim()) : [],
                    tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
                },
            });

            // Create individual food items
            const items = [];
            for (let i = 1; i <= data.quantity; i++) {
                items.push({
                    foodListingId: listing.id,
                    itemNumber: i,
                    status: 'AVAILABLE' as const,
                });
            }

            await tx.foodItem.createMany({
                data: items,
            });

            return listing;
        });

        revalidatePath('/dashboard/organization/listings');
        return { listing: result };
    } catch (error) {
        console.error('Error creating listing:', error);
        throw error;
    }
}

export async function getListing(id: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ORGANIZATION') {
            throw new Error('Unauthorized');
        }

        const organization = await prisma.organization.findFirst({
            where: {
                userId: session.user.id,
                status: 'APPROVED',
            },
        });

        if (!organization) {
            throw new Error('No approved organization found');
        }

        const listing = await prisma.foodListing.findFirst({
            where: {
                id,
                organizationId: organization.id,
            },
            include: {
                claims: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: {
                        claimedAt: 'desc',
                    },
                },
            },
        });

        if (!listing) {
            throw new Error('Listing not found');
        }

        return { listing };
    } catch (error) {
        console.error('Error fetching listing:', error);
        throw error;
    }
}

export async function updateListing(id: string, data: Partial<{
    title: string;
    description: string;
    category: string;
    quantity: number;
    unit: string;
    availableFrom: Date;
    availableUntil: Date;
    pickupLocation: string;
    status: string;
    isVegetarian: boolean;
    isVegan: boolean;
    isHalal: boolean;
    allergens: string;
    tags: string;
}>) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ORGANIZATION') {
            throw new Error('Unauthorized');
        }

        const organization = await prisma.organization.findFirst({
            where: {
                userId: session.user.id,
                status: 'APPROVED',
            },
        });

        if (!organization) {
            throw new Error('No approved organization found');
        }

        const existingListing = await prisma.foodListing.findFirst({
            where: {
                id,
                organizationId: organization.id,
            },
        });

        if (!existingListing) {
            throw new Error('Listing not found');
        }

        const updateData: any = {};
        if (data.title) updateData.title = data.title;
        if (data.description) updateData.description = data.description;
        if (data.category) updateData.category = data.category;
        if (data.quantity !== undefined) updateData.quantity = data.quantity;
        if (data.unit) updateData.unit = data.unit;
        if (data.availableFrom) updateData.availableFrom = data.availableFrom;
        if (data.availableUntil) updateData.availableUntil = data.availableUntil;
        if (data.pickupLocation) updateData.pickupLocation = data.pickupLocation;
        if (data.status) updateData.status = data.status;
        if (data.isVegetarian !== undefined) updateData.isVegetarian = data.isVegetarian;
        if (data.isVegan !== undefined) updateData.isVegan = data.isVegan;
        if (data.isHalal !== undefined) updateData.isHalal = data.isHalal;
        if (data.allergens !== undefined) updateData.allergens = data.allergens.split(',').map(a => a.trim());
        if (data.tags !== undefined) updateData.tags = data.tags.split(',').map(t => t.trim());

        const listing = await prisma.foodListing.update({
            where: { id },
            data: updateData,
        });

        revalidatePath('/dashboard/organization/listings');
        revalidatePath(`/dashboard/organization/listings/${id}`);
        return { listing };
    } catch (error) {
        console.error('Error updating listing:', error);
        throw error;
    }
}

export async function deleteListing(id: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ORGANIZATION') {
            throw new Error('Unauthorized');
        }

        const organization = await prisma.organization.findFirst({
            where: {
                userId: session.user.id,
                status: 'APPROVED',
            },
        });

        if (!organization) {
            throw new Error('No approved organization found');
        }

        const existingListing = await prisma.foodListing.findFirst({
            where: {
                id,
                organizationId: organization.id,
            },
        });

        if (!existingListing) {
            throw new Error('Listing not found');
        }

        await prisma.foodListing.delete({
            where: { id },
        });

        revalidatePath('/dashboard/organization/listings');
        return { success: true };
    } catch (error) {
        console.error('Error deleting listing:', error);
        throw error;
    }
}

export async function getDashboardStats() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ORGANIZATION') {
            throw new Error('Unauthorized');
        }

        const organization = await prisma.organization.findFirst({
            where: {
                userId: session.user.id,
                status: 'APPROVED',
            },
        });

        if (!organization) {
            throw new Error('No approved organization found');
        }

        const [
            activeListings,
            expiredListings,
            totalListings,
            totalClaims,
            claimedFood,
            recentListings,
            recentClaims,
            impactByCategory,
        ] = await Promise.all([
            // Active listings (not expired)
            prisma.foodListing.count({
                where: {
                    organizationId: organization.id,
                    status: 'AVAILABLE',
                    availableUntil: {
                        gte: new Date()
                    }
                },
            }),
            // Expired listings
            prisma.foodListing.count({
                where: {
                    organizationId: organization.id,
                    availableUntil: {
                        lt: new Date()
                    }
                },
            }),
            // Total listings
            prisma.foodListing.count({
                where: {
                    organizationId: organization.id,
                },
            }),
            // Total claims
            prisma.claim.count({
                where: {
                    foodListing: {
                        organizationId: organization.id,
                    },
                },
            }),
            // Total food saved quantity
            prisma.claim.aggregate({
                where: {
                    foodListing: {
                        organizationId: organization.id,
                    },
                },
                _sum: {
                    quantity: true,
                },
            }),
            // Recent listings
            prisma.foodListing.findMany({
                where: {
                    organizationId: organization.id,
                },
                take: 5,
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    quantity: true,
                    availableFrom: true,
                    availableUntil: true,
                    createdAt: true,
                },
            }),
            // Recent claims
            prisma.claim.findMany({
                where: {
                    foodListing: {
                        organizationId: organization.id,
                    },
                },
                take: 5,
                orderBy: {
                    claimedAt: 'desc',
                },
                select: {
                    id: true,
                    quantity: true,
                    status: true,
                    claimedAt: true,
                    user: {
                        select: {
                            name: true,
                        },
                    },
                    foodListing: {
                        select: {
                            title: true,
                        },
                    },
                },
            }),
            // Impact breakdown by category
            prisma.claim.groupBy({
                by: ['foodListingId'],
                where: {
                    foodListing: {
                        organizationId: organization.id,
                    },
                    status: 'PICKED_UP',
                },
                _sum: {
                    actualImpactPoints: true,
                },
            }).then(async (results) => {
                // Get categories for each foodListingId
                const listingIds = results.map(r => r.foodListingId);
                const listings = await prisma.foodListing.findMany({
                    where: {
                        id: {
                            in: listingIds,
                        },
                    },
                    select: {
                        id: true,
                        category: true,
                    },
                });

                // Aggregate by category
                const categoryMap: { [key: string]: number } = {};
                results.forEach((result) => {
                    const listing = listings.find(l => l.id === result.foodListingId);
                    if (listing && result._sum.actualImpactPoints) {
                        const category = listing.category;
                        categoryMap[category] = (categoryMap[category] || 0) + result._sum.actualImpactPoints;
                    }
                });

                return categoryMap;
            }),
        ]);

        const foodSaved = claimedFood._sum.quantity || 0;

        return {
            organization: {
                name: organization.name,
                status: organization.status,
            },
            stats: {
                activeListings,
                expiredListings,
                totalListings,
                totalClaims,
                foodSaved,
                impactScore: organization.sdgScore,
                totalImpactPoints: organization.totalImpactPoints,
                totalDonations: organization.totalDonations,
            },
            impactBreakdown: impactByCategory,
            recent: {
                listings: recentListings,
                claims: recentClaims,
            },
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
}

export async function getOrganizationClaims() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ORGANIZATION') {
            throw new Error('Unauthorized');
        }

        const organization = await prisma.organization.findFirst({
            where: {
                userId: session.user.id,
            },
        });

        if (!organization) {
            throw new Error('Organization not found');
        }

        const claims = await prisma.claim.findMany({
            where: {
                foodListing: {
                    organizationId: organization.id,
                },
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                foodListing: {
                    select: {
                        title: true,
                        category: true,
                        unit: true,
                        pickupLocation: true,
                    },
                },
            },
            orderBy: {
                claimedAt: 'desc',
            },
        });

        return { claims };
    } catch (error) {
        console.error('Error fetching organization claims:', error);
        throw error;
    }
}

/**
 * Confirm an order (PENDING → CONFIRMED)
 * Organization confirms they've received the order and will prepare it
 */
export async function confirmOrder(claimId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ORGANIZATION') {
            throw new Error('Unauthorized');
        }

        const claim = await prisma.claim.findUnique({
            where: { id: claimId },
            include: {
                foodListing: {
                    select: {
                        organizationId: true,
                    },
                },
            },
        });

        if (!claim) {
            throw new Error('Claim not found');
        }

        // Verify the claim belongs to this organization's listing
        const organization = await prisma.organization.findFirst({
            where: { userId: session.user.id },
        });

        if (!organization || claim.foodListing.organizationId !== organization.id) {
            throw new Error('You can only confirm orders for your own listings');
        }

        if (claim.status !== 'PENDING') {
            throw new Error('Can only confirm pending orders');
        }

        // Update claim to CONFIRMED and sync itemStatus
        await prisma.claim.update({
            where: { id: claimId },
            data: {
                status: 'CONFIRMED',
                itemStatus: 'CONFIRMED',
                confirmedAt: new Date(),
            },
        });

        // Also update the FoodItem status
        if (claim.foodItemId) {
            await prisma.foodItem.update({
                where: { id: claim.foodItemId },
                data: { status: 'CONFIRMED' },
            });
        }

        revalidatePath('/dashboard/organization/claims');
        return { success: true };
    } catch (error) {
        console.error('Error confirming order:', error);
        throw error;
    }
}

/**
 * Mark order as ready for pickup (CONFIRMED → READY)
 * Organization indicates food is prepared and ready for collection
 */
export async function markOrderReady(claimId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ORGANIZATION') {
            throw new Error('Unauthorized');
        }

        const claim = await prisma.claim.findUnique({
            where: { id: claimId },
            include: {
                foodListing: {
                    select: {
                        organizationId: true,
                    },
                },
            },
        });

        if (!claim) {
            throw new Error('Claim not found');
        }

        // Verify the claim belongs to this organization's listing
        const organization = await prisma.organization.findFirst({
            where: { userId: session.user.id },
        });

        if (!organization || claim.foodListing.organizationId !== organization.id) {
            throw new Error('You can only mark ready orders for your own listings');
        }

        if (claim.status !== 'CONFIRMED') {
            throw new Error('Can only mark confirmed orders as ready');
        }

        // Update claim to READY and sync itemStatus
        await prisma.claim.update({
            where: { id: claimId },
            data: {
                status: 'READY',
                itemStatus: 'READY',
                readyAt: new Date(),
            },
        });

        // Also update the FoodItem status
        if (claim.foodItemId) {
            await prisma.foodItem.update({
                where: { id: claim.foodItemId },
                data: { status: 'READY' },
            });
        }

        revalidatePath('/dashboard/organization/claims');
        revalidatePath('/dashboard/student/claims');
        return { success: true };
    } catch (error) {
        console.error('Error marking order ready:', error);
        throw error;
    }
}

/**
 * Mark student as no-show
 * Student didn't collect the order within reasonable time
 */
export async function markNoShow(claimId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ORGANIZATION') {
            throw new Error('Unauthorized');
        }

        const claim = await prisma.claim.findUnique({
            where: { id: claimId },
            include: {
                foodListing: {
                    select: {
                        organizationId: true,
                    },
                },
            },
        });

        if (!claim) {
            throw new Error('Claim not found');
        }

        // Verify the claim belongs to this organization's listing
        const organization = await prisma.organization.findFirst({
            where: { userId: session.user.id },
        });

        if (!organization || claim.foodListing.organizationId !== organization.id) {
            throw new Error('You can only mark no-show for your own listings');
        }

        if (claim.status !== 'READY') {
            throw new Error('Can only mark ready orders as no-show');
        }

        // Update claim to NO_SHOW
        await prisma.$transaction(async (tx) => {
            await tx.claim.update({
                where: { id: claimId },
                data: {
                    status: 'NO_SHOW',
                    itemStatus: 'AVAILABLE',
                    cancelledAt: new Date(),
                    cancelledBy: 'ORGANIZATION',
                    cancellationReason: 'Student did not show up for collection',
                },
            });

            // Release the food item back to available
            if (claim.foodItemId) {
                await tx.foodItem.update({
                    where: { id: claim.foodItemId },
                    data: { status: 'AVAILABLE' },
                });
            }
        });

        revalidatePath('/dashboard/organization/claims');
        revalidatePath('/dashboard/student/claims');
        return { success: true };
    } catch (error) {
        console.error('Error marking no-show:', error);
        throw error;
    }
}

/**
 * Cancel an order
 * Can be called by either student or organization
 */
export async function cancelOrder(claimId: string, reason?: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error('Unauthorized');
        }

        const claim = await prisma.claim.findUnique({
            where: { id: claimId },
            include: {
                foodListing: {
                    select: {
                        organizationId: true,
                    },
                },
            },
        });

        if (!claim) {
            throw new Error('Claim not found');
        }

        // Verify user has permission
        if (session.user.role === 'STUDENT') {
            if (claim.userId !== session.user.id) {
                throw new Error('You can only cancel your own orders');
            }
        } else if (session.user.role === 'ORGANIZATION') {
            const organization = await prisma.organization.findFirst({
                where: { userId: session.user.id },
            });
            if (!organization || claim.foodListing.organizationId !== organization.id) {
                throw new Error('You can only cancel orders for your own listings');
            }
        }

        // Can't cancel if already picked up
        if (claim.status === 'PICKED_UP') {
            throw new Error('Cannot cancel order that has already been picked up');
        }

        // Can't cancel if already cancelled or no-show
        if (claim.status === 'CANCELLED' || claim.status === 'NO_SHOW') {
            throw new Error('Order is already cancelled');
        }

        // Cancel the order and release the item
        await prisma.$transaction(async (tx) => {
            await tx.claim.update({
                where: { id: claimId },
                data: {
                    status: 'CANCELLED',
                    itemStatus: 'AVAILABLE',
                    cancelledAt: new Date(),
                    cancelledBy: session.user.role!,
                    cancellationReason: reason || 'No reason provided',
                },
            });

            // Release the food item back to available
            if (claim.foodItemId) {
                await tx.foodItem.update({
                    where: { id: claim.foodItemId },
                    data: { status: 'AVAILABLE' },
                });
            }
        });

        revalidatePath('/dashboard/organization/claims');
        revalidatePath('/dashboard/student/claims');
        return { success: true };
    } catch (error) {
        console.error('Error cancelling order:', error);
        throw error;
    }
}

export async function getOrganizationById(id: string) {
    try {
        const organization = await prisma.organization.findUnique({
            where: {
                id,
            },
            include: {
                listings: {
                    where: {
                        status: 'AVAILABLE',
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 50, // Limit to recent items
                },
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!organization) {
            return null;
        }

        // Check if organization is approved and not banned
        if (organization.status !== 'APPROVED' || organization.status === 'BANNED') {
            return null;
        }

        // Get organization stats
        const [totalDonations, totalImpactPoints, activeListings] = await Promise.all([
            prisma.claim.count({
                where: {
                    foodListing: {
                        organizationId: id,
                    },
                    status: 'PICKED_UP',
                },
            }),
            prisma.claim.aggregate({
                where: {
                    foodListing: {
                        organizationId: id,
                    },
                    status: 'PICKED_UP',
                },
                _sum: {
                    actualImpactPoints: true,
                    actualImpactPoints: true,
                },
            }),
            prisma.foodListing.count({
                where: {
                    organizationId: id,
                    status: 'AVAILABLE',
                },
            }),
        ]);

        return {
            ...organization,
            stats: {
                totalDonations,
                totalImpactPoints: totalImpactPoints._sum.actualImpactPoints || 0,
                activeListings,
            },
        };
    } catch (error) {
        console.error('Error fetching organization by ID:', error);
        throw error;
    }
}
