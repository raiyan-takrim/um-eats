import Link from 'next/link';
import { UtensilsCrossed, Mail } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* Brand */}
                    <div className="space-y-3">
                        <Link href="/" className="flex items-center space-x-2">
                            <UtensilsCrossed className="h-6 w-6 text-primary" />
                            <span className="text-lg font-bold">UMEats</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Fighting food waste, feeding students. Supporting SDG 2 & 12.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/rankings" className="text-muted-foreground hover:text-primary">
                                    Rankings
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-muted-foreground hover:text-primary">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-muted-foreground hover:text-primary">
                                    Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold">Contact</h3>
                        <a href="mailto:support@umeats.edu.my" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                            <Mail className="h-4 w-4" />
                            <span>support@umeats.edu.my</span>
                        </a>
                        <p className="mt-3 text-xs text-muted-foreground">
                            Universiti Malaya<br />
                            Kuala Lumpur, Malaysia
                        </p>
                    </div>
                </div>

                <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} UMEats. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
