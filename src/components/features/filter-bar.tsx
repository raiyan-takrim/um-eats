'use client';

import * as React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FilterBarProps {
    onSearchChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onDietaryFiltersChange: (filters: string[]) => void;
    onSortChange: (value: string) => void;
}

export function FilterBar({
    onSearchChange,
    onCategoryChange,
    onDietaryFiltersChange,
    onSortChange,
}: FilterBarProps) {
    const [search, setSearch] = React.useState('');
    const [category, setCategory] = React.useState('all');
    const [dietaryFilters, setDietaryFilters] = React.useState<string[]>([]);
    const [sort, setSort] = React.useState('latest');

    const handleSearchChange = (value: string) => {
        setSearch(value);
        onSearchChange(value);
    };

    const handleCategoryChange = (value: string) => {
        setCategory(value);
        onCategoryChange(value);
    };

    const handleDietaryToggle = (filter: string) => {
        const newFilters = dietaryFilters.includes(filter)
            ? dietaryFilters.filter((f) => f !== filter)
            : [...dietaryFilters, filter];
        setDietaryFilters(newFilters);
        onDietaryFiltersChange(newFilters);
    };

    const handleSortChange = (value: string) => {
        setSort(value);
        onSortChange(value);
    };

    const clearFilters = () => {
        setSearch('');
        setCategory('all');
        setDietaryFilters([]);
        setSort('latest');
        onSearchChange('');
        onCategoryChange('all');
        onDietaryFiltersChange([]);
        onSortChange('latest');
    };

    const hasActiveFilters = search || category !== 'all' || dietaryFilters.length > 0 || sort !== 'latest';

    return (
        <div className="space-y-4">
            {/* Search and Sort */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search food..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select value={sort} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="latest">Latest</SelectItem>
                        <SelectItem value="expiring">Expiring Soon</SelectItem>
                        <SelectItem value="quantity-high">Most Quantity</SelectItem>
                        <SelectItem value="quantity-low">Least Quantity</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Category and Dietary Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <Select value={category} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Meals">Meals</SelectItem>
                        <SelectItem value="Bakery">Bakery</SelectItem>
                        <SelectItem value="Snacks">Snacks</SelectItem>
                        <SelectItem value="Beverages">Beverages</SelectItem>
                        <SelectItem value="Fruits">Fruits</SelectItem>
                    </SelectContent>
                </Select>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Dietary
                            {dietaryFilters.length > 0 && (
                                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0">
                                    {dietaryFilters.length}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuLabel>Dietary Preferences</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={dietaryFilters.includes('halal')}
                            onCheckedChange={() => handleDietaryToggle('halal')}
                        >
                            Halal
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={dietaryFilters.includes('vegetarian')}
                            onCheckedChange={() => handleDietaryToggle('vegetarian')}
                        >
                            Vegetarian
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={dietaryFilters.includes('vegan')}
                            onCheckedChange={() => handleDietaryToggle('vegan')}
                        >
                            Vegan
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                        <X className="h-4 w-4" />
                        Clear Filters
                    </Button>
                )}
            </div>

            {/* Active Filters Display */}
            {dietaryFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {dietaryFilters.map((filter) => (
                        <Badge key={filter} variant="secondary" className="gap-1">
                            {filter}
                            <button
                                onClick={() => handleDietaryToggle(filter)}
                                className="ml-1 rounded-full hover:bg-muted"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
