'use client';

import { useSession as useBetterAuthSession } from './auth-client';
import type { UserRole } from '@prisma/client';

export interface ExtendedUser {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null;
    role: UserRole;
    phone?: string | null;
}

export interface ExtendedSession {
    data: {
        session: any;
        user: ExtendedUser;
    } | null;
    isPending: boolean;
    error: Error | null;
}

export function useSession() {
    const result = useBetterAuthSession();
    return result as unknown as ExtendedSession;
}
