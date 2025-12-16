'use client';

import { useSession } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Clock, MapPin, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { getOrganizationStatus, getOrganizationListings, deleteListing } from '@/actions/organization';

interface FoodListing {
    id: string;
    title: string;
    description: string;
    category: string;
    quantity: number;
    unit: string;
    status: string;
    availableFrom: string;
    availableUntil: string;
    pickupLocation: string;
    isVegetarian: boolean;
    isVegan: boolean;
    isHalal: boolean;
    images: string[];
    createdAt: string;
    remainingQuantity?: number;
}

export default function FoodListingsPage() {
    const { data, isPending } = useSession();
    const router = useRouter();
    const [listings, setListings] = useState<FoodListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [orgStatus, setOrgStatus] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('active');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [listingToDelete, setListingToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (!isPending && (!data?.user || data.user.role !== 'ORGANIZATION')) {
            router.push('/');
        }
    }, [data, isPending, router]);

    useEffect(() => {
        if (data?.user) {
            checkOrgStatusAndFetchListings();
        }
    }, [data]);

    const checkOrgStatusAndFetchListings = async () => {
        try {
            // Check organization status
            const statusData = await getOrganizationStatus();

            if (!statusData.organization) {
                router.push('/dashboard/organization');
                return;
            }

            setOrgStatus(statusData.organization.status);

            if (statusData.organization.status !== 'APPROVED') {
                router.push('/dashboard/organization');
                return;
            }

            // Fetch listings
            const listingsData = await getOrganizationListings();
            setListings(listingsData.listings as any);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            router.push('/dashboard/organization');
        } finally {
            setLoading(false);
        }
    };

    const openDeleteDialog = (id: string) => {
        setListingToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!listingToDelete) return;

        try {
            await deleteListing(listingToDelete);
            setListings(listings.filter(l => l.id !== listingToDelete));
            toast.success('Listing deleted successfully');
            setDeleteDialogOpen(false);
            setListingToDelete(null);
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete listing');
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
            AVAILABLE: { variant: 'default', label: 'Available' },
            CLAIMED: { variant: 'secondary', label: 'Claimed' },
            COLLECTED: { variant: 'outline', label: 'Collected' },
            EXPIRED: { variant: 'destructive', label: 'Expired' },
        };
        const config = variants[status] || variants.AVAILABLE;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const isExpired = (listing: FoodListing) => {
        return new Date(listing.availableUntil) < new Date();
    };

    const getEffectiveStatus = (listing: FoodListing) => {
        if (isExpired(listing) && listing.status === 'AVAILABLE') {
            return 'EXPIRED';
        }
        return listing.status;
    };

    const activeListings = listings.filter(l => !isExpired(l));
    const expiredListings = listings.filter(l => isExpired(l));

    if (isPending || loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!data?.user || data.user.role !== 'ORGANIZATION' || orgStatus !== 'APPROVED') {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Food Listings</h1>
                    <p className="mt-2 text-muted-foreground">
                        Manage your available food items
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/organization/listings/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Listing
                    </Link>
                </Button>
            </div>

            {listings.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Plus className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Create your first food listing to start reducing waste
                        </p>
                        <Button asChild>
                            <Link href="/dashboard/organization/listings/create">
                                Create Listing
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList>
                        <TabsTrigger value="active">
                            Active ({activeListings.length})
                        </TabsTrigger>
                        <TabsTrigger value="expired">
                            Expired ({expiredListings.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="mt-6">
                        {activeListings.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <p className="text-muted-foreground">No active listings</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {activeListings.map((listing) => (
                                    <Card key={listing.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="line-clamp-1">{listing.title}</CardTitle>
                                                    <CardDescription className="mt-1">
                                                        {listing.category}
                                                    </CardDescription>
                                                </div>
                                                {getStatusBadge(getEffectiveStatus(listing))}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {listing.description}
                                            </p>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center text-muted-foreground">
                                                    <Clock className="mr-2 h-4 w-4" />
                                                    <span>
                                                        {new Date(listing.availableUntil).toLocaleDateString()} at{' '}
                                                        {new Date(listing.availableUntil).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-muted-foreground">
                                                    <MapPin className="mr-2 h-4 w-4" />
                                                    <span className="line-clamp-1">{listing.pickupLocation}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="text-lg font-semibold">
                                                    {listing.remainingQuantity !== undefined ? (
                                                        <>
                                                            <span className="text-green-600">{listing.remainingQuantity}</span>
                                                            <span className="text-muted-foreground">/{listing.quantity}</span>
                                                        </>
                                                    ) : (
                                                        <span>{listing.quantity}</span>
                                                    )} {listing.unit}
                                                </div>
                                                <div className="flex gap-1 ml-auto">
                                                    {listing.isVegetarian && (
                                                        <Badge variant="outline" className="text-xs">🥬 Veg</Badge>
                                                    )}
                                                    {listing.isVegan && (
                                                        <Badge variant="outline" className="text-xs">🌱 Vegan</Badge>
                                                    )}
                                                    {listing.isHalal && (
                                                        <Badge variant="outline" className="text-xs">☪️ Halal</Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button variant="outline" size="sm" className="flex-1" asChild>
                                                    <Link href={`/dashboard/organization/listings/${listing.id}`}>
                                                        <Eye className="mr-1 h-3 w-3" />
                                                        View
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" size="sm" className="flex-1" asChild>
                                                    <Link href={`/dashboard/organization/listings/${listing.id}/edit`}>
                                                        <Edit className="mr-1 h-3 w-3" />
                                                        Edit
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openDeleteDialog(listing.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="expired" className="mt-6">
                        {expiredListings.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <p className="text-muted-foreground">No expired listings</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {expiredListings.map((listing) => (
                                    <Card key={listing.id} className="opacity-75">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="line-clamp-1">{listing.title}</CardTitle>
                                                    <CardDescription className="mt-1">
                                                        {listing.category}
                                                    </CardDescription>
                                                </div>
                                                {getStatusBadge('EXPIRED')}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {listing.description}
                                            </p>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center text-muted-foreground">
                                                    <Clock className="mr-2 h-4 w-4" />
                                                    <span>
                                                        Expired on {new Date(listing.availableUntil).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-muted-foreground">
                                                    <MapPin className="mr-2 h-4 w-4" />
                                                    <span className="line-clamp-1">{listing.pickupLocation}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="text-lg font-semibold">
                                                    {listing.remainingQuantity !== undefined ? (
                                                        <>
                                                            <span className="text-muted-foreground">{listing.remainingQuantity}</span>
                                                            <span className="text-muted-foreground">/{listing.quantity}</span>
                                                        </>
                                                    ) : (
                                                        <span>{listing.quantity}</span>
                                                    )} {listing.unit}
                                                </div>
                                                <div className="flex gap-1 ml-auto">
                                                    {listing.isVegetarian && (
                                                        <Badge variant="outline" className="text-xs">🥬 Veg</Badge>
                                                    )}
                                                    {listing.isVegan && (
                                                        <Badge variant="outline" className="text-xs">🌱 Vegan</Badge>
                                                    )}
                                                    {listing.isHalal && (
                                                        <Badge variant="outline" className="text-xs">☪️ Halal</Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button variant="outline" size="sm" className="flex-1" asChild>
                                                    <Link href={`/dashboard/organization/listings/${listing.id}`}>
                                                        <Eye className="mr-1 h-3 w-3" />
                                                        View
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => openDeleteDialog(listing.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this listing? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
