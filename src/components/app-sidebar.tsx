"use client"

import * as React from "react"
import {
  Building,
  ClipboardList,
  LayoutDashboard,
  Package,
  Settings,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSession } from "@/lib/use-auth"
import { usePathname, useRouter } from "next/navigation"
import { getSystemSettings } from "@/actions/admin"
import Link from "next/link"

const navItems = {
  ADMIN: [
    { url: '/dashboard/admin', title: 'Overview', icon: LayoutDashboard },
    { url: '/dashboard/admin/organizations', title: 'Organizations', icon: Building },
    { url: '/dashboard/admin/users', title: 'Users', icon: Users },
    { url: '/dashboard/admin/settings', title: 'Settings', icon: Settings },
  ],
  ORGANIZATION: [
    { url: '/dashboard/organization', title: 'Overview', icon: LayoutDashboard },
    { url: '/dashboard/organization/listings', title: 'Food Listings', icon: Package },
    { url: '/dashboard/organization/claims', title: 'Claims', icon: ClipboardList },
    { url: '/dashboard/organization/analytics', title: 'Analytics', icon: TrendingUp },
    { url: '/dashboard/organization/settings', title: 'Settings', icon: Settings },
  ],
  STUDENT: [
    { url: '/dashboard/student', title: 'Overview', icon: LayoutDashboard },
    { url: '/dashboard/student/browse', title: 'Browse Food', icon: UtensilsCrossed },
    { url: '/dashboard/student/claims', title: 'My Claims', icon: ClipboardList },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [platformName, setPlatformName] = React.useState('UM Eats');

  React.useEffect(() => {
    if (!isPending && !data?.user) {
      router.push('/login?callbackUrl=/dashboard');
    }
  }, [data, isPending, router]);

  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSystemSettings();
        setPlatformName(settings.platform_name);
      } catch (error) {
        // Keep default name if settings can't be loaded
        console.error('Failed to load platform name:', error);
      }
    };

    if (data?.user) {
      loadSettings();
    }
  }, [data?.user]);

  if (isPending || !data?.user) {
    return
  }

  const userRole = data.user.role;
  const navigation = navItems[userRole] || [];
  const userCard = {
    name: data.user.name,
    email: data.user.email,
    avatar: data.user.image || "",
  }


  return (
    <Sidebar
      {...props} variant="inset"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <UtensilsCrossed className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{platformName}</span>
                  <span className="truncate text-xs">Food Sharing Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigation} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userCard} />
      </SidebarFooter>
    </Sidebar>
  )
}
