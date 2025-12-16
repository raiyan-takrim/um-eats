'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
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

export async function updateUserProfile(data: {
    name?: string;
    image?: string;
}) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error('Unauthorized');
        }

        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.image !== undefined) updateData.image = data.image;

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
            },
        });

        revalidatePath('/dashboard');
        return { user };
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}
