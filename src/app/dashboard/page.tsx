'use client';

import { useSession } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// export default function DashboardPage() {
//     const { data, isPending } = useSession();
//     const router = useRouter();

//     useEffect(() => {
//         if (!isPending && data?.user) {
//             // Redirect to appropriate dashboard based on role
//             const role = data.user.role;
//             if (role === 'ADMIN') {
//                 router.push('/dashboard/admin');
//             } else if (role === 'ORGANIZATION') {
//                 router.push('/dashboard/organization');
//             } else if (role === 'STUDENT') {
//                 router.push('/dashboard/student');
//             }
//         }
//     }, [data, isPending, router]);

//     return (
//         <div className="flex min-h-screen items-center justify-center">
//             <div className="text-center">
//                 <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
//                 <p className="mt-2 text-sm text-muted-foreground">Redirecting...</p>
//             </div>
//         </div>
//     );
// }


export default function Page() {
    const { data, isPending } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!isPending && data?.user) {
            // Redirect to appropriate dashboard based on role
            const role = data.user.role;
            if (role === 'ADMIN') {
                router.push('/dashboard/admin');
            } else if (role === 'ORGANIZATION') {
                router.push('/dashboard/organization');
            } else if (role === 'STUDENT') {
                router.push('/dashboard/student');
            }
        }
    }, [data, isPending, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                <p className="mt-2 text-sm text-muted-foreground">Redirecting...</p>
            </div>
        </div>
    )
}
