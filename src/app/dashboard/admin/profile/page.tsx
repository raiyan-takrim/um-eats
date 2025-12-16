'use client';

import { useSession } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '@/actions/admin';
import { toast } from 'sonner';

export default function AdminProfilePage() {
    const { data, isPending } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        image: '',
    });

    useEffect(() => {
        if (!isPending && (!data?.user || data.user.role !== 'ADMIN')) {
            router.push('/');
        }
    }, [data, isPending, router]);

    useEffect(() => {
        if (data?.user?.role === 'ADMIN') {
            fetchProfile();
        }
    }, [data]);

    const fetchProfile = async () => {
        try {
            const result = await getUserProfile();
            setProfile(result.user);
            setFormData({
                name: result.user.name || '',
                phone: result.user.phone || '',
                image: result.user.image || '',
            });
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }

        setSaving(true);
        try {
            await updateUserProfile(formData);
            toast.success('Profile updated successfully');
            await fetchProfile();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                phone: profile.phone || '',
                image: profile.image || '',
            });
        }
    };

    if (isPending || loading || !data?.user || data.user.role !== 'ADMIN') {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="mt-2 text-muted-foreground">
                    Manage your personal information
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Overview */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Profile Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
                                {profile?.image ? (
                                    <img
                                        src={profile.image}
                                        alt={profile.name}
                                        className="h-24 w-24 rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="h-12 w-12 text-destructive" />
                                )}
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold">{profile?.name}</p>
                                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                            </div>
                            <Badge variant="destructive">{profile?.role}</Badge>
                        </div>

                        <div className="space-y-3 pt-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium">{profile?.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Verified:</span>
                                <Badge variant={profile?.emailVerified ? 'default' : 'secondary'}>
                                    {profile?.emailVerified ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Member since:</span>
                                <span className="font-medium">
                                    {new Date(profile?.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Form */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Edit Profile</CardTitle>
                        <CardDescription>
                            Update your personal information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={profile?.email}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Email cannot be changed
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="image">Profile Image URL</Label>
                                    <Input
                                        id="image"
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) =>
                                            setFormData({ ...formData, image: e.target.value })
                                        }
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Enter a URL to your profile image
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleReset}
                                    disabled={saving}
                                >
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
