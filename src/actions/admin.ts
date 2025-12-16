'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAllOrganizations() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        const organizations = await prisma.organization.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return { organizations };
    } catch (error) {
        console.error('Error fetching organizations:', error);
        throw error;
    }
}

export async function getPendingOrganizations() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        const organizations = await prisma.organization.findMany({
            where: {
                status: 'PENDING',
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return { organizations };
    } catch (error) {
        console.error('Error fetching pending organizations:', error);
        throw error;
    }
}

export async function getOrganizationById(id: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        const organization = await prisma.organization.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!organization) {
            throw new Error('Organization not found');
        }

        return { organization };
    } catch (error) {
        console.error('Error fetching organization:', error);
        throw error;
    }
}

export async function updateOrganizationStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    rejectionReason?: string
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        const organization = await prisma.organization.update({
            where: { id },
            data: {
                status,
                rejectionReason: status === 'REJECTED' ? rejectionReason : null,
                verifiedBy: session.user.id,
                verifiedAt: new Date(),
            },
        });

        revalidatePath('/dashboard/admin');
        revalidatePath('/dashboard/admin/organizations');
        return { organization };
    } catch (error) {
        console.error('Error updating organization status:', error);
        throw error;
    }
}

export async function banOrganization(
    id: string,
    bannedReason: string
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        const organization = await prisma.organization.update({
            where: { id },
            data: {
                status: 'BANNED',
                bannedReason,
                bannedBy: session.user.id,
                bannedAt: new Date(),
            },
        });

        revalidatePath('/dashboard/admin');
        revalidatePath('/dashboard/admin/organizations');
        return { organization };
    } catch (error) {
        console.error('Error banning organization:', error);
        throw error;
    }
}

export async function unbanOrganization(id: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        const organization = await prisma.organization.update({
            where: { id },
            data: {
                status: 'APPROVED',
                bannedReason: null,
                bannedBy: null,
                bannedAt: null,
            },
        });

        revalidatePath('/dashboard/admin');
        revalidatePath('/dashboard/admin/organizations');
        return { organization };
    } catch (error) {
        console.error('Error unbanning organization:', error);
        throw error;
    }
}

export async function updateOrganizationDetails(
    id: string,
    data: {
        name: string;
        description?: string;
        address: string;
        phone: string;
        email: string;
    }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        const organization = await prisma.organization.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                address: data.address,
                phone: data.phone,
                email: data.email,
                updatedAt: new Date(),
            },
        });

        revalidatePath('/dashboard/admin');
        revalidatePath('/dashboard/admin/organizations');
        return { organization };
    } catch (error) {
        console.error('Error updating organization:', error);
        throw error;
    }
}

export async function deleteOrganization(id: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        // Delete related records first
        await prisma.$transaction([
            // Delete food listings
            prisma.foodListing.deleteMany({
                where: { organizationId: id },
            }),
            // Delete the organization
            prisma.organization.delete({
                where: { id },
            }),
        ]);

        revalidatePath('/dashboard/admin');
        revalidatePath('/dashboard/admin/organizations');
        return { success: true };
    } catch (error) {
        console.error('Error deleting organization:', error);
        throw error;
    }
}

// ============= USER MANAGEMENT ACTIONS =============

export async function getAllUsers() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                emailVerified: true,
                isBanned: true,
                bannedReason: true,
                bannedAt: true,
                createdAt: true,
                updatedAt: true,
                organization: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    },
                },
                _count: {
                    select: {
                        claims: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return { users };
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

export async function getUserById(id: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                organization: true,
                claims: {
                    include: {
                        foodListing: {
                            select: {
                                title: true,
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
                },
                _count: {
                    select: {
                        claims: true,
                        sessions: true,
                    },
                },
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return { user };
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

export async function updateUserRole(id: string, role: 'ADMIN' | 'STUDENT' | 'ORGANIZATION') {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role },
        });

        revalidatePath('/dashboard/admin/users');
        return { user };
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
}

export async function updateUserDetails(
    id: string,
    data: {
        name: string;
        email: string;
        phone?: string;
    }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        const user = await prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                updatedAt: new Date(),
            },
        });

        revalidatePath('/dashboard/admin/users');
        return { user };
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export async function deleteUser(id: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        // Prevent admin from deleting themselves
        if (session.user.id === id) {
            throw new Error('Cannot delete your own account');
        }

        // Delete user and all related data (cascading)
        await prisma.user.delete({
            where: { id },
        });

        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

export async function suspendUser(id: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        // Delete all active sessions to force logout
        await prisma.session.deleteMany({
            where: { userId: id },
        });

        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error suspending user:', error);
        throw error;
    }
}

// System Settings
export async function getSystemSettings() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        // Allow all authenticated users to read system settings
        if (!session?.user) {
            throw new Error('Unauthorized');
        }

        const settings = await prisma.systemSettings.findMany();

        // Convert to key-value object
        const settingsObj: Record<string, string> = {};
        settings.forEach(setting => {
            settingsObj[setting.key] = setting.value;
        });

        // Set defaults if not found
        return {
            platform_name: settingsObj.platform_name || 'UM Eats',
            admin_email: settingsObj.admin_email || '',
            support_email: settingsObj.support_email || '',
            auto_approve_orgs: settingsObj.auto_approve_orgs === 'true',
        };
    } catch (error) {
        console.error('Error fetching system settings:', error);
        throw error;
    }
}

