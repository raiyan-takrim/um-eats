'use client';

import { useSession } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building, CheckCircle, XCircle, Clock, Loader2, Search, Ban, ShieldCheck, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { getAllOrganizations, updateOrganizationStatus, banOrganization, unbanOrganization, updateOrganizationDetails, deleteOrganization } from '@/actions/admin';

type Organization = {
    id: string;
    name: string;
    slug: string;
    type: string;
    email: string;
    phone: string;
    address: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED';
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    members: Array<{
        id: string;
        role: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
    }>;
};

export default function AdminOrganizationsPage() {
    const { data, isPending } = useSession();
    const router = useRouter();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED'>('ALL');
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [banReason, setBanReason] = useState('');
    const [showBanDialog, setShowBanDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
    });

    useEffect(() => {
        if (!isPending && (!data?.user || data.user.role !== 'ADMIN')) {
            router.push('/');
        }
    }, [data, isPending, router]);

    useEffect(() => {
        if (data?.user?.role === 'ADMIN') {
            fetchOrganizations();
        }
    }, [data]);

    const fetchOrganizations = async () => {
        try {
            const result = await getAllOrganizations();
            console.log('Fetched organizations:', result);
            setOrganizations(result.organizations as any);
        } catch (error) {
            console.error('Failed to fetch organizations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (org: Organization) => {
        setActionLoading(true);
        try {
            await updateOrganizationStatus(org.id, 'APPROVED');
            await fetchOrganizations();
            toast.success(`${org.name} has been approved successfully`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to approve organization');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedOrg || !rejectionReason.trim()) return;

        setActionLoading(true);
        try {
            await updateOrganizationStatus(
                selectedOrg.id,
                'REJECTED',
                rejectionReason
            );
            await fetchOrganizations();
            setShowRejectDialog(false);
            setSelectedOrg(null);
            setRejectionReason('');
            toast.success(`${selectedOrg.name} has been rejected`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject organization');
        } finally {
            setActionLoading(false);
        }
    };

    const handleBan = async () => {
        if (!selectedOrg || !banReason.trim()) return;

        setActionLoading(true);
        try {
            await banOrganization(selectedOrg.id, banReason);
            await fetchOrganizations();
            setShowBanDialog(false);
            setSelectedOrg(null);
            setBanReason('');
            toast.success(`${selectedOrg.name} has been banned successfully`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to ban organization');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnban = async (org: Organization) => {
        setActionLoading(true);
        try {
            await unbanOrganization(org.id);
            await fetchOrganizations();
            toast.success(`${org.name} has been unbanned successfully`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to unban organization');
        } finally {
            setActionLoading(false);
        }
    };

    const handleView = (org: Organization) => {
        setSelectedOrg(org);
        setShowViewDialog(true);
    };

    const handleEdit = (org: Organization) => {
        setSelectedOrg(org);
        setEditFormData({
            name: org.name,
            description: (org as any).description || '',
            address: org.address,
            phone: org.phone,
            email: org.email,
        });
        setShowEditDialog(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedOrg) return;

        setActionLoading(true);
        try {
            await updateOrganizationDetails(selectedOrg.id, editFormData);
            await fetchOrganizations();
            setShowEditDialog(false);
            setSelectedOrg(null);
            toast.success('Organization updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update organization');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedOrg) return;

        setActionLoading(true);
        try {
            await deleteOrganization(selectedOrg.id);
            await fetchOrganizations();
            setShowDeleteDialog(false);
            setSelectedOrg(null);
            toast.success('Organization deleted successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete organization');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredOrganizations = organizations.filter((org) => {
        const matchesSearch =
            org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || org.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusCounts = {
        PENDING: organizations.filter((o) => o.status === 'PENDING').length,
        APPROVED: organizations.filter((o) => o.status === 'APPROVED').length,
        REJECTED: organizations.filter((o) => o.status === 'REJECTED').length,
        BANNED: organizations.filter((o) => o.status === 'BANNED').length,
    };

    if (isPending || loading || !data?.user || data.user.role !== 'ADMIN') {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Manage Organizations</h1>
                <p className="mt-2 text-muted-foreground">
                    Review and approve organization applications
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-6 sm:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Pending</p>
                            <p className="text-2xl font-bold">{statusCounts.PENDING}</p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-500" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Approved</p>
                            <p className="text-2xl font-bold">{statusCounts.APPROVED}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Rejected</p>
                            <p className="text-2xl font-bold">{statusCounts.REJECTED}</p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-500" />
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Organizations</CardTitle>
                    <CardDescription>All organization applications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('ALL')}
                            >
                                All
                            </Button>
                            <Button
                                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('PENDING')}
                            >
                                Pending
                            </Button>
                            <Button
                                variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('APPROVED')}
                            >
                                Approved
                            </Button>
                            <Button
                                variant={statusFilter === 'REJECTED' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('REJECTED')}
                            >
                                Rejected
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrganizations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No organizations found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrganizations.map((org) => (
                                        <TableRow key={org.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{org.name}</p>
                                                    <p className="text-sm text-muted-foreground">{org.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{org.type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm">{org.user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{org.user.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {org.status === 'PENDING' && (
                                                    <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                                                        <Clock className="mr-1 h-3 w-3" />
                                                        Pending
                                                    </Badge>
                                                )}
                                                {org.status === 'APPROVED' && (
                                                    <Badge variant="outline" className="border-green-500 text-green-600">
                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                        Approved
                                                    </Badge>
                                                )}
                                                {org.status === 'REJECTED' && (
                                                    <Badge variant="outline" className="border-red-500 text-red-600">
                                                        <XCircle className="mr-1 h-3 w-3" />
                                                        Rejected
                                                    </Badge>
                                                )}
                                                {org.status === 'BANNED' && (
                                                    <Badge variant="destructive">
                                                        <Ban className="mr-1 h-3 w-3" />
                                                        Banned
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(org.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={actionLoading}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleView(org)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEdit(org)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>

                                                        {org.status === 'PENDING' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => handleApprove(org)}>
                                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                                    Approve
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedOrg(org);
                                                                        setShowRejectDialog(true);
                                                                    }}
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                    Reject
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}

                                                        {org.status === 'APPROVED' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedOrg(org);
                                                                        setShowBanDialog(true);
                                                                    }}
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    <Ban className="mr-2 h-4 w-4" />
                                                                    Ban
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}

                                                        {org.status === 'BANNED' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => handleUnban(org)}>
                                                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                                                    Unban
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}

                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedOrg(org);
                                                                setShowDeleteDialog(true);
                                                            }}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Organization</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting {selectedOrg?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="reason">Rejection Reason</Label>
                            <Textarea
                                id="reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Explain why this application is being rejected..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={!rejectionReason.trim() || actionLoading}
                        >
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Ban Dialog */}
            <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ban Organization</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for banning {selectedOrg?.name}. This will prevent them from creating new food listings.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="banReason">Ban Reason</Label>
                            <Textarea
                                id="banReason"
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                placeholder="Explain why this organization is being banned..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBanDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleBan}
                            disabled={!banReason.trim() || actionLoading}
                        >
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Ban Organization
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Organization Details</DialogTitle>
                        <DialogDescription>
                            Complete information about {selectedOrg?.name}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrg && (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-muted-foreground">Name</Label>
                                    <p className="mt-1 font-medium">{selectedOrg.name}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Type</Label>
                                    <p className="mt-1 font-medium capitalize">{selectedOrg.type.replace('_', ' ').toLowerCase()}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Email</Label>
                                    <p className="mt-1 font-medium">{selectedOrg.email}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Phone</Label>
                                    <p className="mt-1 font-medium">{selectedOrg.phone}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Address</Label>
                                <p className="mt-1 font-medium">{selectedOrg.address}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Description</Label>
                                <p className="mt-1 text-sm">{(selectedOrg as any).description || 'No description provided'}</p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-muted-foreground">Owner</Label>
                                    <p className="mt-1 font-medium">{selectedOrg.user.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedOrg.user.email}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <div className="mt-1">
                                        {selectedOrg.status === 'PENDING' && (
                                            <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>
                                        )}
                                        {selectedOrg.status === 'APPROVED' && (
                                            <Badge variant="outline" className="border-green-500 text-green-600">Approved</Badge>
                                        )}
                                        {selectedOrg.status === 'REJECTED' && (
                                            <Badge variant="destructive">Rejected</Badge>
                                        )}
                                        {selectedOrg.status === 'BANNED' && (
                                            <Badge variant="destructive">Banned</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Created At</Label>
                                <p className="mt-1 text-sm">{new Date(selectedOrg.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Organization</DialogTitle>
                        <DialogDescription>
                            Update organization information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="edit-name">Organization Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={editFormData.description}
                                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="edit-phone">Phone</Label>
                                <Input
                                    id="edit-phone"
                                    value={editFormData.phone}
                                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-address">Address</Label>
                                <Input
                                    id="edit-address"
                                    value={editFormData.address}
                                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={actionLoading}>
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{selectedOrg?.name}</strong>?
                            This will permanently delete the organization and all associated food listings.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={actionLoading}
                        >
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
