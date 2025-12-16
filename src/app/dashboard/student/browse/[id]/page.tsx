'use client';

import { useSession } from '@/lib/use-auth';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ArrowLeft, MapPin, Calendar, Package, Clock, Building2, Phone, Mail, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { format } from 'date-fns';
import { getListingDetail, claimFood } from '@/actions/student';

interface Listing {
    id: string;
    title: string;
    description: string;
    category: string;
    quantity: number;
    unit: string;
    availableFrom: string;
    availableUntil: string;
    pickupLocation: string;
    status: string;
    isVegetarian: boolean;
    isVegan: boolean;
    isHalal: boolean;
    allergens: string[];
    tags: string[];
    remainingQuantity: number;
    organization: {
        name: string;
        type: string;
        address: string;
        email: string;
        phone: string;
    };
    claims: Array<{
        id: string;
        quantity: number;
        status: string;
        claimedAt: string;
    }>;
}

export default function FoodDetailPage() {
    const { data, isPending } = useSession();
    const router = useRouter();
    const params = useParams();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);
    const [claimQuantity, setClaimQuantity] = useState(1);
    const [claimNotes, setClaimNotes] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!isPending && (!data?.user || data.user.role !== 'STUDENT')) {
            router.push('/');
        }
    }, [data, isPending, router]);

    useEffect(() => {
        fetchListing();
    }, [params.id]);

    const fetchListing = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getListingDetail(params.id as string);
            setListing(data.listing as any);
        } catch (error: any) {
            console.error('Error fetching listing:', error);
            setError(error.message || 'Failed to load listing');
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        if (!listing) return;

        if (claimQuantity < 1) {
            setError('Quantity must be at least 1');
            return;
        }

        if (claimQuantity > listing.remainingQuantity) {
            setError(`Only ${listing.remainingQuantity} ${listing.unit} available`);
            return;
        }

        try {
            setClaiming(true);
            setError('');
            setSuccess('');

            await claimFood(params.id as string, claimQuantity);
            setSuccess('Food claimed successfully! 🎉');
            setClaimQuantity(1);
            setClaimNotes('');

            // Redirect to claims page after 5 seconds
            setTimeout(() => {
                router.push('/dashboard/student/claims');
            }, 5000);

            // Refresh listing to show updated claim
            fetchListing();
        } catch (error: any) {
            console.error('Error claiming food:', error);
            setError(error.message || 'Failed to claim food');
        } finally {
            setClaiming(false);
        }
    };

    if (isPending || !data?.user || data.user.role !== 'STUDENT') {
        return null;
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" asChild>
                    <Link href="/dashboard/student/browse">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Browse
                    </Link>
                </Button>
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading listing...</p>
                </div>
            </div>
        );
    }

    if (error && !listing) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" asChild>
                    <Link href="/dashboard/student/browse">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Browse
                    </Link>
                </Button>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!listing) {
        return null;
    }

    const hasActiveClaim = listing.claims.some(
        (claim) => claim.status === 'PENDING' || claim.status === 'CONFIRMED'
    );

    return (
        <div className="space-y-6">
            <Button variant="ghost" asChild>
                <Link href="/dashboard/student/browse">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Browse
                </Link>
            </Button>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <CardTitle className="text-3xl">{listing.title}</CardTitle>
                                    <CardDescription className="text-base">
                                        {listing.description}
                                    </CardDescription>
                                </div>
                                <Badge
                                    variant={listing.status === 'AVAILABLE' ? 'default' : 'secondary'}
                                    className="text-sm"
                                >
                                    {listing.status}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Dietary Information */}
                            {(listing.isVegetarian || listing.isVegan || listing.isHalal) && (
                                <div>
                                    <h3 className="font-semibold mb-2">Dietary Information</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {listing.isVegetarian && <Badge variant="outline">Vegetarian</Badge>}
                                        {listing.isVegan && <Badge variant="outline">Vegan</Badge>}
                                        {listing.isHalal && <Badge variant="outline">Halal</Badge>}
                                    </div>
                                </div>
                            )}

                            {/* Allergens */}
                            {listing.allergens && listing.allergens.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2 text-orange-600">Allergen Warning</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {listing.allergens.map((allergen, index) => (
                                            <Badge key={index} variant="destructive">
                                                {allergen}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {listing.tags && listing.tags.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {listing.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Separator />

                            {/* Details Grid */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-start gap-3">
                                    <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Quantity Available</p>
                                        <p className="text-sm text-muted-foreground">
                                            {listing.remainingQuantity} {listing.unit} (of {listing.quantity})
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Category</p>
                                        <p className="text-sm text-muted-foreground">{listing.category.replace(/_/g, ' ')}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Available Until</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(listing.availableUntil), 'PPp')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Pickup Location</p>
                                        <p className="text-sm text-muted-foreground">{listing.pickupLocation}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Organization Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Organization Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="font-semibold">{listing.organization.name}</p>
                                <p className="text-sm text-muted-foreground">{listing.organization.type}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{listing.organization.address}</span>
                            </div>
                            {listing.organization.email && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <a
                                        href={`mailto:${listing.organization.email}`}
                                        className="text-primary hover:underline"
                                    >
                                        {listing.organization.email}
                                    </a>
                                </div>
                            )}
                            {listing.organization.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <a
                                        href={`tel:${listing.organization.phone}`}
                                        className="text-primary hover:underline"
                                    >
                                        {listing.organization.phone}
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Existing Claims */}
                    {listing.claims.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Claims</CardTitle>
                                <CardDescription>Your claim history for this listing</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {listing.claims.map((claim) => (
                                    <div key={claim.id} className="flex items-start justify-between p-3 border rounded-lg">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        claim.status === 'CONFIRMED'
                                                            ? 'default'
                                                            : claim.status === 'PENDING'
                                                                ? 'secondary'
                                                                : 'outline'
                                                    }
                                                >
                                                    {claim.status}
                                                </Badge>
                                                <span className="text-sm">
                                                    {claim.quantity} {listing.unit}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Claimed {format(new Date(claim.claimedAt), 'PPp')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Claim Form Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Claim This Food</CardTitle>
                            <CardDescription>Request to collect this food item</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {success && (
                                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="space-y-2">
                                        <p className="font-semibold text-green-900 dark:text-green-100">{success}</p>
                                        <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                                            <p className="font-medium">📍 Next Steps:</p>
                                            <ol className="list-decimal list-inside space-y-1 ml-2">
                                                <li>Visit the organization to pick up your food</li>
                                                <li>After pickup, go to <a href="/dashboard/student/claims" className="underline font-semibold">My Claims</a></li>
                                                <li>Click "Mark as Collected" to earn impact points</li>
                                            </ol>
                                            <p className="text-xs mt-2">💡 Redirecting to My Claims in 5 seconds...</p>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {hasActiveClaim && (
                                <Alert>
                                    <AlertDescription>
                                        You already have an active claim for this listing.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="quantity">
                                    Quantity ({listing.unit})
                                </Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    max={listing.remainingQuantity}
                                    value={claimQuantity}
                                    onChange={(e) => setClaimQuantity(parseInt(e.target.value) || 1)}
                                    disabled={hasActiveClaim || listing.remainingQuantity === 0}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Maximum: {listing.remainingQuantity} {listing.unit}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Any special requests or pickup preferences..."
                                    value={claimNotes}
                                    onChange={(e) => setClaimNotes(e.target.value)}
                                    disabled={hasActiveClaim}
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={handleClaim}
                                disabled={
                                    claiming ||
                                    hasActiveClaim ||
                                    listing.remainingQuantity === 0 ||
                                    listing.status !== 'AVAILABLE'
                                }
                                className="w-full"
                            >
                                {claiming
                                    ? 'Submitting...'
                                    : hasActiveClaim
                                        ? 'Already Claimed'
                                        : listing.remainingQuantity === 0
                                            ? 'Not Available'
                                            : 'Submit Claim'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
