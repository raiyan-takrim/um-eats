'use client';

import { useSession } from '@/lib/use-auth';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getListing, updateListing } from '@/actions/organization';
import { FoodListingForm, FoodListingFormValues } from '@/components/forms/food-listing-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';



export default function EditFoodListingPage() {
    const { data, isPending } = useSession();
    const router = useRouter();
    const params = useParams();
    const listingId = params.id as string;
    const [loading, setLoading] = useState(true);
    const [initialValues, setInitialValues] = useState<Partial<FoodListingFormValues> | null>(null);

    useEffect(() => {
        if (!isPending && (!data?.user || data.user.role !== 'ORGANIZATION')) {
            router.push('/');
        }
    }, [data, isPending, router]);

    useEffect(() => {
        if (data?.user && listingId) {
            loadListing();
        }
    }, [data, listingId]);

    const loadListing = async () => {
        try {
            const { listing } = await getListing(listingId);

            setInitialValues({
                title: listing.title,
                description: listing.description,
                category: listing.category,
                quantity: listing.quantity,
                unit: listing.unit,
                availableFrom: new Date(listing.availableFrom),
                availableUntil: new Date(listing.availableUntil),
                pickupLocation: listing.pickupLocation,
                isVegetarian: listing.isVegetarian,
                isVegan: listing.isVegan,
                isHalal: listing.isHalal,
                allergens: Array.isArray(listing.allergens) ? listing.allergens.join(', ') : '',
                tags: listing.tags?.join(', ') || '',
            });
        } catch (error) {
            console.error('Failed to load listing:', error);
            router.push('/dashboard/organization/listings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: FoodListingFormValues) => {
        await updateListing(listingId, {
            ...values,
            availableFrom: values.availableFrom,
            availableUntil: values.availableUntil,
            allergens: values.allergens || '',
            tags: values.tags || '',
        });
        router.push('/dashboard/organization/listings');
    };

    if (isPending || loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!data?.user || data.user.role !== 'ORGANIZATION') {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/organization/listings">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Edit Food Listing</h1>
                    <p className="text-muted-foreground">Update your food listing details</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Listing Information</CardTitle>
                    <CardDescription>Update the details of your food listing</CardDescription>
                </CardHeader>
                <CardContent>
                    {initialValues && (
                        <FoodListingForm
                            key={listingId}
                            initialValues={initialValues}
                            onSubmit={handleSubmit}
                            onCancel={() => router.push('/dashboard/organization/listings')}
                            submitLabel="Update Listing"
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

