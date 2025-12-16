'use server';

import { prisma } from './prisma';

export async function checkUserBanStatus(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                isBanned: true,
                bannedReason: true,
                bannedAt: true,
            },
        });

        return {
            isBanned: user?.isBanned || false,
            bannedReason: user?.bannedReason || null,
            bannedAt: user?.bannedAt || null,
        };
    } catch (error) {
        console.error('Error checking ban status:', error);
        return {
            isBanned: false,
            bannedReason: null,
            bannedAt: null,
        };
    }
}
