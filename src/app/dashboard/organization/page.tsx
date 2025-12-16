'use client';

import { useSession } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Clock,
    AlertCircle,
    CheckCircle,
    Building2,
    Plus,
    Package,
    TrendingUp,
    Users,
    ArrowUpRight,
    Calendar,
    Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { getOrganizationStatus, getDashboardStats } from '@/actions/organization';
import { getSystemSettings } from '@/actions/admin';

type DashboardData = {
    organization: {
        name: string;
        status: string;
    };
    stats: {
        activeListings: number;
        expiredListings: number;
        totalListings: number;
        totalClaims: number;
        foodSaved: number;
        impactScore: number;
        totalFoodSaved: number;
        totalDonations: number;
    };
    recent: {
        listings: Array<{
            id: string;
            title: string;
            status: string;
            quantity: number;
            availableFrom: Date;
            availableUntil: Date;
            createdAt: Date;
        }>;
        claims: Array<{
            id: string;
            quantity: number;
            status: string;
            claimedAt: Date;
            user: {
                name: string;
            };
            foodListing: {
                title: string;
            };
        }>;
    };
};

export default function OrganizationDashboardPage() {
    const { data, isPending } = useSession();
    const router = useRouter();
    const [orgStatus, setOrgStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED' | 'NONE' | null>(null);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [banReason, setBanReason] = useState<string | null>(null);
    const [adminEmail, setAdminEmail] = useState('admin@um.edu.my');

    useEffect(() => {
        if (!isPending && (!data?.user || data.user.role !== 'ORGANIZATION')) {
            router.push('/');
        }
    }, [data, isPending, router]);

    useEffect(() => {
        if (data?.user) {
            fetchOrganizationStatus();
            fetchAdminEmail();
        }
    }, [data]);

    const fetchAdminEmail = async () => {
        try {
            const settings = await getSystemSettings();
            setAdminEmail(settings.admin_email || 'admin@um.edu.my');
        } catch (error) {
            console.error('Failed to fetch admin email');
        }
    };

    const fetchOrganizationStatus = async () => {
        try {
            const result = await getOrganizationStatus();

            if (!result.organization) {
                setOrgStatus('NONE');
                return;
            }

            setOrgStatus(result.organization.status);

            if (result.organization.status === 'BANNED') {
                setBanReason(result.organization.bannedReason || 'No reason provided');
            }

            if (result.organization.status === 'APPROVED') {
                const statsResult = await getDashboardStats();
                setDashboardData(statsResult as any);
            }
        } catch (error) {
            console.error('Failed to fetch status');
            setOrgStatus('NONE');
        } finally {
            setLoading(false);
        }
    };

    if (isPending || loading || !data?.user || data.user.role !== 'ORGANIZATION') {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    // Show "no organization" state
    if (orgStatus === 'NONE') {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="max-w-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Building2 className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">No Active Organization</CardTitle>
                        <CardDescription>
                            You need to create an organization to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <p className="text-sm text-muted-foreground">
                                Register your restaurant, café, or event organization to start listing food and help reduce waste on campus.
                            </p>
                        </div>
                        <Button asChild className="w-full" size="lg">
                            <Link href="/dashboard/organization/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Organization
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show pending message
    if (orgStatus === 'PENDING') {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="max-w-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <CardTitle className="text-2xl">Application Under Review</CardTitle>
                        <CardDescription>
                            Your organization application is being reviewed by our admins
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <p className="text-sm">
                                You'll be notified via email once your application is reviewed. This typically takes 1-2 business days.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (orgStatus === 'BANNED') {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="max-w-2xl border-red-200 dark:border-red-900">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <CardTitle className="text-2xl text-red-600 dark:text-red-400">Organization Banned</CardTitle>
                        <CardDescription>
                            Your organization has been banned from the platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                            <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">Reason:</p>
                            <p className="text-sm text-red-800 dark:text-red-200">{banReason}</p>
                        </div>
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <p className="text-sm text-muted-foreground">
                                Contact admin at <span className="font-semibold">{adminEmail}</span> to appeal.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (orgStatus === 'REJECTED') {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="max-w-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <CardTitle className="text-2xl">Application Rejected</CardTitle>
                        <CardDescription>
                            Your organization application was not approved
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <p className="text-sm">
                                Contact admin at <span className="font-semibold">{adminEmail}</span> for more information.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Approved - show full dashboard
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Organization Overview</h1>
                <p className="mt-2 text-muted-foreground">
                    Monitor your impact and manage food listings
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {loading ? (
                    <>
                        {[...Array(4)].map((_, i) => (
                            <Card key={i}>
                                <CardContent className="p-6">
                                    <Skeleton className="h-20 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </>
                ) : (
                    <>
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Active Listings
                                        </p>
                                        <p className="mt-2 text-3xl font-bold">
                                            {dashboardData?.stats.activeListings}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            of {dashboardData?.stats.totalListings} total
                                        </p>
                                    </div>
                                    <Package className="h-12 w-12 text-blue-500 opacity-80" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Total Claims
                                        </p>
                                        <p className="mt-2 text-3xl font-bold">
                                            {dashboardData?.stats.totalClaims}
                                        </p>
                                    </div>
                                    <Users className="h-12 w-12 text-green-500 opacity-80" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Food Saved
                                        </p>
                                        <p className="mt-2 text-3xl font-bold">
                                            {dashboardData?.stats.foodSaved}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            portions
                                        </p>
                                    </div>
                                    <TrendingUp className="h-12 w-12 text-purple-500 opacity-80" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Impact Score
                                        </p>
                                        <p className="mt-2 text-3xl font-bold">
                                            {dashboardData?.stats.impactScore.toFixed(1)}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            SDG contribution
                                        </p>
                                    </div>
                                    <CheckCircle className="h-12 w-12 text-orange-500 opacity-80" />
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Listings */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Listings</CardTitle>
                            <CardDescription>Your latest food listings</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/organization/listings">
                                View All
                                <ArrowUpRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : dashboardData?.recent.listings.length === 0 ? (
                            <div className="py-8 text-center">
                                <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                                <p className="mt-2 text-sm text-muted-foreground">No listings yet</p>
                                <Button asChild className="mt-4" size="sm">
                                    <Link href="/dashboard/organization/listings/create">
                                        <Plus className="mr-2 h-3 w-3" />
                                        Create Listing
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {dashboardData?.recent.listings.map((listing) => {
                                    const isExpired = new Date(listing.availableUntil) < new Date();
                                    return (
                                        <div
                                            key={listing.id}
                                            className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{listing.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Qty: {listing.quantity}
                                                </p>
                                            </div>
                                            <Badge variant={
                                                isExpired ? 'secondary' :
                                                    listing.status === 'AVAILABLE' ? 'default' : 'outline'
                                            }>
                                                {isExpired ? 'EXPIRED' : listing.status}
                                            </Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Claims */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Claims</CardTitle>
                            <CardDescription>Latest student claims</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : dashboardData?.recent.claims.length === 0 ? (
                            <div className="py-8 text-center">
                                <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                                <p className="mt-2 text-sm text-muted-foreground">No claims yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {dashboardData?.recent.claims.map((claim) => (
                                    <div
                                        key={claim.id}
                                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {claim.foodListing.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {claim.user.name} • Qty: {claim.quantity}
                                            </p>
                                        </div>
                                        <Badge variant={
                                            claim.status === 'CLAIMED' ? 'secondary' :
                                                claim.status === 'COLLECTED' ? 'default' : 'outline'
                                        }>
                                            {claim.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Action Required - New Listing */}
            {!loading && dashboardData && dashboardData.stats.activeListings === 0 && (
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                    <CardContent className="flex items-center gap-4 p-6">
                        <Plus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        <div className="flex-1">
                            <p className="font-semibold text-blue-900 dark:text-blue-100">
                                No Active Listings
                            </p>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                Create your first food listing to start helping reduce waste
                            </p>
                        </div>
                        <Button asChild>
                            <Link href="/dashboard/organization/listings/create">
                                Create Listing
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
