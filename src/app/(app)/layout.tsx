
"use client";
import type { ReactNode } from "react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarSeparator } from "@/components/ui/sidebar";
import { LayoutDashboard, LogOut, GraduationCap, User, Trophy, Settings, Users } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LumioLogo } from "@/components/LumioLogo";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { TestResultProvider } from "@/context/TestResultContext";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState("Guest");
  const [userAvatar, setUserAvatar] = useState(`https://picsum.photos/seed/Guest/32/32`);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
    const storedAvatar = localStorage.getItem('userAvatar');
    if (storedAvatar) {
      setUserAvatar(storedAvatar);
    } else if (storedName) {
      setUserAvatar(`https://picsum.photos/seed/${storedName}/32/32`);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('testResults');
    localStorage.removeItem('userBio');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('lastTestResultId');
    localStorage.removeItem('lastTestResult');
    localStorage.removeItem('onboardingComplete');
    // Redirect to login page after logout
    window.location.href = '/';
  };

  if (!isClient) {
    return (
        <div className="flex min-h-screen">
          <div className="hidden md:block w-64" />
           <div className="flex-1">
             <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6"/>
             <main className="flex-1 p-4 sm:p-6">
             </main>
           </div>
        </div>
    );
  }

  const user = {
    name: userName,
    avatar: userAvatar,
  };

  const isActive = (path: string) => pathname === path;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
              <LumioLogo />
              <span className="group-data-[collapsible=icon]:hidden">Lumio</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard" isActive={isActive('/dashboard')}>
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="My Achievements" isActive={isActive('/achievements')}>
                  <Link href="/achievements">
                    <Trophy />
                    <span>My Achievements</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <SidebarGroup>
              <SidebarGroupLabel>Perspectives</SidebarGroupLabel>
              <SidebarMenu>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Teacher Dashboard" isActive={isActive('/teacher/dashboard')}>
                    <Link href="/teacher/dashboard">
                      <GraduationCap />
                      <span>Teacher</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Parent Dashboard" isActive={isActive('/parent/dashboard')}>
                    <Link href="/parent/dashboard">
                      <Users />
                      <span>Parent</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
           <SidebarFooter className="border-t border-sidebar-border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={cn(
                    "flex w-full items-center gap-2 overflow-hidden rounded-full p-2 text-left text-sm outline-none transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                  )}>
                     <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt="User avatar" />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="group-data-[collapsible=icon]:hidden font-medium truncate">{user.name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" side="right" sideOffset={8}>
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
           </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center justify-center border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6">
            <div className="flex items-center gap-4 md:hidden">
                <SidebarTrigger />
            </div>
          </header>
          <main className="flex-1">
              <div className="mx-auto w-full max-w-4xl p-4 sm:p-6">
                <TestResultProvider>
                    {children}
                </TestResultProvider>
              </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
