'use client';

import { useSession } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Package, MapPin, X } from 'lucide-react';
import { markClaimAsCollected, getStudentClaims } from '@/actions/student';
import { cancelOrder } from '@/actions/organization';
import { toast } from 'sonner';
import { OrderStatusSteps } from '@/components/order-status-steps';
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
    estimatedImpactPoints: number;
    actualImpactPoints?: number | null;
    foodListing: {
        title: string;
        category: string;
        unit: string;
        pickupLocation: string;
        organization: {
            name: string;
        };
    };
}

export default function StudentClaimsPage() {
    const { data, isPending } = useSession();
    const router = useRouter();
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [actioningIds, setActioningIds] = useState<Set<string>>(new Set());
    const [cancelReason, setCancelReason] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isPending && (!data?.user || data.user.role !== 'STUDENT')) {
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
            const result = await getStudentClaims();
            setClaims(result.claims as any || []);
        } catch (error) {
            console.error('Failed to fetch claims:', error);
            toast.error('Failed to load your orders');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsCollected = async (claimId: string) => {
        setActioningIds(prev => new Set(prev).add(claimId));
        try {
            const result = await markClaimAsCollected(claimId);
            toast.success(`Collected! You earned ${result.impactPoints.toFixed(1)} impact points! 🎉`);
            await fetchClaims();
        } catch (error: any) {
            toast.error(error.message || 'Failed to mark as collected');
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
            await cancelOrder(claimId, cancelReason[claimId] || 'Cancelled by student');
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

    const getStatusInfo = (status: ClaimStatus) => {
        const info: Record<ClaimStatus, { color: string, label: string, description: string }> = {
            PENDING: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                label: 'Pending Confirmation',
                description: 'Waiting for organization to confirm your order'
            },
            CONFIRMED: {
                color: 'bg-blue-100 text-blue-800 border-blue-300',
                label: 'Confirmed',
                description: 'Organization is preparing your food'
            },
            READY: {
                color: 'bg-green-100 text-green-800 border-green-300',
                label: 'Ready for Pickup',
                description: 'Your food is ready! Please collect it'
            },
            PICKED_UP: {
                color: 'bg-gray-100 text-gray-800 border-gray-300',
                label: 'Collected',
                description: 'Order completed successfully'
            },
            CANCELLED: {
                color: 'bg-red-100 text-red-800 border-red-300',
                label: 'Cancelled',
                description: 'This order was cancelled'
            },
            NO_SHOW: {
                color: 'bg-red-100 text-red-800 border-red-300',
                label: 'No Show',
                description: 'Marked as no-show by organization'
            },
        };
        return info[status];
    };

    // Group claims by status
    const activeClaims = claims.filter(c => ['PENDING', 'CONFIRMED', 'READY'].includes(c.status));
    const completedClaims = claims.filter(c => c.status === 'PICKED_UP');
    const cancelledClaims = claims.filter(c => ['CANCELLED', 'NO_SHOW'].includes(c.status));

    if (isPending || loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">My Orders</h1>
                <p className="mt-2 text-muted-foreground">
                    Track your food orders in real-time
                </p>
            </div>

            {/* Active Orders */}
            {activeClaims.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Active Orders</h2>
                    {activeClaims.map((claim) => {
                        const statusInfo = getStatusInfo(claim.status);
                        return (
                            <Card key={claim.id} className="border-2">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <CardTitle>{claim.foodListing.title}</CardTitle>
                                            <CardDescription>
                                                {claim.foodListing.organization.name}
                                            </CardDescription>
                                        </div>
                                        <Badge className={statusInfo.color}>
                                            {statusInfo.label}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Order Status Steps */}
                                    <OrderStatusSteps currentStatus={claim.status} />

                                    {/* Order Details */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Category</p>
                                            <p className="font-medium">{claim.foodListing.category}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Unit</p>
                                            <p className="font-medium">1 {claim.foodListing.unit}</p>
                                        </div>
                                    </div>

                                    {/* Pickup Location */}
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-muted-foreground">Pickup Location</p>
                                            <p className="font-medium">{claim.foodListing.pickupLocation}</p>
                                        </div>
                                    </div>

                                    {/* Timestamps */}
                                    <div className="space-y-2 text-xs text-muted-foreground border-t pt-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3 w-3" />
                                            <span>Ordered: {new Date(claim.claimedAt).toLocaleString()}</span>
                                        </div>
                                        {claim.confirmedAt && (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-3 w-3 text-blue-600" />
                                                <span>Confirmed: {new Date(claim.confirmedAt).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {claim.readyAt && (
                                            <div className="flex items-center gap-2">
                                                <Package className="h-3 w-3 text-green-600" />
                                                <span>Ready: {new Date(claim.readyAt).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 border-t pt-4">
                                        {claim.status === 'READY' && (
                                            <Button
                                                onClick={() => handleMarkAsCollected(claim.id)}
                                                disabled={actioningIds.has(claim.id)}
                                                className="flex-1"
                                            >
                                                {actioningIds.has(claim.id) ? (
                                                    'Processing...'
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                                        Mark as Collected
                                                    </>
                                                )}
                                            </Button>
                                        )}

                                        {['PENDING', 'CONFIRMED'].includes(claim.status) && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1"
                                                        disabled={actioningIds.has(claim.id)}
                                                    >
                                                        <X className="h-4 w-4 mr-2" />
                                                        Cancel Order
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to cancel this order? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <div className="py-4">
                                                        <label className="text-sm font-medium mb-2 block">
                                                            Reason (optional)
                                                        </label>
                                                        <Textarea
                                                            placeholder="Let the organization know why you're cancelling..."
                                                            value={cancelReason[claim.id] || ''}
                                                            onChange={(e) => setCancelReason(prev => ({
                                                                ...prev,
                                                                [claim.id]: e.target.value
                                                            }))}
                                                        />
                                                    </div>
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
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Completed Orders */}
            {completedClaims.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Completed Orders</h2>
                    {completedClaims.map((claim) => (
                        <Card key={claim.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <CardTitle>{claim.foodListing.title}</CardTitle>
                                        <CardDescription>
                                            {claim.foodListing.organization.name}
                                        </CardDescription>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Collected
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    Collected: {new Date(claim.collectedAt!).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                    🌱 Impact Points Earned: {claim.actualImpactPoints?.toFixed(1)}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Cancelled Orders */}
            {cancelledClaims.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Cancelled Orders</h2>
                    {cancelledClaims.map((claim) => (
                        <Card key={claim.id} className="opacity-60">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <CardTitle>{claim.foodListing.title}</CardTitle>
                                        <CardDescription>
                                            {claim.foodListing.organization.name}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="bg-red-50 text-red-600">
                                        {claim.status === 'CANCELLED' ? 'Cancelled' : 'No Show'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4 inline mr-1" />
                                    {new Date(claim.cancelledAt!).toLocaleString()}
                                </div>
                                {claim.cancellationReason && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Reason: </span>
                                        <span>{claim.cancellationReason}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {claims.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">No orders yet</p>
                        <p className="text-sm text-muted-foreground mb-4">Start saving food and making an impact!</p>
                        <Button asChild>
                            <a href="/dashboard/student/browse">Browse Food</a>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
