'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, UtensilsCrossed, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from '@/lib/use-auth';
import { signOut, signIn } from '@/lib/auth-client';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
    const { data, isPending } = useSession();
    const pathname = usePathname();
    const user = data?.user;

    const handleSignOut = async () => {
        await signOut();
    };

    const handleSignIn = async () => {
        await signIn.social({
            provider: 'google',
            callbackURL: pathname === '/' && typeof window !== 'undefined'
                ? window.location.href
                : '/',
        });
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <UtensilsCrossed className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">UMEats</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-6">
                        <Link
                            href="/"
                            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/' ? 'text-primary font-semibold' : 'text-muted-foreground'
                                }`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/rankings"
                            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/rankings' ? 'text-primary font-semibold' : 'text-muted-foreground'
                                }`}
                        >
                            Rankings
                        </Link>
                        <Link
                            href="/about"
                            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/about' ? 'text-primary font-semibold' : 'text-muted-foreground'
                                }`}
                        >
                            About
                        </Link>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-2">
                        <ThemeToggle />

                        {!isPending && (
                            <>
                                {user ? (
                                    <div className="hidden md:flex md:space-x-2">
                                        <Link href="/dashboard">
                                            Dashboard
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="hidden md:flex md:space-x-2">
                                        <Button onClick={handleSignIn}>
                                            Sign In with Google
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Mobile Menu */}
                        <div className="md:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">Open menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link href="/" className="w-full">Home</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/food" className="w-full">Browse Food</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/rankings" className="w-full">Rankings</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/about" className="w-full">About</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {user ? (
                                        <>
                                            <DropdownMenuLabel>
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-medium">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {user.role === 'ADMIN' && (
                                                <DropdownMenuItem asChild>
                                                    <Link href="/dashboard/admin" className="w-full">Dashboard</Link>
                                                </DropdownMenuItem>
                                            )}
                                            {user.role === 'ORGANIZATION' && (
                                                <DropdownMenuItem asChild>
                                                    <Link href="/dashboard/organization" className="w-full">Dashboard</Link>
                                                </DropdownMenuItem>
                                            )}
                                            {user.role === 'STUDENT' && (
                                                <>
                                                    <DropdownMenuItem asChild>
                                                        <Link href="/dashboard/student" className="w-full">Dashboard</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href="/register" className="w-full">Register Organization</Link>
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            <DropdownMenuItem asChild>
                                                <Link href="/profile" className="w-full">Profile</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                                                Sign Out
                                            </DropdownMenuItem>
                                        </>
                                    ) : (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link href="/login" className="w-full">Sign In</Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
