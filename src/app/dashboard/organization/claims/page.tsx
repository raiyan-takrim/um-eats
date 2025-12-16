'use client';

import { useSession } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Package, User, Phone, Check, AlertCircle, X } from 'lucide-react';
import { markClaimAsCollected } from '@/actions/student';
import { getOrganizationClaims, confirmOrder, markOrderReady, markNoShow, cancelOrder } from '@/actions/organization';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

type ClaimStatus = 'PENDING' | 'CONFIRMED' | 'READY' | 'PICKED_UP' | 'CANCELLED' | 'NO_SHOW';

interface Claim {
    id: string;
    status: ClaimStatus;
    itemStatus: string;
    claimedAt: Date;
    confirmedAt?: Date | null;
    readyAt?: Date | null;
    collectedAt?: Date | null;
    cancelledAt?: Date | null;
    cancellationReason?: string | null;
    cancelledBy?: string | null;
    estimatedImpactPoints: number;
    actualImpactPoints?: number | null;
    user: {
        name: string;
        email: string;
        phone?: string | null;
    };
    foodListing: {
        title: string;
        category: string;
        unit: string;
        pickupLocation: string;
    };
}

export default function OrganizationClaimsPage() {
    const { data, isPending } = useSession();
    const router = useRouter();
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [actioningIds, setActioningIds] = useState<Set<string>>(new Set());
    const [cancelReason, setCancelReason] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isPending && (!data?.user || data.user.role !== 'ORGANIZATION')) {
            router.push('/');
        }
    }, [data, isPending, router]);

    useEffect(() => {
        if (data?.user) {
            fetchClaims();
        }
    }, [data]);

    const fetchClaims = async () => {
        try {
            const result = await getOrganizationClaims();
            setClaims(result.claims || []);
        } catch (error) {
            console.error('Failed to fetch claims:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrder = async (claimId: string) => {
        setActioningIds(prev => new Set(prev).add(claimId));
        try {
            await confirmOrder(claimId);
            toast.success('Order confirmed! Student has been notified.');
            await fetchClaims();
        } catch (error: any) {
            toast.error(error.message || 'Failed to confirm order');
        } finally {
            setActioningIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(claimId);
                return newSet;
            });
        }
    };

    const handleMarkReady = async (claimId: string) => {
        setActioningIds(prev => new Set(prev).add(claimId));
        try {
            await markOrderReady(claimId);
            toast.success('Marked as ready! Student has been notified to collect.');
            await fetchClaims();
        } catch (error: any) {
            toast.error(error.message || 'Failed to mark as ready');
        } finally {
            setActioningIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(claimId);
                return newSet;
            });
        }
    };

    const handleConfirmCollection = async (claimId: string) => {
        setActioningIds(prev => new Set(prev).add(claimId));
        try {
            const result = await markClaimAsCollected(claimId);
            toast.success(`Order completed! You earned ${result.impactPoints.toFixed(1)} impact points! 🎉`);
            await fetchClaims();
        } catch (error: any) {
            toast.error(error.message || 'Failed to confirm collection');
        } finally {
            setActioningIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(claimId);
                return newSet;
            });
        }
    };

    const handleMarkNoShow = async (claimId: string) => {
        setActioningIds(prev => new Set(prev).add(claimId));
        try {
            await markNoShow(claimId);
            toast.success('Marked as no-show. Item is now available for others.');
            await fetchClaims();
        } catch (error: any) {
            toast.error(error.message || 'Failed to mark as no-show');
        } finally {
            setActioningIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(claimId);
                return newSet;
            });
        }
    };

    const handleCancelOrder = async (claimId: string) => {
        setActioningIds(prev => new Set(prev).add(claimId));
        try {
            await cancelOrder(claimId, cancelReason[claimId] || 'Cancelled by organization');
            toast.success('Order cancelled');
            await fetchClaims();
        } catch (error: any) {
            toast.error(error.message || 'Failed to cancel order');
        } finally {
            setActioningIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(claimId);
                return newSet;
            });
        }
    };

    const getStatusBadge = (status: ClaimStatus) => {
        const badges: Record<ClaimStatus, { color: string, label: string }> = {
            PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'New Order' },
            CONFIRMED: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Preparing' },
            READY: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Ready' },
            PICKED_UP: { color: 'bg-gray-100 text-gray-800 border-gray-300', label: 'Completed' },
            CANCELLED: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Cancelled' },
            NO_SHOW: { color: 'bg-red-100 text-red-800 border-red-300', label: 'No Show' },
        };
        const badge = badges[status];
        return <Badge className={badge.color}>{badge.label}</Badge>;
    };

    if (isPending || loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    // Group claims by status
    const newOrders = claims.filter(c => c.status === 'PENDING');
    const preparingOrders = claims.filter(c => c.status === 'CONFIRMED');
    const readyOrders = claims.filter(c => c.status === 'READY');
    const completedOrders = claims.filter(c => c.status === 'PICKED_UP');
    const problemOrders = claims.filter(c => ['CANCELLED', 'NO_SHOW'].includes(c.status));

    const renderClaimCard = (claim: Claim, actions: React.ReactNode) => (
        <Card key={claim.id}>
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{claim.foodListing.title}</CardTitle>
                        <CardDescription className="mt-1">
                            1 {claim.foodListing.unit} • Category: {claim.foodListing.category}
                        </CardDescription>
                    </div>
                    {getStatusBadge(claim.status)}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Student Info */}
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                        <p className="font-medium text-sm">{claim.user.name}</p>
                        <p className="text-xs text-muted-foreground">{claim.user.email}</p>
                        {claim.user.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" />
                                {claim.user.phone}
                            </p>
                        )}
                    </div>
                </div>

                {/* Timeline */}
                <div className="space-y-1.5 text-xs text-muted-foreground border-t pt-3">
                    <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Ordered: {format(new Date(claim.claimedAt), 'PPp')}
                    </div>
                    {claim.confirmedAt && (
                        <div className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-blue-600" />
                            Confirmed: {format(new Date(claim.confirmedAt), 'PPp')}
                        </div>
                    )}
                    {claim.readyAt && (
                        <div className="flex items-center gap-2">
                            <Package className="h-3 w-3 text-green-600" />
                            Ready: {format(new Date(claim.readyAt), 'PPp')}
                        </div>
                    )}
                    {claim.collectedAt && (
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            Collected: {format(new Date(claim.collectedAt), 'PPp')}
                        </div>
                    )}
                    {claim.cancelledAt && (
                        <div className="flex items-center gap-2">
                            <X className="h-3 w-3 text-red-600" />
                            Cancelled: {format(new Date(claim.cancelledAt), 'PPp')}
                            {claim.cancelledBy && <span>by {claim.cancelledBy}</span>}
                        </div>
                    )}
                </div>

                {/* Actions */}
                {actions && <div className="border-t pt-4">{actions}</div>}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Order Management</h1>
                <p className="mt-2 text-muted-foreground">
                    Manage incoming orders and track progress
                </p>
            </div>

            {/* New Orders (PENDING) */}
            {newOrders.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <h2 className="text-xl font-semibold">New Orders ({newOrders.length})</h2>
                    </div>
                    <div className="grid gap-4">
                        {newOrders.map((claim) =>
                            renderClaimCard(
                                claim,
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleConfirmOrder(claim.id)}
                                        disabled={actioningIds.has(claim.id)}
                                        className="flex-1"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Confirm Order
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" disabled={actioningIds.has(claim.id)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    The student will be notified and the item will be available again.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <Textarea
                                                placeholder="Reason for cancellation..."
                                                value={cancelReason[claim.id] || ''}
                                                onChange={(e) =>
                                                    setCancelReason((prev) => ({ ...prev, [claim.id]: e.target.value }))
                                                }
                                            />
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleCancelOrder(claim.id)}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    Cancel Order
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}

            {/* Preparing Orders (CONFIRMED) */}
            {preparingOrders.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <h2 className="text-xl font-semibold">Preparing ({preparingOrders.length})</h2>
                    </div>
                    <div className="grid gap-4">
                        {preparingOrders.map((claim) =>
                            renderClaimCard(
                                claim,
                                <Button
                                    onClick={() => handleMarkReady(claim.id)}
                                    disabled={actioningIds.has(claim.id)}
                                    className="w-full"
                                >
                                    <Package className="h-4 w-4 mr-2" />
                                    Mark as Ready
                                </Button>
                            )
                        )}
                    </div>
                </div>
            )}

            {/* Ready for Pickup (READY) */}
            {readyOrders.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-green-600" />
                        <h2 className="text-xl font-semibold">Ready for Pickup ({readyOrders.length})</h2>
                    </div>
                    <div className="grid gap-4">
                        {readyOrders.map((claim) =>
                            renderClaimCard(
                                claim,
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleConfirmCollection(claim.id)}
                                        disabled={actioningIds.has(claim.id)}
                                        className="flex-1"
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Student Collected
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" disabled={actioningIds.has(claim.id)}>
                                                No Show
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Mark as No-Show?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will release the item back for others to claim.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleMarkNoShow(claim.id)}>
                                                    Confirm No-Show
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}

            {/* Completed Orders */}
            {completedOrders.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-gray-600" />
                        <h2 className="text-xl font-semibold">Completed ({completedOrders.length})</h2>
                    </div>
                    <div className="grid gap-4">
                        {completedOrders.map((claim) =>
                            renderClaimCard(
                                claim,
                                <div className="text-sm font-medium text-primary">
                                    🌱 Impact Points Earned: {claim.actualImpactPoints?.toFixed(1)}
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}

            {/* Problem Orders */}
            {problemOrders.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <X className="h-5 w-5 text-red-600" />
                        <h2 className="text-xl font-semibold">Cancelled / No-Show ({problemOrders.length})</h2>
                    </div>
                    <div className="grid gap-4">
                        {problemOrders.map((claim) =>
                            renderClaimCard(
                                claim,
                                claim.cancellationReason ? (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Reason: </span>
                                        <span>{claim.cancellationReason}</span>
                                    </div>
                                ) : null
                            )
                        )}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {claims.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">No orders yet</p>
                        <p className="text-sm text-muted-foreground">Orders will appear here when students claim your listings</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
