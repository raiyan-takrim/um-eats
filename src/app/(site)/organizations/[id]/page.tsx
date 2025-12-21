'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    Award,
    TrendingUp,
    Package,
    Clock,
    Leaf,
    Users
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getOrganizationById } from '@/actions/organization';
import { formatDistanceToNow } from 'date-fns';

export default function OrganizationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [organization, setOrganization] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrganization = async () => {
            try {
                const org = await getOrganizationById(id);
                if (!org) {
                    setError('Organization not found or is not available.');
                } else {
                    setOrganization(org);
                }
            } catch (err) {
                console.error('Failed to fetch organization:', err);
                setError('Failed to load organization details.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrganization();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">
                    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                        <Skeleton className="h-8 w-32 mb-6" />
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-1">
                                <Skeleton className="h-96 w-full" />
                            </div>
                            <div className="lg:col-span-2">
                                <Skeleton className="h-64 w-full mb-6" />
                                <Skeleton className="h-48 w-full" />
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !organization) {
        return (
            <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">
                    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                        <Button
                            variant="ghost"
                            className="mb-6"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <Card>
                            <CardContent className="p-12 text-center">
                                <p className="text-lg font-semibold text-destructive">
                                    {error || 'Organization not found'}
                                </p>
                                <p className="mt-2 text-muted-foreground">
                                    The organization you're looking for is not available or has been removed.
                                </p>
                                <Button asChild className="mt-6">
                                    <Link href="/rankings">View All Organizations</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const isExpiringSoon = (availableUntil: Date) => {
        return new Date(availableUntil).getTime() - Date.now() < 2 * 60 * 60 * 1000; // 2 hours
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Back Button */}
                <div className="border-b">
                    <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </div>
                </div>

                {/* Organization Header */}
                <section className="border-b bg-linear-to-b from-primary/5 to-background py-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-6 md:flex-row md:items-start">
                            {/* Logo */}
                            <div className="shrink-0">
                                {organization.logo ? (
                                    <Image
                                        src={organization.logo}
                                        alt={organization.name}
                                        width={120}
                                        height={120}
                                        className="rounded-xl object-cover shadow-lg"
                                    />
                                ) : (
                                    <div className="flex h-[120px] w-[120px] items-center justify-center rounded-xl bg-primary/10 shadow-lg">
                                        <Users className="h-12 w-12 text-primary" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h1 className="text-3xl font-bold md:text-4xl">{organization.name}</h1>
                                    <Badge variant="secondary" className="mt-2">
                                        {organization.type}
                                    </Badge>
                                </div>

                                {organization.description && (
                                    <p className="text-lg text-muted-foreground">
                                        {organization.description}
                                    </p>
                                )}

                                {/* Contact Info */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{organization.address}</span>
                                    </div>
                                    {organization.phone && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                            <a href={`tel:${organization.phone}`} className="hover:text-primary">
                                                {organization.phone}
                                            </a>
                                        </div>
                                    )}
                                    {organization.email && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                            <a href={`mailto:${organization.email}`} className="hover:text-primary">
                                                {organization.email}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <Package className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Impact Points</p>
                                            <p className="text-2xl font-bold">
                                                {organization.stats.totalImpactPoints.toFixed(1)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <TrendingUp className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Completed Donations</p>
                                            <p className="text-2xl font-bold">
                                                {organization.stats.totalDonations}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <Award className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Active Listings</p>
                                            <p className="text-2xl font-bold">
                                                {organization.stats.activeListings}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
