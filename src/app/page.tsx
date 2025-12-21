'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Leaf, TrendingUp, Users, Award, Sparkles, Clock,} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { OrgCard } from '@/components/features/org-card';
import { useSession } from '@/lib/use-auth';
import { authClient } from '@/lib/auth-client';
import { getTopOrganizations, getPlatformStats } from '@/actions/stats';
import { formatImpactPoints } from '@/lib/impact-calculator';

function HomePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data, isPending } = useSession();
    const [topOrganizations, setTopOrganizations] = useState<any[]>([]);
    const [loadingOrgs, setLoadingOrgs] = useState(true);
    const [stats, setStats] = useState({
        totalImpactPoints: 0,
        totalDonations: 0,
        totalPartners: 0,
        uniqueStudents: 0,
        activeListings: 0,
    });
    const [loadingStats, setLoadingStats] = useState(true);

    const handleSignInWithRedirect = async () => {
        await authClient.signIn.social({
            provider: 'google',
            callbackURL: `${window.location.origin}?redirect=/dashboard`,
        });
    };

    // Fetch top organizations and platform stats
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [orgs, platformStats] = await Promise.all([
                    getTopOrganizations(3),
                    getPlatformStats(),
                ]);
                setTopOrganizations(orgs);
                setStats(platformStats);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoadingOrgs(false);
                setLoadingStats(false);
            }
        };

        fetchData();
    }, []);

    // Handle redirect parameter after login (only if redirect is specified)
    useEffect(() => {
        if (!isPending && data?.user) {
            const redirect = searchParams.get('redirect');
            if (redirect) {
                // Only redirect if there's a specific redirect parameter
                router.push(redirect);
            }
        }
    }, [data, isPending, router, searchParams]);

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-linear-to-br from-primary/10 via-background to-primary/5 py-16 md:py-24">
                    {/* Decorative background elements */}
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
                        <div className="absolute right-1/4 top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                    </div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl text-center">
                            {/* Badge for trust indicator */}
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 backdrop-blur-sm">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Powered by SDG Impact Scoring</span>
                            </div>

                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                                Fighting Food Waste,
                                <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent"> Feeding Students</span>
                            </h1>
                            <p className="mt-6 text-lg text-muted-foreground sm:text-xl md:mt-8 md:text-2xl">
                                Connect with restaurants and events at Universiti Malaya to rescue leftover food.
                                <span className="block mt-2 font-semibold text-foreground">Help achieve SDG 2 (Zero Hunger) and SDG 12 (Responsible Consumption).</span>
                            </p>
                            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                                {data?.user ? (
                                    <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                                        <Link href="/dashboard">Go to Dashboard</Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button size="lg" asChild className="w-full sm:w-auto">
                                            <Link href="/dashboard">
                                                Browse Available Food
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="w-full sm:w-auto"
                                            asChild
                                        >
                                            <Link href="/dashboard">
                                                Register Your Organization
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Impact Stats - Real Time Data */}
                <section className="border-y bg-linear-to-b from-background to-muted/20 py-12 md:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold md:text-3xl">Our Impact So Far</h2>
                            <p className="mt-2 text-muted-foreground">Real-time statistics from our platform</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Impact Points Card */}
                            <Card className="border-primary/20 bg-linear-to-br from-background to-primary/5 transition-all hover:shadow-lg hover:scale-105">
                                <CardContent className="flex flex-col items-center p-6">
                                    <div className="rounded-full bg-primary/10 p-4 ring-4 ring-primary/10">
                                        <Leaf className="h-7 w-7 text-primary" />
                                    </div>
                                    {loadingStats ? (
                                        <Skeleton className="mt-4 h-9 w-24" />
                                    ) : (
                                        <p className="mt-4 text-3xl font-bold text-primary">
                                            {formatImpactPoints(stats.totalImpactPoints)}
                                        </p>
                                    )}
                                    <p className="text-sm font-medium text-muted-foreground">Impact Points (FIP)</p>
                                    <p className="mt-1 text-xs text-muted-foreground">≈ {Math.round(stats.totalImpactPoints * 1.5)} kg CO₂ saved</p>
                                </CardContent>
                            </Card>

                            {/* Students Helped Card */}
                            <Card className="border-primary/20 bg-linear-to-br from-background to-blue-500/5 transition-all hover:shadow-lg hover:scale-105">
                                <CardContent className="flex flex-col items-center p-6">
                                    <div className="rounded-full bg-blue-500/10 p-4 ring-4 ring-blue-500/10">
                                        <Users className="h-7 w-7 text-blue-600" />
                                    </div>
                                    {loadingStats ? (
                                        <Skeleton className="mt-4 h-9 w-24" />
                                    ) : (
                                        <p className="mt-4 text-3xl font-bold text-blue-600">
                                            {stats.uniqueStudents.toLocaleString()}
                                        </p>
                                    )}
                                    <p className="text-sm font-medium text-muted-foreground">Students Helped</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Active users</p>
                                </CardContent>
                            </Card>

                            {/* Donations Card */}
                            <Card className="border-primary/20 bg-linear-to-br from-background to-green-500/5 transition-all hover:shadow-lg hover:scale-105">
                                <CardContent className="flex flex-col items-center p-6">
                                    <div className="rounded-full bg-green-500/10 p-4 ring-4 ring-green-500/10">
                                        <TrendingUp className="h-7 w-7 text-green-600" />
                                    </div>
                                    {loadingStats ? (
                                        <Skeleton className="mt-4 h-9 w-24" />
                                    ) : (
                                        <p className="mt-4 text-3xl font-bold text-green-600">
                                            {stats.totalDonations.toLocaleString()}
                                        </p>
                                    )}
                                    <p className="text-sm font-medium text-muted-foreground">Total Donations</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Completed rescues</p>
                                </CardContent>
                            </Card>

                            {/* Partners Card */}
                            <Card className="border-primary/20 bg-linear-to-br from-background to-amber-500/5 transition-all hover:shadow-lg hover:scale-105">
                                <CardContent className="flex flex-col items-center p-6">
                                    <div className="rounded-full bg-amber-500/10 p-4 ring-4 ring-amber-500/10">
                                        <Award className="h-7 w-7 text-amber-600" />
                                    </div>
                                    {loadingStats ? (
                                        <Skeleton className="mt-4 h-9 w-24" />
                                    ) : (
                                        <p className="mt-4 text-3xl font-bold text-amber-600">
                                            {stats.totalPartners.toLocaleString()}
                                        </p>
                                    )}
                                    <p className="text-sm font-medium text-muted-foreground">Partner Organizations</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Verified partners</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Live Activity Indicator */}
                        {!loadingStats && stats.activeListings > 0 && (
                            <div className="mt-8 text-center">
                                <Badge variant="outline" className="gap-2 px-4 py-2">
                                    <Clock className="h-4 w-4 animate-pulse text-green-500" />
                                    <span className="font-medium">{stats.activeListings} active food listings available now</span>
                                </Badge>
                            </div>
                        )}
                    </div>
                </section>

                {/* Top Organizations Rankings */}
                <section className="bg-muted/30 py-16 md:py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-10 flex items-center justify-between md:mb-12">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="h-6 w-6 text-primary" />
                                    <h2 className="text-3xl font-bold md:text-4xl">SDG Champions Leaderboard</h2>
                                </div>
                                <p className="mt-2 text-lg text-muted-foreground">
                                    Top organizations contributing to sustainable food redistribution
                                </p>
                            </div>
                            <Button variant="outline" size="sm" asChild className="hidden md:flex">
                                <Link href="/rankings">
                                    View All
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {loadingOrgs ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <Card key={i} className="animate-pulse">
                                            <CardContent className="p-6">
                                                <div className="h-20 bg-muted rounded" />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : topOrganizations.length > 0 ? (
                                topOrganizations.map((org, index) => (
                                    <OrgCard key={org.id} organization={org} rank={index + 1} />
                                ))
                            ) : (
                                <Card className="border-2 border-primary/20 bg-linear-to-br from-background to-primary/5">
                                    <CardContent className="p-10 text-center">
                                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                            <Award className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="mb-3 text-xl font-bold">🏆 Rankings Coming Soon!</h3>
                                        <p className="text-muted-foreground mb-4 leading-relaxed">
                                            No organizations have completed donations yet. Organizations appear on this leaderboard after students collect their claimed food.
                                        </p>
                                        <div className="mt-6 pt-6 border-t border-border/40">
                                            <p className="text-sm text-muted-foreground mb-2">How organizations get ranked:</p>
                                            <div className="flex flex-col gap-2 text-sm text-left max-w-md mx-auto">
                                                <div className="flex items-start gap-2">
                                                    <span className="text-primary font-semibold">1.</span>
                                                    <span className="text-muted-foreground">Organization lists available food</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <span className="text-primary font-semibold">2.</span>
                                                    <span className="text-muted-foreground">Students claim and reserve food</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <span className="text-primary font-semibold">3.</span>
                                                    <span className="text-muted-foreground">Students collect food in person</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <span className="text-primary font-semibold">4.</span>
                                                    <span className="text-muted-foreground">Student marks claim as "Collected" in dashboard</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <span className="text-primary font-semibold">5.</span>
                                                    <span className="text-muted-foreground">Rankings auto-update and organization appears here!</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div className="mt-8 text-center">
                            <Button variant="outline" asChild>
                                <Link href="/rankings">
                                    View Full Rankings
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="border-t bg-background py-16 md:py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold md:text-4xl">How It Works</h2>
                            <p className="mt-3 text-lg text-muted-foreground">
                                Three simple steps to save food and help the community
                            </p>
                        </div>

                        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
                            {/* Connection lines for desktop */}
                            <div className="absolute left-0 right-0 top-15 hidden h-0.5 bg-linear-to-r from-primary/0 via-primary/50 to-primary/0 md:block" />

                            <Card className="relative border-2 border-primary/20 bg-linear-to-br from-background to-primary/5 transition-all hover:shadow-xl hover:scale-105">
                                <CardContent className="p-8">
                                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/80 text-2xl font-bold text-primary-foreground shadow-lg">
                                        1
                                    </div>
                                    <h3 className="mb-3 text-2xl font-bold">Browse Food</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Explore available leftover food from verified restaurants and events near you on campus. Filter by dietary preferences and distance.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="relative border-2 border-primary/20 bg-linear-to-br from-background to-primary/5 transition-all hover:shadow-xl hover:scale-105">
                                <CardContent className="p-8">
                                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/80 text-2xl font-bold text-primary-foreground shadow-lg">
                                        2
                                    </div>
                                    <h3 className="mb-3 text-2xl font-bold">Claim Your Meal</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Reserve food items instantly with one click. Get pickup location, time window, and preparation instructions right away.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="relative border-2 border-primary/20 bg-linear-to-br from-background to-primary/5 transition-all hover:shadow-xl hover:scale-105">
                                <CardContent className="p-8">
                                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/80 text-2xl font-bold text-primary-foreground shadow-lg">
                                        3
                                    </div>
                                    <h3 className="mb-3 text-2xl font-bold">Collect & Enjoy</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Visit the pickup location during the time window and collect your free meal. Help reduce food waste and support SDGs!
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-12 text-center">
                            <p className="text-muted-foreground">
                                All food is donated by verified organizations and is completely <span className="font-semibold text-primary">free for UM students</span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="border-t bg-linear-to-b from-muted/30 to-background py-16 md:py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <Card className="overflow-hidden border-2 border-primary/30 bg-linear-to-br from-primary/10 via-primary/5 to-background shadow-2xl">
                            <CardContent className="relative p-10 text-center md:p-16">
                                {/* Decorative elements */}
                                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

                                <div className="relative">
                                    <Badge variant="outline" className="mb-4">
                                        <Sparkles className="mr-1 h-3 w-3" />
                                        For Organizations
                                    </Badge>
                                    <h2 className="text-3xl font-bold md:text-4xl">
                                        Are you a restaurant or event organizer?
                                    </h2>
                                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                                        Join UMEats and turn your leftover food into measurable impact. Improve your SDG ranking, gain brand visibility, and make a real difference in the community.
                                    </p>
                                    <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Award className="h-4 w-4 text-primary" />
                                            <span>SDG Impact Scoring</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-primary" />
                                            <span>Public Leaderboard</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-primary" />
                                            <span>Community Recognition</span>
                                        </div>
                                    </div>
                                    {data?.user?.role == "ORGANIZATION" ? (
                                        <Button size="lg" asChild className="mt-8 shadow-lg">
                                            <Link href="/dashboard/organization/create">
                                                Register Your Organization
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            size="lg"
                                            asChild
                                            className="mt-8 shadow-lg"
                                        >
                                                <Link href="/login?callbackUrl=/dashboard">
                                                Register Your Organization
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
            <HomePageContent />
        </Suspense>
    );
}
