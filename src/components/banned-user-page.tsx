'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { signOut } from '@/lib/auth-client';

interface BannedUserPageProps {
    reason: string;
    bannedAt: Date;
    adminEmail?: string;
}

export function BannedUserPage({ reason, bannedAt, adminEmail = 'admin@um.edu.my' }: BannedUserPageProps) {
    const handleSignOut = async () => {
        await signOut();
        window.location.href = '/';
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="max-w-2xl border-red-500">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl text-red-600">Account Banned</CardTitle>
                    <CardDescription>
                        Your account has been banned from the platform
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-semibold text-red-900 mb-2">Reason for ban:</p>
                        <p className="text-sm text-red-800">{reason}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground mb-2">
                            <span className="font-semibold">Banned on:</span>{' '}
                            {new Date(bannedAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            You cannot access the platform while your account is banned. If you believe this is a mistake or would like to appeal, please contact the admin team at{' '}
                            <span className="font-semibold">{adminEmail}</span>
                        </p>
                    </div>
                    <Button onClick={handleSignOut} variant="outline" className="w-full">
                        Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
