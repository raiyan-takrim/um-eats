import Image from 'next/image';
import Link from 'next/link';
import { Clock, MapPin, Users, Leaf, Award } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FoodListingWithOrg } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface FoodCardProps {
    food: FoodListingWithOrg;
    showClaimButton?: boolean;
}

export function FoodCard({ food, showClaimButton = true }: FoodCardProps) {
    const isExpiringSoon = new Date(food.availableUntil).getTime() - Date.now() < 2 * 60 * 60 * 1000; // 2 hours

    return (
        <Card className="group overflow-hidden transition-all hover:shadow-lg">
            {/* Image */}
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {food.images.length > 0 ? (
                    <Image
                        src={food.images[0]}
                        alt={food.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <Users className="h-12 w-12 text-muted-foreground" />
                    </div>
                )}
                {isExpiringSoon && (
                    <div className="absolute left-2 top-2">
                        <Badge variant="destructive" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Expiring Soon
                        </Badge>
                    </div>
                )}
            </div>

            <CardHeader className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 text-lg font-semibold">{food.title}</h3>
                    <Badge variant="secondary">{food.category}</Badge>
                </div>

                <p className="line-clamp-2 text-sm text-muted-foreground">
                    {food.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                    {food.isHalal && (
                        <Badge variant="outline" className="gap-1 text-xs">
                            <Award className="h-3 w-3" />
                            Halal
                        </Badge>
                    )}
                    {food.isVegetarian && (
                        <Badge variant="outline" className="gap-1 text-xs">
                            <Leaf className="h-3 w-3" />
                            Vegetarian
                        </Badge>
                    )}
                    {food.isVegan && (
                        <Badge variant="outline" className="gap-1 text-xs">
                            <Leaf className="h-3 w-3" />
                            Vegan
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-3 p-4 pt-0">
                {/* Organization */}
                <div className="flex items-center gap-2">
                    {food.organization.logo ? (
                        <Image
                            src={food.organization.logo}
                            alt={food.organization.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="h-6 w-6 rounded-full bg-primary/10" />
                    )}
                    <span className="text-sm font-medium">{food.organization.name}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{food.pickupLocation}</span>
                </div>

                {/* Quantity & Time */}
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                        {food.quantity} {food.unit} available
                    </span>
                    <span className="text-muted-foreground">
                        Until {formatDistanceToNow(new Date(food.availableUntil), { addSuffix: true })}
                    </span>
                </div>
            </CardContent>

            {showClaimButton && (
                <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full">
                        <Link href={`/food/${food.id}`}>View Details</Link>
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
