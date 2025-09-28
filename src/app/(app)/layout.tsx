
"use client";
import type { ReactNode } from "react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, LogOut, GraduationCap, User, BarChart, Trophy, Settings } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LumioLogo } from "@/components/LumioLogo";
import { useEffect, useState } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState("Guest");
  const [userAvatar, setUserAvatar] = useState(`https://picsum.photos/seed/Guest/32/32`);

  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    }
  }, []);

  const user = {
    name: userName,
    avatar: userAvatar,
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userName');
      localStorage.removeItem('testResults');
      localStorage.removeItem('userBio');
      localStorage.removeItem('userAvatar');
    }
  };

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
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="My Achievements">
                  <Link href="/achievements">
                    <Trophy />
                    <span>My Achievements</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Teacher Dashboard">
                  <Link href="/teacher/dashboard">
                    <GraduationCap />
                    <span>Teacher</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Parent Dashboard">
                  <Link href="/parent/dashboard">
                    <User />
                    <span>Parent</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Story Demo">
                  <Link href="/story/sanga">
                    <BarChart />
                    <span>Story</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <div className="ml-auto flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="overflow-hidden rounded-full"
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar} alt="User avatar" />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                     <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                     </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                     <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                     </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 sm:py-6 space-y-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
