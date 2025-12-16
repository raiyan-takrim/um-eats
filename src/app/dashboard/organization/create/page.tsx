'use client';

import { useSession } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, CheckCircle2, Loader2, MapPin, Mail, Phone, FileText, Search, Navigation } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { applyForOrganization } from '@/actions/organization';

export default function CreateOrganizationPage() {
    const { data, isPending } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'RESTAURANT',
        description: '',
        address: '',
        phone: '',
        email: '',
        latitude: 3.1202,
        longitude: 101.6538,
    });

    useEffect(() => {
        if (!isPending && (!data?.user || data.user.role !== 'ORGANIZATION')) {
            router.push('/');
        }
    }, [data, isPending, router]);

    const searchLocation = async (query: string) => {
        if (query.length < 3) {
            setLocationSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setLocationLoading(true);
        try {
            // Using Nominatim (OpenStreetMap) API for geocoding - free and no API key required
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=my&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'UMEats-App',
                    },
                }
            );
            const results = await response.json();
            setLocationSuggestions(results);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error searching location:', error);
        } finally {
            setLocationLoading(false);
        }
    };

    const selectLocation = (location: any) => {
        setFormData({
            ...formData,
            address: location.display_name,
            latitude: parseFloat(location.lat),
            longitude: parseFloat(location.lon),
        });
        setShowSuggestions(false);
        setLocationSuggestions([]);
    };

    const handleAddressChange = (value: string) => {
        setFormData({ ...formData, address: value });
        searchLocation(value);
    };

    const useMyLocation = async () => {
        setLocationLoading(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    // Reverse geocoding to get address from coordinates
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                            {
                                headers: {
                                    'User-Agent': 'UMEats-App',
                                },
                            }
                        );
                        const result = await response.json();

                        setFormData({
                            ...formData,
                            address: result.display_name || '',
                            latitude,
                            longitude,
                        });
                    } catch (error) {
                        console.error('Error getting address:', error);
                        // Still set coordinates even if address lookup fails
                        setFormData({
                            ...formData,
                            latitude,
                            longitude,
                        });
                    }
                    setLocationLoading(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setLocationLoading(false);
                    setError('Unable to get your location. Please check browser permissions and try again.');
                }
            );
        } else {
            setLocationLoading(false);
            setError('Geolocation is not supported by your browser');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await applyForOrganization(formData);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!data?.user || data.user.role !== 'ORGANIZATION') {
        return null;
    }

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="max-w-3xl w-full">
                    <Card>
                        <CardHeader className="text-center space-y-4">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                                <CheckCircle2 className="h-10 w-10 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Application Submitted Successfully!</CardTitle>
                                <CardDescription className="mt-2">
                                    Your organization application is now under review
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert>
                                <AlertDescription>
                                    <div className="space-y-2">
                                        <p className="font-medium">What happens next?</p>
                                        <ul className="space-y-1 text-sm">
                                            <li>• Our admin team will review your application within 1-2 business days</li>
                                            <li>• You'll receive an email notification once reviewed</li>
                                            <li>• After approval, you can start listing food items and manage your organization</li>
                                        </ul>
                                    </div>
                                </AlertDescription>
                            </Alert>
                            <Button onClick={() => router.push('/dashboard/organization')} className="w-full" size="lg">
                                Go to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Register Your Organization</h1>
                <p className="text-muted-foreground mt-2">
                    Fill in the details below to register your organization with UMEats
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Basic Information</CardTitle>
                        </div>
                        <CardDescription>
                            Tell us about your organization
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Organization Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Café Eleven"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Organization Type</Label>
                                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                    <SelectTrigger id="type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                                        <SelectItem value="CAFE">Café</SelectItem>
                                        <SelectItem value="CATERING">Catering Service</SelectItem>
                                        <SelectItem value="EVENT_ORGANIZER">Event Organizer</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description of your organization and what you offer..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Contact Information</CardTitle>
                        </div>
                        <CardDescription>
                            How can students and admins reach you?
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="contact@organization.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+60 12-345 6789"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Location */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>Location</CardTitle>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={useMyLocation}
                                disabled={locationLoading}
                            >
                                {locationLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Detecting...
                                    </>
                                ) : (
                                    <>
                                        <Navigation className="mr-2 h-4 w-4" />
                                        Use My Location
                                    </>
                                )}
                            </Button>
                        </div>
                        <CardDescription>
                            Search for your address or use your current location
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">Full Address</Label>
                            <div className="relative">
                                <Textarea
                                    id="address"
                                    placeholder="Start typing your address (e.g., University Malaya, Kuala Lumpur)"
                                    value={formData.address}
                                    onChange={(e) => handleAddressChange(e.target.value)}
                                    rows={3}
                                    className="resize-none"
                                    required
                                />
                                {locationLoading && (
                                    <div className="absolute right-3 top-3">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                                {showSuggestions && locationSuggestions.length > 0 && (
                                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                                        <div className="max-h-60 overflow-auto p-1">
                                            {locationSuggestions.map((location, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => selectLocation(location)}
                                                    className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                                                        <span className="line-clamp-2">{location.display_name}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Start typing to search for your location. Coordinates will be set automatically.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input
                                    id="latitude"
                                    type="number"
                                    step="any"
                                    placeholder="3.1202"
                                    value={formData.latitude}
                                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                                    required
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input
                                    id="longitude"
                                    type="number"
                                    step="any"
                                    placeholder="101.6538"
                                    value={formData.longitude}
                                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                                    required
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/dashboard/organization')}
                        className="flex-1"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1" size="lg">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Application'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
