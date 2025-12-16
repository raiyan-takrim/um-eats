'use client';

import { useSession } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import { getListing } from '@/actions/organization';

interface FoodListing {
    id: string;
    title: string;
    description: string;
    category: string;
    quantity: number;
    unit: string;
    status: string;
    availableFrom: Date | string;
    availableUntil: Date | string;
    pickupLocation: string;
    isVegetarian: boolean;
    isVegan: boolean;
    isHalal: boolean;
    allergens: string[];
    tags: string[];
    images: string[];
    createdAt: Date | string;
    claims: Array<{
        id: string;
        quantity: number;
        status: string;
        claimedAt: Date | string;
        user: {
            name: string;
            email: string;
        };
    }>;
}

export default function ViewListingPage({ params }: { params: Promise<{ id: string }> }) {
    const { data, isPending } = useSession();
    const router = useRouter();
    const [listing, setListing] = useState<FoodListing | null>(null);
    const [loading, setLoading] = useState(true);
    const [listingId, setListingId] = useState<string>('');

    useEffect(() => {
        params.then((p) => setListingId(p.id));
    }, [params]);

    useEffect(() => {
        if (!isPending && (!data?.user || data.user.role !== 'ORGANIZATION')) {
            router.push('/');
        }
    }, [data, isPending, router]);

    useEffect(() => {
        if (data?.user && listingId) {
            fetchListing();
        }
    }, [data, listingId]);

    const fetchListing = async () => {
        try {
            const { listing: fetchedListing } = await getListing(listingId);
            setListing(fetchedListing);
        } catch (error) {
            console.error('Failed to fetch listing:', error);
            router.push('/dashboard/organization/listings');
        } finally {
            setLoading(false);
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

    if (isPending || loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!listing) {
        return null;
    }

    const totalClaimed = listing.claims.reduce((sum, claim) => sum + claim.quantity, 0);
    const remaining = listing.quantity - totalClaimed;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/organization/listings">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{listing.title}</h1>
                    <p className="text-muted-foreground">{listing.category}</p>
                </div>
                {getStatusBadge(listing.status)}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{listing.description}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dietary Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {listing.isVegetarian && (
                                    <Badge variant="outline">🥬 Vegetarian</Badge>
                                )}
                                {listing.isVegan && (
                                    <Badge variant="outline">🌱 Vegan</Badge>
                                )}
                                {listing.isHalal && (
                                    <Badge variant="outline">☪️ Halal</Badge>
                                )}
                            </div>

                            {listing.allergens.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium mb-2">Allergens:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {listing.allergens.map((allergen, i) => (
                                            <Badge key={i} variant="destructive">{allergen}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {listing.tags.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium mb-2">Tags:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {listing.tags.map((tag, i) => (
                                            <Badge key={i} variant="secondary">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {listing.claims.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Claims ({listing.claims.length})</CardTitle>
                                <CardDescription>Students who have claimed this food</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {listing.claims.map((claim) => (
                                        <div key={claim.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                            <div className="flex-1">
                                                <p className="font-medium">{claim.user.name}</p>
                                                <p className="text-sm text-muted-foreground">{claim.user.email}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{claim.quantity} {listing.unit}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(claim.claimedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Quantity</p>
                                <p className="text-2xl font-bold">
                                    {remaining} / {listing.quantity} {listing.unit}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {totalClaimed} claimed
                                </p>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex items-start gap-3 mb-3">
                                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Available From</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(listing.availableFrom).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Available Until</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(listing.availableUntil).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Pickup Location</p>
                                        <p className="text-sm text-muted-foreground">
                                            {listing.pickupLocation}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-2">
                        <Button asChild className="w-full">
                            <Link href={`/dashboard/organization/listings/${listing.id}/edit`}>
                                Edit Listing
                            </Link>
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/dashboard/organization/listings">
                                Back to Listings
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
