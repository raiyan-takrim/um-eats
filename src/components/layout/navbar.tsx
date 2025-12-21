'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, UtensilsCrossed, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from '@/lib/use-auth';
import { signOut, signIn } from '@/lib/auth-client';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
    const { data, isPending } = useSession();
    const pathname = usePathname();
    const user = data?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    const handleSignOut = async () => {
        await signOut();
    };

    // const handleSignIn = async () => {
    //     await signIn.social({
    //         provider: 'google',
    //         callbackURL: pathname === '/' && typeof window !== 'undefined'
    //             ? window.location.href
    //             : '/',
    //     });
    // };

    return (
        <>
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
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname === '/' ? 'text-primary font-semibold' : 'text-muted-foreground'
                                )}
                            >
                                Home
                            </Link>
                            <Link
                                href="/rankings"
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname === '/rankings' ? 'text-primary font-semibold' : 'text-muted-foreground'
                                )}
                            >
                                Rankings
                            </Link>
                            <Link
                                href="/about"
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname === '/about' ? 'text-primary font-semibold' : 'text-muted-foreground'
                                )}
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
                                        <div className="hidden md:flex md:items-center md:space-x-2">
                                            <Button asChild variant="default">
                                                <Link href="/dashboard">Dashboard</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="hidden md:flex md:space-x-2">
                                            <Button asChild>
                                                <Link href='/login?callbackUrl=/dashboard'>
                                                    Sign In with Google
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Mobile Menu Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu - Collapsible */}
                <div
                    className={cn(
                        "md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t",
                        mobileMenuOpen ? "max-h-screen" : "max-h-0"
                    )}
                >
                    <div className="container mx-auto px-4 py-4 space-y-4">
                        {/* User Info */}
                        {user && (
                            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                                    <AvatarFallback>
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Links */}
                        <div className="flex flex-col space-y-1">
                            <Link
                                href="/"
                                className={cn(
                                    "px-4 py-2.5 text-sm font-medium rounded-md transition-colors",
                                    pathname === '/'
                                        ? 'bg-primary/10 text-primary'
                                        : 'hover:bg-muted'
                                )}
                            >
                                Home
                            </Link>
                            <Link
                                href="/rankings"
                                className={cn(
                                    "px-4 py-2.5 text-sm font-medium rounded-md transition-colors",
                                    pathname === '/rankings'
                                        ? 'bg-primary/10 text-primary'
                                        : 'hover:bg-muted'
                                )}
                            >
                                Rankings
                            </Link>
                            <Link
                                href="/about"
                                className={cn(
                                    "px-4 py-2.5 text-sm font-medium rounded-md transition-colors",
                                    pathname === '/about'
                                        ? 'bg-primary/10 text-primary'
                                        : 'hover:bg-muted'
                                )}
                            >
                                About
                            </Link>
                        </div>

                        {/* User Actions */}
                        {user ? (
                            <div className="flex flex-col space-y-2 pt-2">
                                <Button asChild variant="default" className="w-full justify-start">
                                    <Link href="/dashboard">
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleSignOut}
                                    className="w-full justify-start"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <Button asChild className="w-full">
                                <Link href="/login?callbackUrl=/dashboard">
                                    Sign In with Google
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Backdrop overlay when mobile menu is open */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </>
    );
}
