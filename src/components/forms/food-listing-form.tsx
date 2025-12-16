'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, Info, Lightbulb } from 'lucide-react';

const formSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description is too long'),
    category: z.string().min(1, 'Please select a category'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unit: z.string().min(1, 'Please select a unit'),
    availableFrom: z.date({
        message: 'Please select a start date and time',
    }),
    availableUntil: z.date({
        message: 'Please select an end date and time',
    }),
    pickupLocation: z.string().min(3, 'Pickup location must be at least 3 characters'),
    isVegetarian: z.boolean(),
    isVegan: z.boolean(),
    isHalal: z.boolean(),
    allergens: z.string().optional(),
    tags: z.string().optional(),
}).refine((data) => data.availableUntil > data.availableFrom, {
    message: 'End date must be after start date',
    path: ['availableUntil'],
});

export type FoodListingFormValues = z.infer<typeof formSchema>;

interface FoodListingFormProps {
    initialValues?: Partial<FoodListingFormValues>;
    onSubmit: (values: FoodListingFormValues) => Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
}

export function FoodListingForm({
    initialValues,
    onSubmit,
    onCancel,
    submitLabel = 'Create Listing',
}: FoodListingFormProps) {
    const form = useForm<FoodListingFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialValues?.title || '',
            description: initialValues?.description || '',
            category: initialValues?.category || '',
            quantity: initialValues?.quantity || 1,
            unit: initialValues?.unit || 'portions',
            availableFrom: initialValues?.availableFrom,
            availableUntil: initialValues?.availableUntil,
            pickupLocation: initialValues?.pickupLocation || '',
            isVegetarian: initialValues?.isVegetarian ?? false,
            isVegan: initialValues?.isVegan ?? false,
            isHalal: initialValues?.isHalal ?? true,
            allergens: initialValues?.allergens || '',
            tags: initialValues?.tags || '',
        },
    });

    const handleSubmit = async (values: FoodListingFormValues) => {
        try {
            await onSubmit(values);
        } catch (error: any) {
            form.setError('root', {
                message: error.message || 'An error occurred. Please try again.',
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Title */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Fresh Nasi Lemak" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe the food item..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Category & Unit Selection Guide */}
                <Alert className="border-blue-500/50 bg-blue-500/10">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm">
                        <p className="font-semibold mb-2">How to choose Category & Unit:</p>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                            <li><strong>Meals:</strong> Use "portions" for individual servings (e.g., 10 portions of nasi lemak), "boxes" for packed meals, or "pax" for buffet-style</li>
                            <li><strong>Bakery:</strong> Use "pieces" for individual items (e.g., 20 pieces of donuts), "portions" for slices (e.g., cake slices)</li>
                            <li><strong>Snacks:</strong> Use "pieces" for individual bars/packs, "portions" for serving sizes, "boxes" for variety packs</li>
                            <li><strong>Beverages:</strong> Use "pieces" for bottles/cans, "portions" for cups, "boxes" for multi-packs</li>
                            <li><strong>Fruit:</strong> Use "pieces" for whole fruits (e.g., 15 pieces of apples), "portions" for fruit cups/servings</li>
                        </ul>
                        <p className="mt-2 text-xs font-medium text-blue-600">💡 This helps us calculate environmental impact accurately!</p>
                    </AlertDescription>
                </Alert>

                {/* Category & Unit */}
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Meals">Meals (Highest Impact)</SelectItem>
                                        <SelectItem value="Fruit">Fruit</SelectItem>
                                        <SelectItem value="Bakery">Bakery</SelectItem>
                                        <SelectItem value="Others">Others</SelectItem>
                                        <SelectItem value="Snacks">Snacks</SelectItem>
                                        <SelectItem value="Beverages">Beverages (Lowest Impact)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription className="text-xs">
                                    Choose the type that best describes your food
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a unit" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="portions">Portions (individual servings)</SelectItem>
                                        <SelectItem value="pieces">Pieces (individual items)</SelectItem>
                                        <SelectItem value="pax">Pax (per person buffet)</SelectItem>
                                        <SelectItem value="boxes">Boxes (packed containers)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription className="text-xs">
                                    How you measure the quantity
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Quantity */}
                <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="How many units available?"
                                    value={field.value}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Availability Period */}
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="availableFrom"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Available From</FormLabel>
                                <DateTimePicker
                                    date={field.value}
                                    setDate={field.onChange}
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="availableUntil"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Available Until</FormLabel>
                                <DateTimePicker
                                    date={field.value}
                                    setDate={field.onChange}
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Pickup Location */}
                <FormField
                    control={form.control}
                    name="pickupLocation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pickup Location</FormLabel>
                            <FormControl>
                                <Input placeholder="Where can students collect the food?" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Dietary Properties */}
                <div className="space-y-4">
                    <FormLabel>Dietary Properties</FormLabel>
                    <div className="grid gap-4 md:grid-cols-3">
                        <FormField
                            control={form.control}
                            name="isVegetarian"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Vegetarian</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isVegan"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Vegan</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isHalal"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Halal</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Allergens */}
                <FormField
                    control={form.control}
                    name="allergens"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Allergens</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., peanuts, dairy, gluten (comma-separated)"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                List any allergens present in the food
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Tags */}
                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., spicy, healthy, fresh (comma-separated)"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Add tags to help students find your listing
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {form.formState.errors.root && (
                    <div className="text-sm text-red-500">
                        {form.formState.errors.root.message}
                    </div>
                )}

                <div className="flex gap-4">
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="flex-1"
                    >
                        {form.formState.isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {submitLabel}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
