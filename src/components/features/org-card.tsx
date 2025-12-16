import Image from 'next/image';
import Link from 'next/link';
import { Award, TrendingUp, Package } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrganizationRanking } from '@/types';

interface OrgCardProps {
    organization: OrganizationRanking;
    rank: number;
}

export function OrgCard({ organization, rank }: OrgCardProps) {
    const getRankColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-500';
        if (rank === 2) return 'text-gray-400';
        if (rank === 3) return 'text-amber-600';
        return 'text-muted-foreground';
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        if (rank === 2) return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
        if (rank === 3) return 'bg-amber-600/10 text-amber-600 border-amber-600/20';
        return 'bg-muted';
    };

    return (
        <Card className="group overflow-hidden transition-all hover:shadow-lg">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    {/* Rank Badge */}
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${getRankBadge(rank)}`}>
                        <span className={`text-2xl font-bold ${getRankColor(rank)}`}>
                            {rank}
                        </span>
                    </div>

                    {/* Organization Info */}
                    <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                                {organization.logo ? (
                                    <Image
                                        src={organization.logo}
                                        alt={organization.name}
                                        width={48}
                                        height={48}
                                        className="rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-lg bg-primary/10" />
                                )}
                                <div>
                                    <h3 className="font-semibold">{organization.name}</h3>
                                    <Badge variant="secondary" className="mt-1 text-xs">
                                        {organization.type}
                                    </Badge>
                                </div>
                            </div>
                            {rank <= 3 && (
                                <Award className={`h-6 w-6 ${getRankColor(rank)}`} />
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 sm:grid-cols-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Package className="h-3 w-3" />
                                    <span>Impact Points</span>
                                </div>
                                <p className="text-lg font-bold">
                                    {organization.totalImpactPoints?.toFixed(1) || '0.0'}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>Donations</span>
                                </div>
                                <p className="text-lg font-bold">
                                    {organization.totalDonations || 0}
                                </p>
                            </div>

                            <div className="col-span-2 space-y-1 sm:col-span-1">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Award className="h-3 w-3" />
                                    <span>SDG Score</span>
                                </div>
                                <p className="text-lg font-bold">
                                    {organization.sdgScore?.toFixed(1) || '0.0'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="border-t bg-muted/30 p-4">
                <Link
                    href={`/organizations/${organization.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                >
                    View Profile →
                </Link>
            </CardFooter>
        </Card>
    );
}
