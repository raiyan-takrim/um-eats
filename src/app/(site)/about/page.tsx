import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Heart, Users, TrendingUp } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="border-b bg-linear-to-b from-primary/5 to-background py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl text-center">
                            <h1 className="text-3xl font-bold md:text-4xl">About UMEats</h1>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Connecting students with surplus food while promoting sustainability and community support
                            </p>
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-12 md:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl">
                            <h2 className="mb-6 text-2xl font-bold md:text-3xl">Our Mission</h2>
                            <p className="mb-4 text-muted-foreground">
                                UMEats is a food redistribution platform designed specifically for the Universiti Malaya community.
                                We bridge the gap between organizations with surplus food and students in need, creating a win-win
                                solution that reduces waste while helping students access nutritious meals.
                            </p>
                            <p className="text-muted-foreground">
                                Our platform directly contributes to the United Nations Sustainable Development Goals (SDGs),
                                particularly SDG 2 (Zero Hunger) and SDG 12 (Responsible Consumption and Production), while
                                fostering a culture of sustainability and community care on campus.
                            </p>
                        </div>
                    </div>
                </section>

                {/* SDG Goals */}
                <section className="border-t bg-muted/30 py-12 md:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">
                            Supporting UN Sustainable Development Goals
                        </h2>

                        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                        <Users className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="mb-3 text-xl font-bold">SDG 2: Zero Hunger</h3>
                                    <p className="text-muted-foreground">
                                        We help ensure that no student goes hungry by connecting them with available food
                                        resources. By redistributing surplus food, we provide access to nutritious meals
                                        for students who need them most.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                        <TrendingUp className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="mb-3 text-xl font-bold">SDG 12: Responsible Consumption</h3>
                                    <p className="text-muted-foreground">
                                        We combat food waste by giving surplus food a second life. Our platform helps
                                        organizations practice responsible consumption patterns and reduce their environmental
                                        impact through smart food redistribution.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* How We Work */}
                <section className="py-12 md:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl">
                            <h2 className="mb-6 text-2xl font-bold md:text-3xl">How We Work</h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="mb-2 text-lg font-semibold">For Students</h3>
                                    <p className="text-muted-foreground">
                                        Students can browse available food listings from various organizations around campus,
                                        filter by dietary preferences (Halal, Vegetarian, Vegan), and claim items they want.
                                        The platform provides pickup locations and availability times, making it easy to
                                        collect food before it expires.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-2 text-lg font-semibold">For Organizations</h3>
                                    <p className="text-muted-foreground">
                                        Restaurants, cafes, event organizers, and catering services can list their leftover
                                        food on our platform. Each contribution helps build their SDG score and ranking,
                                        providing valuable brand visibility and recognition for their sustainability efforts.
                                        It's a powerful marketing tool that showcases their commitment to social responsibility.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-2 text-lg font-semibold">Ranking System</h3>
                                    <p className="text-muted-foreground">
                                        Organizations are ranked based on their total food saved (in kg), number of donations,
                                        consistency, and community impact. Higher rankings mean better visibility and brand
                                        recognition on campus, creating a positive incentive for continued participation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="border-t bg-muted/30 py-12 md:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">Our Values</h2>

                        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <Heart className="mx-auto mb-4 h-10 w-10 text-primary" />
                                    <h3 className="mb-2 font-semibold">Community First</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Supporting UM students and fostering a caring campus community
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6 text-center">
                                    <Award className="mx-auto mb-4 h-10 w-10 text-primary" />
                                    <h3 className="mb-2 font-semibold">Sustainability</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Reducing food waste and promoting responsible consumption
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6 text-center">
                                    <Users className="mx-auto mb-4 h-10 w-10 text-primary" />
                                    <h3 className="mb-2 font-semibold">Transparency</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Clear tracking and reporting of impact metrics
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Get Involved */}
                <section className="py-12 md:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="mb-4 text-2xl font-bold md:text-3xl">Get Involved</h2>
                            <p className="mb-6 text-muted-foreground">
                                Whether you're a student looking for meals or an organization wanting to make a difference,
                                UMEats welcomes you to join our sustainable food redistribution community.
                            </p>
                            <div className="flex flex-col justify-center gap-3 sm:flex-row">
                                <Card className="p-6">
                                    <h3 className="mb-2 font-semibold">Students</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Sign up and start browsing available food around campus
                                    </p>
                                </Card>
                                <Card className="p-6">
                                    <h3 className="mb-2 font-semibold">Organizations</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Register to list your surplus food and build your SDG ranking
                                    </p>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
