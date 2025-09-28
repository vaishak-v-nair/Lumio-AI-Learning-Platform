import type { ReactNode } from "react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, BookCopy, LogOut, GraduationCap, User, BarChart, Trophy } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LumioLogo } from "@/components/LumioLogo";

export default function AppLayout({ children }: { children: ReactNode }) {
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
                <SidebarMenuButton asChild tooltip="Dashboard" isActive={true}>
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="My Tests">
                  <Link href="#">
                    <BookCopy />
                    <span>My Tests</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="My Achievements">
                  <Link href="#">
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
                      <AvatarImage src="https://picsum.photos/seed/user-avatar/32/32" alt="User avatar" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 space-y-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
