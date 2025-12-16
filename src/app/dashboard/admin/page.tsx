'use client';

import { useSession } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Users,
    Building,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    ArrowUpRight,
    ShieldBan,
    Award,
    Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { getAdminDashboardStats } from '@/actions/admin';
import { calculateOrganizationRankings } from '@/actions/rankings';
import { toast } from 'sonner';

type DashboardData = {
    stats: {
        users: { total: number };
        organizations: {
            total: number;
            pending: number;
            approved: number;
            rejected: number;
            banned: number;
        };
        foodListings: {
            total: number;
            active: number;
        };
        claims: {
            total: number;
        };
    };
    recent: {
        users: Array<{
            id: string;
            name: string;
            email: string;
            role: string;
            createdAt: Date;
        }>;
        organizations: Array<{
            id: string;
            name: string;
            status: string;
            createdAt: Date;
            user: {
                name: string;
                email: string;
            };
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
                organization: {
                    name: string;
                };
            };
        }>;
    };
};

export default function AdminDashboardPage() {
    const { data, isPending } = useSession();
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [calculatingRankings, setCalculatingRankings] = useState(false);

    useEffect(() => {
        if (!isPending && (!data?.user || data.user.role !== 'ADMIN')) {
            router.push('/');
        }
    }, [data, isPending, router]);

    useEffect(() => {
        if (data?.user?.role === 'ADMIN') {
            fetchDashboardData();
        }
    }, [data]);

    const fetchDashboardData = async () => {
        try {
            const result = await getAdminDashboardStats();
            setDashboardData(result as any);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCalculateRankings = async () => {
        setCalculatingRankings(true);
        try {
            const result = await calculateOrganizationRankings();
            toast.success(result.message || 'Organization rankings have been updated successfully.');
            // Refresh dashboard data
            await fetchDashboardData();
        } catch (error) {
            console.error('Error calculating rankings:', error);
            toast.error('Failed to calculate rankings. Please try again.');
        } finally {
            setCalculatingRankings(false);
        }
    };

    if (isPending || !data?.user || data.user.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Admin Overview</h1>
                    <p className="mt-2 text-muted-foreground">
                        Monitor platform activity and manage key operations
                    </p>
                </div>
                <Button
                    onClick={handleCalculateRankings}
                    disabled={calculatingRankings}
                    variant="outline"
                    className="gap-2"
                    title="Rankings auto-calculate when claims are collected. Use this to manually recalculate."
                >
                    {calculatingRankings ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Calculating...
                        </>
                    ) : (
                        <>
                            <Award className="h-4 w-4" />
                            Recalculate Rankings
                        </>
                    )}
                </Button>
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
                                            Total Users
                                        </p>
                                        <p className="mt-2 text-3xl font-bold">
                                            {dashboardData?.stats.users.total}
                                        </p>
                                    </div>
                                    <Users className="h-12 w-12 text-blue-500 opacity-80" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Organizations
                                        </p>
                                        <p className="mt-2 text-3xl font-bold">
                                            {dashboardData?.stats.organizations.approved}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            of {dashboardData?.stats.organizations.total} total
                                        </p>
                                    </div>
                                    <Building className="h-12 w-12 text-green-500 opacity-80" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Active Listings
                                        </p>
                                        <p className="mt-2 text-3xl font-bold">
                                            {dashboardData?.stats.foodListings.active}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            of {dashboardData?.stats.foodListings.total} total
                                        </p>
                                    </div>
                                    <Package className="h-12 w-12 text-purple-500 opacity-80" />
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
                                            {dashboardData?.stats.claims.total}
                                        </p>
                                    </div>
                                    <TrendingUp className="h-12 w-12 text-orange-500 opacity-80" />
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Organization Status Overview */}
            {!loading && (
                <Card>
                    <CardHeader>
                        <CardTitle>Organization Status</CardTitle>
                        <CardDescription>Quick overview of organization applications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Link
                                href="/dashboard/admin/organizations"
                                className="group flex items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors"
                            >
                                <Clock className="h-8 w-8 text-yellow-500" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {dashboardData?.stats.organizations.pending}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                </div>
                            </Link>

                            <div className="flex items-center gap-3 rounded-lg border p-4">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {dashboardData?.stats.organizations.approved}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Approved</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border p-4">
                                <XCircle className="h-8 w-8 text-red-500" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {dashboardData?.stats.organizations.rejected}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Rejected</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border p-4">
                                <ShieldBan className="h-8 w-8 text-gray-500" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {dashboardData?.stats.organizations.banned}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Banned</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions & Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Users */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Users</CardTitle>
                            <CardDescription>Latest user registrations</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/admin/users">
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
                        ) : (
                            <div className="space-y-3">
                                {dashboardData?.recent.users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{user.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                        <Badge variant={
                                            user.role === 'ADMIN' ? 'destructive' :
                                                user.role === 'ORGANIZATION' ? 'default' : 'secondary'
                                        }>
                                            {user.role}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Organizations */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Organizations</CardTitle>
                            <CardDescription>Latest organization applications</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/admin/organizations">
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
                        ) : (
                            <div className="space-y-3">
                                {dashboardData?.recent.organizations.map((org) => (
                                    <div
                                        key={org.id}
                                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{org.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {org.user.email}
                                            </p>
                                        </div>
                                        <Badge variant={
                                            org.status === 'APPROVED' ? 'default' :
                                                org.status === 'PENDING' ? 'secondary' :
                                                    org.status === 'REJECTED' ? 'destructive' : 'outline'
                                        }>
                                            {org.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Claims */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Claims</CardTitle>
                    <CardDescription>Latest food claims across the platform</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
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
                                            {claim.user.name} • {claim.foodListing.organization.name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-muted-foreground">
                                            Qty: {claim.quantity}
                                        </span>
                                        <Badge variant={
                                            claim.status === 'CLAIMED' ? 'secondary' :
                                                claim.status === 'COLLECTED' ? 'default' : 'outline'
                                        }>
                                            {claim.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Required Alert */}
            {!loading && dashboardData && dashboardData.stats.organizations.pending > 0 && (
                <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
                    <CardContent className="flex items-center gap-4 p-6">
                        <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
                        <div className="flex-1">
                            <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                                Action Required
                            </p>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                {dashboardData.stats.organizations.pending} organization{dashboardData.stats.organizations.pending !== 1 ? 's' : ''} awaiting approval
                            </p>
                        </div>
                        <Button asChild>
                            <Link href="/dashboard/admin/organizations">
                                Review Now
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
