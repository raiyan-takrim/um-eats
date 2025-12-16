import type { auth } from './lib/auth';

declare module 'better-auth/react' {
    interface Session {
        user: typeof auth.$Infer.Session.user & {
            role: string;
            phone?: string | null;
        };
    }
}

export { };
