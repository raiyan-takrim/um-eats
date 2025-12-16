'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UtensilsCrossed, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useState } from 'react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        try {
            await signIn.social({
                provider: 'google',
                callbackURL: '/',
            });
        } catch (error) {
            console.error('Sign in error:', error);
            setIsSigningIn(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-background px-4 py-12">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20">
                        <UtensilsCrossed className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-bold">Welcome to UMEats</CardTitle>
                        <CardDescription className="mt-3 text-base">
                            Sign in to save food, help students, and support sustainability
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Email Requirements Alert */}
                    <Alert className="border-primary/30 bg-primary/5">
                        <Info className="h-5 w-5 text-primary" />
                        <AlertDescription>
                            <p className="font-semibold mb-2">Email Requirements</p>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                                    <div>
                                        <span className="font-medium text-foreground">UM Students:</span> Use your <code className="px-1.5 py-0.5 bg-muted rounded text-xs">@siswa.um.edu.my</code> email
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                                    <div>
                                        <span className="font-medium text-foreground">Organizations:</span> Your account will be created by system administrators
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <XCircle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                                    <div>
                                        <span className="font-medium text-foreground">Personal emails</span> (Gmail, Yahoo, etc.) <span className="font-semibold">will be rejected</span>
                                    </div>
                                </div>
                            </div>
                        </AlertDescription>
                    </Alert>

                    {/* Sign In Button */}
                    <Button
                        onClick={handleGoogleSignIn}
                        disabled={isSigningIn}
                        variant="outline"
                        className="w-full border-2 hover:bg-primary/5 hover:border-primary"
                        size="lg"
                    >
                        {isSigningIn ? (
                            <>
                                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Sign in with Google
                            </>
                        )}
                    </Button>

                    {/* What Happens Next */}
                    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                        <p className="font-semibold text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-primary" />
                            What happens after sign in?
                        </p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-primary mt-0.5">1.</span>
                                <span>Google will show your accounts - <strong className="text-foreground">select your UM student account</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-primary mt-0.5">2.</span>
                                <span>System checks if your email ends with <code className="px-1 py-0.5 bg-muted rounded text-xs">@siswa.um.edu.my</code></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-primary mt-0.5">3.</span>
                                <span><strong className="text-primary">Valid email:</strong> Account created automatically, redirected to dashboard</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-primary mt-0.5">4.</span>
                                <span><strong className="text-destructive">Invalid email:</strong> Sign in will fail with an error message</span>
                            </li>
                        </ul>
                    </div>

                    {/* Back to Home */}
                    <div className="text-center">
                        <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                            <span>←</span> Back to home
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
