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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, Loader2, Search, Eye, Edit, Trash2, ShieldAlert, UserCog, MoreHorizontal, Ban, ShieldCheck } from 'lucide-react';
import { getAllUsers, updateUserRole, updateUserDetails, deleteUser, suspendUser, banUser, unbanUser } from '@/actions/admin';

type User = {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'STUDENT' | 'ORGANIZATION';
    phone: string | null;
    emailVerified: boolean;
    isBanned: boolean;
    bannedReason: string | null;
    createdAt: string;
    updatedAt: string;
    organization: {
        id: string;
        name: string;
        status: string;
    } | null;
    _count: {
        claims: number;
    };
};

export default function AdminUsersPage() {
    const { data, isPending } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'STUDENT' | 'ORGANIZATION'>('ALL');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [showBanDialog, setShowBanDialog] = useState(false);
    const [banReason, setBanReason] = useState('');
    const [newRole, setNewRole] = useState<'ADMIN' | 'STUDENT' | 'ORGANIZATION'>('STUDENT');
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (!isPending && (!data?.user || data.user.role !== 'ADMIN')) {
            router.push('/');
        }
    }, [data, isPending, router]);

    useEffect(() => {
        if (data?.user?.role === 'ADMIN') {
            fetchUsers();
        }
    }, [data]);

    const fetchUsers = async () => {
        try {
            const result = await getAllUsers();
            setUsers(result.users as any);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (user: User) => {
        setSelectedUser(user);
        setShowViewDialog(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setEditFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
        });
        setShowEditDialog(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedUser) return;

        setActionLoading(true);
        try {
            await updateUserDetails(selectedUser.id, editFormData);
            await fetchUsers();
            setShowEditDialog(false);
            setSelectedUser(null);
            toast.success('User updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleChangeRole = (user: User) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setShowRoleDialog(true);
    };

    const handleSaveRole = async () => {
        if (!selectedUser) return;

        setActionLoading(true);
        try {
            await updateUserRole(selectedUser.id, newRole);
            await fetchUsers();
            setShowRoleDialog(false);
            setSelectedUser(null);
            toast.success('User role updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update role');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSuspend = async (user: User) => {
        setActionLoading(true);
        try {
            await suspendUser(user.id);
            toast.success(`${user.name} has been logged out from all sessions`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to suspend user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;

        setActionLoading(true);
        try {
            await deleteUser(selectedUser.id);
            await fetchUsers();
            setShowDeleteDialog(false);
            setSelectedUser(null);
            toast.success('User deleted successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleBan = async () => {
        if (!selectedUser || !banReason.trim()) {
            toast.error('Please provide a reason for banning');
            return;
        }

        setActionLoading(true);
        try {
            await banUser(selectedUser.id, banReason);
            await fetchUsers();
            setShowBanDialog(false);
            setSelectedUser(null);
            setBanReason('');
            toast.success(`${selectedUser.name} has been banned`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to ban user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnban = async (user: User) => {
        setActionLoading(true);
        try {
            await unbanUser(user.id);
            await fetchUsers();
            toast.success(`${user.name} has been unbanned`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to unban user');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const roleCounts = {
        ADMIN: users.filter((u) => u.role === 'ADMIN').length,
        STUDENT: users.filter((u) => u.role === 'STUDENT').length,
        ORGANIZATION: users.filter((u) => u.role === 'ORGANIZATION').length,
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
                <h1 className="text-3xl font-bold">Manage Users</h1>
                <p className="mt-2 text-muted-foreground">
                    View and manage all platform users
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-6 sm:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Admins</p>
                            <p className="text-2xl font-bold">{roleCounts.ADMIN}</p>
                        </div>
                        <UserCog className="h-8 w-8 text-muted-foreground" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Students</p>
                            <p className="text-2xl font-bold">{roleCounts.STUDENT}</p>
                        </div>
                        <Users className="h-8 w-8 text-muted-foreground" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Organizations</p>
                            <p className="text-2xl font-bold">{roleCounts.ORGANIZATION}</p>
                        </div>
                        <Users className="h-8 w-8 text-muted-foreground" />
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>Manage user accounts and roles</CardDescription>
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
                                variant={roleFilter === 'ALL' ? 'default' : 'outline'}
                                onClick={() => setRoleFilter('ALL')}
                            >
                                All
                            </Button>
                            <Button
                                variant={roleFilter === 'ADMIN' ? 'default' : 'outline'}
                                onClick={() => setRoleFilter('ADMIN')}
                            >
                                Admins
                            </Button>
                            <Button
                                variant={roleFilter === 'STUDENT' ? 'default' : 'outline'}
                                onClick={() => setRoleFilter('STUDENT')}
                            >
                                Students
                            </Button>
                            <Button
                                variant={roleFilter === 'ORGANIZATION' ? 'default' : 'outline'}
                                onClick={() => setRoleFilter('ORGANIZATION')}
                            >
                                Organizations
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Claims</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        user.role === 'ADMIN'
                                                            ? 'destructive'
                                                            : user.role === 'ORGANIZATION'
                                                                ? 'default'
                                                                : 'secondary'
                                                    }
                                                >
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.organization ? (
                                                    <div>
                                                        <p className="text-sm">{user.organization.name}</p>
                                                        <Badge variant="outline" className="text-xs">
                                                            {user.organization.status}
                                                        </Badge>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{user._count.claims}</TableCell>
                                            <TableCell>
                                                {new Date(user.createdAt).toLocaleDateString()}
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
                                                        <DropdownMenuItem onClick={() => handleView(user)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleChangeRole(user)}>
                                                            <UserCog className="mr-2 h-4 w-4" />
                                                            Change Role
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleSuspend(user)}
                                                            disabled={actionLoading}
                                                        >
                                                            <ShieldAlert className="mr-2 h-4 w-4" />
                                                            Logout All Sessions
                                                        </DropdownMenuItem>

                                                        {!user.isBanned ? (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setShowBanDialog(true);
                                                                }}
                                                                disabled={actionLoading || user.id === data.user.id}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Ban className="mr-2 h-4 w-4" />
                                                                Ban User
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                onClick={() => handleUnban(user)}
                                                                disabled={actionLoading}
                                                            >
                                                                <ShieldCheck className="mr-2 h-4 w-4" />
                                                                Unban User
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setShowDeleteDialog(true);
                                                            }}
                                                            disabled={user.id === data.user.id}
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

            {/* View Dialog */}
            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                            Complete information about {selectedUser?.name}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-muted-foreground">Name</Label>
                                    <p className="mt-1 font-medium">{selectedUser.name}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Email</Label>
                                    <p className="mt-1 font-medium">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Role</Label>
                                    <div className="mt-1">
                                        <Badge
                                            variant={
                                                selectedUser.role === 'ADMIN'
                                                    ? 'destructive'
                                                    : selectedUser.role === 'ORGANIZATION'
                                                        ? 'default'
                                                        : 'secondary'
                                            }
                                        >
                                            {selectedUser.role}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Phone</Label>
                                    <p className="mt-1 font-medium">{selectedUser.phone || 'Not provided'}</p>
                                </div>
                            </div>
                            {selectedUser.organization && (
                                <div>
                                    <Label className="text-muted-foreground">Organization</Label>
                                    <p className="mt-1 font-medium">{selectedUser.organization.name}</p>
                                    <Badge variant="outline" className="mt-1">
                                        {selectedUser.organization.status}
                                    </Badge>
                                </div>
                            )}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-muted-foreground">Total Claims</Label>
                                    <p className="mt-1 font-medium">{selectedUser._count.claims}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Email Verified</Label>
                                    <p className="mt-1 font-medium">{selectedUser.emailVerified ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Joined</Label>
                                <p className="mt-1 text-sm">{new Date(selectedUser.createdAt).toLocaleString()}</p>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Name</Label>
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
                        <div>
                            <Label htmlFor="edit-phone">Phone</Label>
                            <Input
                                id="edit-phone"
                                value={editFormData.phone}
                                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                            />
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

            {/* Change Role Dialog */}
            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>
                            Update role for {selectedUser?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="role">New Role</Label>
                            <Select value={newRole} onValueChange={(value: any) => setNewRole(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="STUDENT">Student</SelectItem>
                                    <SelectItem value="ORGANIZATION">Organization</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveRole} disabled={actionLoading}>
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Change Role
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={actionLoading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Ban User Dialog */}
            <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ban User</DialogTitle>
                        <DialogDescription>
                            Ban {selectedUser?.name} from accessing the platform
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="banReason">Reason for Ban</Label>
                            <Input
                                id="banReason"
                                placeholder="Enter reason..."
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowBanDialog(false);
                            setBanReason('');
                        }}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleBan}
                            disabled={actionLoading || !banReason.trim()}
                        >
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Ban User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
