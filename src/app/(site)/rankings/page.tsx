'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { OrgCard } from '@/components/features/org-card';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllRankedOrganizations } from '@/actions/stats';

export default function RankingsPage() {
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalImpact: 0,
        totalOrgs: 0,
        totalDonations: 0,
    });

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const orgs = await getAllRankedOrganizations();
                setOrganizations(orgs);

                // Calculate aggregate stats
                const totalImpact = orgs.reduce((sum, org) => sum + org.totalImpactPoints, 0);
                const totalDonations = orgs.reduce((sum, org) => sum + org.totalDonations, 0);

                setStats({
                    totalImpact,
                    totalOrgs: orgs.length,
                    totalDonations,
                });
            } catch (error) {
                console.error('Failed to fetch organizations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizations();
    }, []);

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Header */}
                <section className="border-b bg-linear-to-b from-primary/5 to-background py-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold md:text-4xl">SDG Champions Leaderboard</h1>
                        <p className="mt-2 text-muted-foreground">
                            Organizations making the biggest impact in food redistribution and sustainability
                        </p>

                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-lg border bg-card p-4">
                                <p className="text-sm text-muted-foreground">Total Impact Points</p>
                                {loading ? (
                                    <Skeleton className="h-8 w-24 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold">{stats.totalImpact.toFixed(1)} FIP</p>
                                )}
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <p className="text-sm text-muted-foreground">Total Organizations</p>
                                {loading ? (
                                    <Skeleton className="h-8 w-16 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold">{stats.totalOrgs}</p>
                                )}
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <p className="text-sm text-muted-foreground">Total Donations</p>
                                {loading ? (
                                    <Skeleton className="h-8 w-24 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold">{stats.totalDonations}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Rankings List */}
                <section className="py-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="space-y-4">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <Card key={i} className="animate-pulse">
                                        <CardContent className="p-6">
                                            <div className="h-20 bg-muted rounded" />
                                        </CardContent>
                                    </Card>
                                ))
                            ) : organizations.length > 0 ? (
                                organizations.map((org, index) => (
                                    <OrgCard key={org.id} organization={org} rank={index + 1} />
                                ))
                            ) : (
                                <Card>
                                    <CardContent className="p-12 text-center">
                                        <p className="text-lg text-muted-foreground">
                                            No ranked organizations yet.
                                        </p>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Organizations with at least 1 completed donation will appear here.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