export async function updateSystemSettings(data: {
    platform_name: string;
    admin_email: string;
    support_email: string;
    auto_approve_orgs: boolean;
}) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        // Update each setting using upsert
        await Promise.all([
            prisma.systemSettings.upsert({
                where: { key: 'platform_name' },
                update: { value: data.platform_name },
                create: { key: 'platform_name', value: data.platform_name },
            }),
            prisma.systemSettings.upsert({
                where: { key: 'admin_email' },
                update: { value: data.admin_email },
                create: { key: 'admin_email', value: data.admin_email },
            }),
            prisma.systemSettings.upsert({
                where: { key: 'support_email' },
                update: { value: data.support_email },
                create: { key: 'support_email', value: data.support_email },
            }),
            prisma.systemSettings.upsert({
                where: { key: 'auto_approve_orgs' },
                update: { value: data.auto_approve_orgs.toString() },
                create: { key: 'auto_approve_orgs', value: data.auto_approve_orgs.toString() },
            }),
        ]);

        revalidatePath('/dashboard/admin/settings');
        return { success: true };
    } catch (error) {
        console.error('Error updating system settings:', error);
        throw error;
    }
}

// User Ban/Unban
export async function banUser(id: string, reason: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        // Prevent self-ban
        if (id === session.user.id) {
            throw new Error('Cannot ban yourself');
        }

        await prisma.$transaction(async (tx) => {
            // Update user ban status
            await tx.user.update({
                where: { id },
                data: {
                    isBanned: true,
                    bannedAt: new Date(),
                    bannedReason: reason,
                    bannedBy: session.user.id,
                },
            });

            // Delete all active sessions to force logout
            await tx.session.deleteMany({
                where: { userId: id },
            });
        });

        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error banning user:', error);
        throw error;
    }
}

export async function unbanUser(id: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        await prisma.user.update({
            where: { id },
            data: {
                isBanned: false,
                bannedAt: null,
                bannedReason: null,
                bannedBy: null,
            },
        });

        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error unbanning user:', error);
        throw error;
    }
}

// Admin Dashboard Stats
export async function getAdminDashboardStats() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        const [
            totalUsers,
            totalOrganizations,
            pendingOrganizations,
            approvedOrganizations,
            rejectedOrganizations,
            bannedOrganizations,
            totalFoodListings,
            activeFoodListings,
            totalClaims,
            recentUsers,
            recentOrganizations,
            recentClaims,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.organization.count(),
            prisma.organization.count({ where: { status: 'PENDING' } }),
            prisma.organization.count({ where: { status: 'APPROVED' } }),
            prisma.organization.count({ where: { status: 'REJECTED' } }),
            prisma.organization.count({ where: { status: 'BANNED' } }),
            prisma.foodListing.count(),
            prisma.foodListing.count({
                where: {
                    status: 'AVAILABLE',
                    availableUntil: {
                        gte: new Date()
                    }
                }
            }),
            prisma.claim.count(),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                },
            }),
            prisma.organization.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    createdAt: true,
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
            prisma.claim.findMany({
                take: 5,
                orderBy: { claimedAt: 'desc' },
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
                            organization: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
        ]);

        return {
            stats: {
                users: {
                    total: totalUsers,
                },
                organizations: {
                    total: totalOrganizations,
                    pending: pendingOrganizations,
                    approved: approvedOrganizations,
                    rejected: rejectedOrganizations,
                    banned: bannedOrganizations,
                },
                foodListings: {
                    total: totalFoodListings,
                    active: activeFoodListings,
                },
                claims: {
                    total: totalClaims,
                },
            },
            recent: {
                users: recentUsers,
                organizations: recentOrganizations,
                claims: recentClaims,
            },
        };
    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        throw error;
    }
}

// User Profile Update
export async function updateUserProfile(data: {
    name: string;
    phone?: string;
    image?: string;
}) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error('Unauthorized');
        }

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: data.name,
                phone: data.phone || null,
                image: data.image || null,
                updatedAt: new Date(),
            },
        });

        revalidatePath('/dashboard/admin/profile');
        revalidatePath('/dashboard/student/profile');
        revalidatePath('/dashboard/organization/profile');
        return { user };
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

export async function getUserProfile() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error('Unauthorized');
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                image: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
                organization: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    },
                },
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return { user };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}
