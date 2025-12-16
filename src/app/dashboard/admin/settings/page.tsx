'use client';

import { useSession } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Loader2, Save } from 'lucide-react';
import { getSystemSettings, updateSystemSettings } from '@/actions/admin';

export default function AdminSettingsPage() {
    const { data, isPending } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        platform_name: '',
        admin_email: '',
        support_email: '',
        auto_approve_orgs: false,
    });
    const [isInitialized, setIsInitialized] = useState(false);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const settings = await getSystemSettings();
            setFormData(settings);
        } catch (error) {
            console.error('Failed to load settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isPending && !isInitialized) {
            if (!data?.user || data.user.role !== 'ADMIN') {
                router.push('/dashboard');
                return;
            }

            loadSettings();
            setIsInitialized(true);
        }
    }, [data, isPending, isInitialized, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.platform_name.trim()) {
            toast.error('Platform name is required');
            return;
        }

        if (!formData.admin_email.trim()) {
            toast.error('Admin email is required');
            return;
        }

        if (!formData.support_email.trim()) {
            toast.error('Support email is required');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.admin_email)) {
            toast.error('Please enter a valid admin email');
            return;
        }

        if (!emailRegex.test(formData.support_email)) {
            toast.error('Please enter a valid support email');
            return;
        }

        try {
            setSaving(true);
            await updateSystemSettings(formData);
            toast.success('Settings updated successfully');
        } catch (error) {
            console.error('Failed to update settings:', error);
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (isPending || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data?.user || data.user.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-6 w-6" />
                    <h1 className="text-3xl font-bold">System Settings</h1>
                </div>
                <p className="text-muted-foreground">
                    Configure platform-wide settings and preferences
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>
                            Basic platform configuration and contact information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="platform_name">Platform Name</Label>
                            <Input
                                id="platform_name"
                                value={formData.platform_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, platform_name: e.target.value })
                                }
                                placeholder="UM Eats"
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                This name appears in navigation, emails, and page titles
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="admin_email">Admin Contact Email</Label>
                            <Input
                                id="admin_email"
                                type="email"
                                value={formData.admin_email}
                                onChange={(e) =>
                                    setFormData({ ...formData, admin_email: e.target.value })
                                }
                                placeholder="admin@um.edu.my"
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                System notifications will be sent to this email
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="support_email">Support Email</Label>
                            <Input
                                id="support_email"
                                type="email"
                                value={formData.support_email}
                                onChange={(e) =>
                                    setFormData({ ...formData, support_email: e.target.value })
                                }
                                placeholder="support@um.edu.my"
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                Users will see this email for help and support
                            </p>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="auto_approve_orgs" className="text-base">
                                    Auto-approve Organizations
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Automatically approve new organization registrations without manual review
                                </p>
                            </div>
                            <Switch
                                id="auto_approve_orgs"
                                checked={formData.auto_approve_orgs}
                                onCheckedChange={(checked: boolean) =>
                                    setFormData({ ...formData, auto_approve_orgs: checked })
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-6 flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={loadSettings}
                        disabled={saving}
                    >
                        Reset
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Settings
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
