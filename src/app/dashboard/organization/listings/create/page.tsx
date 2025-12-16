'use client';

import { useSession } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getOrganizationStatus, createListing } from '@/actions/organization';
import { FoodListingForm, FoodListingFormValues } from '@/components/forms/food-listing-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateFoodListingPage() {
    const { data, isPending } = useSession();
    const router = useRouter();
    const [orgStatus, setOrgStatus] = useState<string | null>(null);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [initialValues, setInitialValues] = useState<Partial<FoodListingFormValues>>({});

    useEffect(() => {
        if (!isPending && (!data?.user || data.user.role !== 'ORGANIZATION')) {
            router.push('/');
        }
    }, [data, isPending, router]);

    useEffect(() => {
        if (data?.user) {
            checkOrgStatus();
        }
    }, [data]);

    const checkOrgStatus = async () => {
        try {
            const statusData = await getOrganizationStatus();

            if (!statusData.organization) {
                toast.error('Organization not found');
                router.push('/dashboard/organization');
                return;
            }

            setOrgStatus(statusData.organization.status);

            // Set default pickup location to organization's address
            if (statusData.organization.address) {
                setInitialValues({
                    pickupLocation: statusData.organization.address,
                    isHalal: true,
                });
            }

            if (statusData.organization.status !== 'APPROVED') {
                router.push('/dashboard/organization');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to check organization status');
            router.push('/dashboard/organization');
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleSubmit = async (values: FoodListingFormValues) => {
        try {
            await createListing({
                ...values,
                availableFrom: values.availableFrom,
                availableUntil: values.availableUntil,
                allergens: values.allergens || '',
                tags: values.tags || '',
            });
            toast.success('Food listing created successfully!');
            router.push('/dashboard/organization/listings');
        } catch (error: any) {
            toast.error(error.message || 'Failed to create listing');
        }
    };

    if (isPending || checkingStatus) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!data?.user || data.user.role !== 'ORGANIZATION' || orgStatus !== 'APPROVED') {
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
                    <h1 className="text-3xl font-bold">Create Food Listing</h1>
                    <p className="text-muted-foreground">Add a new food item available for collection</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Listing Information</CardTitle>
                    <CardDescription>Fill in the details about the food you want to share</CardDescription>
                </CardHeader>
                <CardContent>
                    <FoodListingForm
                        initialValues={initialValues}
                        onSubmit={handleSubmit}
                        onCancel={() => router.push('/dashboard/organization/listings')}
                        submitLabel="Create Listing"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
