import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { organization } from 'better-auth/plugins';
import { prisma } from './prisma';

// UM student email domains
const UM_STUDENT_DOMAINS = ['@siswa.um.edu.my', '@student.um.edu.my'];

// Check if email is from UM student domain
function isUMStudentEmail(email: string): boolean {
    return UM_STUDENT_DOMAINS.some(domain => email.toLowerCase().endsWith(domain));
}

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: false, // We only use Google OAuth
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // Update session every 24 hours
    },
    user: {
        additionalFields: {
            role: {
                type: 'string',
                required: true,
                defaultValue: 'ORGANIZATION',
            },
            phone: {
                type: 'string',
                required: false,
            },
        },
    },
    onRequest: async (request: any, context: any) => {
        // Check if this is a callback from OAuth
        if (request.url.includes('/callback/google')) {
            return context;
        }

        // Check if user is banned (for authenticated requests)
        const session = context.session;
        if (session?.user) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { isBanned: true },
            });

            if (user?.isBanned) {
                // Clear session if user is banned
                return new Response(JSON.stringify({ error: 'Account banned' }), {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        return context;
    },
    onResponse: async (response: any, context: any) => {
        return response;
    },
    plugins: [
        organization({
            // After user creates organization, needs admin approval
            allowUserToCreateOrganization: true,
            creatorRole: 'owner', // User who creates org becomes owner
            membershipLimit: 100, // Max members per organization
            sendInvitationEmail: async (data) => {
                // TODO: Implement email sending
                console.log('Send invitation email to:', data.email);
            },
        }),
    ],
});

export type Session = typeof auth.$Infer.Session;


