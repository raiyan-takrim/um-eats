'use client';

import { useSession } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Package,
    Clock,
    CheckCircle2,
    ArrowRight,
    Leaf,
    TrendingUp,
    MapPin
} from 'lucide-react';
import Link from 'next/link';
import { checkUserBanStatus } from '@/lib/check-ban';
import { BannedUserPage } from '@/components/banned-user-page';
import { getSystemSettings } from '@/actions/admin';
import { browseListings, getStudentClaims } from '@/actions/student';
import { Skeleton } from '@/components/ui/skeleton';

type ClaimStatus = 'PENDING' | 'CONFIRMED' | 'READY' | 'PICKED_UP' | 'CANCELLED' | 'NO_SHOW';

interface Claim {
    id: string;
    status: ClaimStatus;
    claimedAt: Date;
    actualImpactPoints?: number | null;
    foodListing: {
        title: string;
        category: string;
        organization: {
            name: string;
        };
    };
}

interface Listing {
    id: string;
    title: string;
    category: string;
    remainingQuantity: number;
    availableUntil: Date;
    pickupLocation: string;
    organization: {
        name: string;
    };
}

export default function StudentDashboardPage() {
    const { data, isPending } = useSession();
    const router = useRouter();
    const [banStatus, setBanStatus] = useState<{ isBanned: boolean; bannedReason: string | null; bannedAt: Date | null } | null>(null);
    const [adminEmail, setAdminEmail] = useState('admin@um.edu.my');
    const [loading, setLoading] = useState(true);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [availableListings, setAvailableListings] = useState<Listing[]>([]);
    const [stats, setStats] = useState({
        activeClaims: 0,
        completedOrders: 0,
        totalImpact: 0,
    });

    useEffect(() => {
        if (!isPending && (!data?.user || data.user.role !== 'STUDENT')) {
            router.push('/');
        }
    }, [data, isPending, router]);

    useEffect(() => {
        if (data?.user) {
            checkBanStatus();
            fetchAdminEmail();
            fetchDashboardData();
        }
    }, [data]);

    const checkBanStatus = async () => {
        if (!data?.user) return;
        const status = await checkUserBanStatus(data.user.id);
        setBanStatus(status);
        setLoading(false);
    };

    const fetchAdminEmail = async () => {
        try {
            const settings = await getSystemSettings();
            setAdminEmail(settings.admin_email || 'admin@um.edu.my');
        } catch (error) {
            console.error('Failed to fetch admin email');
        }
    };

    const fetchDashboardData = async () => {
        try {
            // Fetch claims
            const claimsResult = await getStudentClaims();
            const claimsData = claimsResult.claims as any[] || [];
            setClaims(claimsData.slice(0, 5));

            // Calculate stats
            const active = claimsData.filter((c: any) => ['PENDING', 'CONFIRMED', 'READY'].includes(c.status)).length;
            const completed = claimsData.filter((c: any) => c.status === 'PICKED_UP').length;
            const impact = claimsData
                .filter((c: any) => c.status === 'PICKED_UP')
                .reduce((sum: number, c: any) => sum + (c.actualImpactPoints || 0), 0);

            setStats({
                activeClaims: active,
                completedOrders: completed,
                totalImpact: impact,
            });

            // Fetch available listings
            const listingsResult = await browseListings();
            setAvailableListings((listingsResult.listings as any[] || []).slice(0, 3));
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        }
    };

    const getStatusColor = (status: ClaimStatus) => {
        const colors: Record<ClaimStatus, string> = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            CONFIRMED: 'bg-blue-100 text-blue-800',
            READY: 'bg-green-100 text-green-800',
            PICKED_UP: 'bg-gray-100 text-gray-800',
            CANCELLED: 'bg-red-100 text-red-800',
            NO_SHOW: 'bg-red-100 text-red-800',
        };
        return colors[status];
    };

    const getStatusLabel = (status: ClaimStatus) => {
        const labels: Record<ClaimStatus, string> = {
            PENDING: 'Pending',
            CONFIRMED: 'Confirmed',
            READY: 'Ready',
            PICKED_UP: 'Collected',
            CANCELLED: 'Cancelled',
            NO_SHOW: 'No Show',
        };
        return labels[status];
    };

    if (isPending || loading || !data?.user || data.user.role !== 'STUDENT') {
        return <DashboardSkeleton />;
    }

    if (banStatus?.isBanned) {
        return (
            <BannedUserPage
                reason={banStatus.bannedReason || 'No reason provided'}
                bannedAt={banStatus.bannedAt || new Date()}
                adminEmail={adminEmail}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Welcome back, {data.user.name?.split(' ')[0]}
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/student/browse">
                        Browse Food
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Orders
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeClaims}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Pending & confirmed orders
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Completed
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completedOrders}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Successfully collected
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Impact Points
                        </CardTitle>
                        <Leaf className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalImpact.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Environmental contribution
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/dashboard/student/claims">
                                    View All
                                    <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {claims.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Package className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground">No orders yet</p>
                                <Button variant="link" size="sm" asChild className="mt-2">
                                    <Link href="/dashboard/student/browse">Start browsing food</Link>
                                </Button>
                            </div>
                        ) : (
                            claims.map((claim) => (
                                <div key={claim.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium text-sm truncate">
                                                {claim.foodListing.title}
                                            </p>
                                            <Badge variant="outline" className={`text-xs ${getStatusColor(claim.status)}`}>
                                                {getStatusLabel(claim.status)}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {claim.foodListing.organization.name}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(claim.claimedAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            {claim.status === 'PICKED_UP' && claim.actualImpactPoints && (
                                                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3" />
                                                    {claim.actualImpactPoints.toFixed(1)} pts
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Available Now */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold">Available Now</CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/dashboard/student/browse">
                                    Browse All
                                    <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {availableListings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Package className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground">No food available right now</p>
                                <p className="text-xs text-muted-foreground mt-1">Check back later</p>
                            </div>
                        ) : (
                            availableListings.map((listing) => (
                                <Link
                                    key={listing.id}
                                    href={`/dashboard/student/browse/${listing.id}`}
                                    className="block"
                                >
                                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-sm truncate">
                                                    {listing.title}
                                                </p>
                                                <Badge variant="secondary" className="text-xs">
                                                    {listing.category}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate mb-2">
                                                {listing.organization.name}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Package className="h-3 w-3" />
                                                    {listing.remainingQuantity} left
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Until {new Date(listing.availableUntil).toLocaleTimeString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                {[1, 2].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[1, 2, 3].map((j) => (
                                <Skeleton key={j} className="h-20 w-full" />
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
