'use client';

import { useSession } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building, Mail, Phone, MapPin, Edit, X, Save } from 'lucide-react';
import { getOrganizationStatus, updateOrganization } from '@/actions/organization';

type Organization = {
    id: string;
    name: string;
    type: string;
    description: string | null;
    address: string;
    phone: string;
    email: string;
    status: string;
};

export default function OrganizationSettingsPage() {
    const { data, isPending } = useSession();
    const router = useRouter();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
    });

    useEffect(() => {
        if (!isPending && (!data?.user || data.user.role !== 'ORGANIZATION')) {
            router.push('/');
        }
    }, [data, isPending, router]);

    useEffect(() => {
        if (data?.user?.role === 'ORGANIZATION') {
            fetchOrganization();
        }
    }, [data]);

    const fetchOrganization = async () => {
        try {
            const result = await getOrganizationStatus();
            if (result.organization) {
                setOrganization(result.organization as any);
                setFormData({
                    name: result.organization.name,
                    description: result.organization.description || '',
                    address: result.organization.address,
                    phone: result.organization.phone,
                    email: result.organization.email,
                });
            }
        } catch (error) {
            console.error('Failed to fetch organization:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (organization) {
            setFormData({
                name: organization.name,
                description: organization.description || '',
                address: organization.address,
                phone: organization.phone,
                email: organization.email,
            });
        }
        setIsEditing(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateOrganization(formData);
            await fetchOrganization();
            setIsEditing(false);
            toast.success('Organization updated successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update organization');
        } finally {
            setSaving(false);
        }
    };

    if (isPending || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!data?.user || data.user.role !== 'ORGANIZATION') {
        return null;
    }

    if (!organization) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Organization Settings</h1>
                    <p className="mt-2 text-muted-foreground">
                        No organization found. Please create an organization first.
                    </p>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
            PENDING: { variant: 'outline', color: 'border-yellow-500' },
            APPROVED: { variant: 'default', color: 'border-green-500' },
            REJECTED: { variant: 'destructive', color: 'text-red-600' },
            BANNED: { variant: 'destructive', color: 'text-red-600' },
        };
        const config = variants[status] || variants.PENDING;
        return <Badge variant={config.variant} className={config.color}>{status}</Badge>;
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Organization Settings</h1>
                <p className="mt-2 text-muted-foreground">
                    View and manage your organization information
                </p>
            </div>

            {/* Organization Info */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Organization Information</CardTitle>
                            <CardDescription>Your organization details and status</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {getStatusBadge(organization.status)}
                            {!isEditing && organization.status === 'APPROVED' && (
                                <Button onClick={handleEdit} variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            )}
                            {isEditing && (
                                <>
                                    <Button onClick={handleCancel} variant="outline" size="sm">
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} size="sm" disabled={saving}>
                                        {saving ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4 mr-2" />
                                        )}
                                        Save
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <Label className="text-muted-foreground">Organization Name</Label>
                            {isEditing ? (
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Organization name"
                                    className="mt-2"
                                />
                            ) : (
                                <div className="flex items-center gap-2 mt-2">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{organization.name}</p>
                                </div>
                            )}
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Type</Label>
                            <p className="font-medium mt-2 capitalize">{organization.type.toLowerCase().replace('_', ' ')}</p>
                        </div>
                    </div>

                    <div>
                        <Label className="text-muted-foreground">Description</Label>
                        {isEditing ? (
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Organization description"
                                rows={3}
                                className="mt-2"
                            />
                        ) : (
                            <p className="mt-2 text-sm">{organization.description || 'No description provided'}</p>
                        )}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <Label className="text-muted-foreground">Email</Label>
                            {isEditing ? (
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="contact@organization.com"
                                    className="mt-2"
                                />
                            ) : (
                                <div className="flex items-center gap-2 mt-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{organization.email}</p>
                                </div>
                            )}
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Phone</Label>
                            {isEditing ? (
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+60123456789"
                                    className="mt-2"
                                />
                            ) : (
                                <div className="flex items-center gap-2 mt-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{organization.phone}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label className="text-muted-foreground">Address</Label>
                        {isEditing ? (
                            <Textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Organization address"
                                rows={2}
                                className="mt-2"
                            />
                        ) : (
                            <div className="flex items-start gap-2 mt-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <p className="font-medium">{organization.address}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Your login and user details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <Label className="text-muted-foreground">Name</Label>
                            <p className="font-medium mt-2">{data.user.name}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Email</Label>
                            <p className="font-medium mt-2">{data.user.email}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {organization.status === 'PENDING' && (
                <Card className="border-yellow-500">
                    <CardHeader>
                        <CardTitle className="text-yellow-600">Pending Approval</CardTitle>
                        <CardDescription>
                            Your organization is currently under review by our admin team
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            You'll be notified via email once your application is reviewed. This typically takes 1-2 business days.
                        </p>
                    </CardContent>
                </Card>
            )}

            {organization.status === 'REJECTED' && (
                <Card className="border-red-500">
                    <CardHeader>
                        <CardTitle className="text-red-600">Application Rejected</CardTitle>
                        <CardDescription>
                            Unfortunately, your organization application was not approved
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Please contact the admin team if you believe this was a mistake or if you'd like to reapply.
                        </p>
                    </CardContent>
                </Card>
            )}

            {organization.status === 'BANNED' && (
                <Card className="border-red-500">
                    <CardHeader>
                        <CardTitle className="text-red-600">Organization Banned</CardTitle>
                        <CardDescription>
                            Your organization has been banned from the platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Contact the admin team at admin@umeats.com for more information.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
