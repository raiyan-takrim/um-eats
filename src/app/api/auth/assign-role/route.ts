import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// UM student email domains
const UM_STUDENT_DOMAINS = [
    '@siswa.um.edu.my',
    '@student.um.edu.my',
    '@um.edu.my',  // General UM domain
];

// Check if email is from UM student domain
function isUMStudentEmail(email: string): boolean {
    const lowerEmail = email.toLowerCase();
    return UM_STUDENT_DOMAINS.some(domain => lowerEmail.endsWith(domain));
}

export async function POST(req: NextRequest) {
    try {
        const { userId, email } = await req.json();

        if (!userId || !email) {
            return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 });
        }

        // Get current user to check existing role
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        // Only assign role if user doesn't have one or has the default ORGANIZATION role
        // This prevents overriding ADMIN roles set manually
        if (!existingUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Skip role assignment if user is already ADMIN
        if (existingUser.role === 'ADMIN') {
            return NextResponse.json({ success: true, role: 'ADMIN' });
        }

        // Determine role based on email domain for non-admin users
        const role = isUMStudentEmail(email) ? 'STUDENT' : 'ORGANIZATION';

        // Update user role in database
        await prisma.user.update({
            where: { id: userId },
            data: { role },
        });

        return NextResponse.json({ success: true, role });
    } catch (error) {
        console.error('Error assigning role:', error);
        return NextResponse.json({ error: 'Failed to assign role' }, { status: 500 });
    }
}
