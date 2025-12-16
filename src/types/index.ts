import { UserRole, FoodStatus, OrganizationType } from '@prisma/client';

export type { UserRole, FoodStatus, OrganizationType };

export interface FoodListingWithOrg {
    id: string;
    title: string;
    description: string;
    category: string;
    quantity: number;
    unit: string;
    images: string[];
    status: FoodStatus;
    availableFrom: Date;
    availableUntil: Date;
    pickupLocation: string;
    latitude: number;
    longitude: number;
    isVegetarian: boolean;
    isVegan: boolean;
    isHalal: boolean;
    allergens: string[];
    tags: string[];
    createdAt: Date;
    organization: {
        id: string;
        name: string;
        type: OrganizationType;
        logo: string | null;
        address: string;
        latitude: number;
        longitude: number;
    };
}

export interface OrganizationRanking {
    id: string;
    name: string;
    type: OrganizationType;
    logo: string | null;
    totalImpactPoints: number;
    totalDonations: number;
    sdgScore: number;
    ranking: number | null;
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    phone: string | null;
    avatar: string | null;
    organization?: {
        id: string;
        name: string;
        type: OrganizationType;
        logo: string | null;
    };
}
