'use client';

import { useSession } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Calendar, Package, Filter } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { browseListings } from '@/actions/student';

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
    remainingQuantity: number;
    organization: {
        name: string;
        type: string;
        address: string;
    };
    _count: {
        claims: number;
    };
}

export default function BrowseFoodPage() {
    const { data, isPending } = useSession();
    const router = useRouter();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [isVegetarian, setIsVegetarian] = useState(false);
    const [isVegan, setIsVegan] = useState(false);
    const [isHalal, setIsHalal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (!isPending && (!data?.user || data.user.role !== 'STUDENT')) {
            router.push('/');
        }
    }, [data, isPending, router]);

    useEffect(() => {
        fetchListings();
    }, [search, category, isVegetarian, isVegan, isHalal]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const data = await browseListings({
                search: search || undefined,
                category: category || undefined,
                isVegetarian,
                isVegan,
                isHalal,
            });
            setListings(data.listings as any);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    if (isPending || !data?.user || data.user.role !== 'STUDENT') {
        return null;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Browse Available Food</h1>
                <p className="mt-2 text-muted-foreground">
                    Discover leftover food from organizations and reduce waste
                </p>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Search & Filter</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            {showFilters ? 'Hide' : 'Show'} Filters
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search by title or description..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="w-48">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={(value) => setCategory(value === 'ALL' ? '' : value)}>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="All categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All categories</SelectItem>
                                    <SelectItem value="PREPARED_FOOD">Prepared Food</SelectItem>
                                    <SelectItem value="BAKED_GOODS">Baked Goods</SelectItem>
                                    <SelectItem value="BEVERAGES">Beverages</SelectItem>
                                    <SelectItem value="FRUITS">Fruits</SelectItem>
                                    <SelectItem value="VEGETABLES">Vegetables</SelectItem>
                                    <SelectItem value="DAIRY">Dairy</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Dietary Filters */}
                    {showFilters && (
                        <div className="space-y-3 pt-4 border-t">
                            <Label>Dietary Preferences</Label>
                            <div className="flex gap-6">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="vegetarian"
                                        checked={isVegetarian}
                                        onCheckedChange={(checked) => setIsVegetarian(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="vegetarian"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Vegetarian
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="vegan"
                                        checked={isVegan}
                                        onCheckedChange={(checked) => setIsVegan(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="vegan"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Vegan
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="halal"
                                        checked={isHalal}
                                        onCheckedChange={(checked) => setIsHalal(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="halal"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Halal
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Results */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading available food...</p>
                </div>
            ) : listings.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center space-y-2">
                            <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                            <h3 className="font-semibold">No food available</h3>
                            <p className="text-sm text-muted-foreground">
                                Try adjusting your filters or check back later
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="text-sm text-muted-foreground">
                        Found {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {listings.map((listing) => (
                            <Card key={listing.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="text-xl line-clamp-2">
                                            {listing.title}
                                        </CardTitle>
                                        <Badge variant={listing.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                                            {listing.status}
                                        </Badge>
                                    </div>
                                    <CardDescription className="line-clamp-2">
                                        {listing.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1 space-y-4">
                                    {/* Organization */}
                                    <div>
                                        <p className="text-sm font-medium">{listing.organization.name}</p>
                                        <p className="text-xs text-muted-foreground">{listing.organization.type}</p>
                                    </div>

                                    {/* Quantity */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {listing.remainingQuantity} {listing.unit} available
                                        </span>
                                    </div>

                                    {/* Pickup Location */}
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-2">{listing.pickupLocation}</span>
                                    </div>

                                    {/* Availability */}
                                    <div className="flex items-start gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div>Until {format(new Date(listing.availableUntil), 'PPp')}</div>
                                        </div>
                                    </div>

                                    {/* Dietary Info */}
                                    {(listing.isVegetarian || listing.isVegan || listing.isHalal) && (
                                        <div className="flex flex-wrap gap-2">
                                            {listing.isVegetarian && (
                                                <Badge variant="outline" className="text-xs">
                                                    Vegetarian
                                                </Badge>
                                            )}
                                            {listing.isVegan && (
                                                <Badge variant="outline" className="text-xs">
                                                    Vegan
                                                </Badge>
                                            )}
                                            {listing.isHalal && (
                                                <Badge variant="outline" className="text-xs">
                                                    Halal
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                    {/* Claims count */}
                                    {listing._count.claims > 0 && (
                                        <div className="text-xs text-muted-foreground">
                                            {listing._count.claims} {listing._count.claims === 1 ? 'claim' : 'claims'} made
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link href={`/dashboard/student/browse/${listing.id}`}>
                                            View Details & Claim
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
