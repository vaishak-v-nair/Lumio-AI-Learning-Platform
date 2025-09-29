

"use client";
import type { ReactNode } from "react";
import { LogOut, User, Settings } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LumioLogo } from "@/components/LumioLogo";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TestResultProvider } from "@/context/TestResultContext";
import { getUserProfile } from "@/lib/firestore";
import { Button } from "@/components/ui/button";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState("Guest");
  const [userAvatar, setUserAvatar] = useState(`https://picsum.photos/seed/Guest/32/32`);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const fetchAndSetUserData = useCallback(async () => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
      const profile = await getUserProfile(storedName);
      if (!profile && pathname !== '/onboarding') {
        router.push('/dashboard');
      }
    } else {
      router.push('/');
    }

    const storedAvatar = localStorage.getItem('userAvatar');
    if (storedAvatar) {
      setUserAvatar(storedAvatar);
    } else if (storedName) {
      setUserAvatar(`https://picsum.photos/seed/${storedName}/32/32`);
    }
  }, [pathname, router]);

  useEffect(() => {
    setIsClient(true);
    fetchAndSetUserData();

    // Listen for storage changes to update user info in real-time
    window.addEventListener('storage', fetchAndSetUserData);
    return () => {
      window.removeEventListener('storage', fetchAndSetUserData);
    };
  }, [fetchAndSetUserData]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  if (!isClient) {
    return (
        <div className="flex min-h-screen">
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

  return (
    <TestResultProvider>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
          <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
              <LumioLogo />
              <span>Lumio</span>
            </Link>
            <Link href="/dashboard" className="text-foreground transition-colors hover:text-foreground">
              Dashboard
            </Link>
             <Link href="/achievements" className="text-muted-foreground transition-colors hover:text-foreground">
              Achievements
            </Link>
             <Link href="/profile" className="text-muted-foreground transition-colors hover:text-foreground">
              Profile
            </Link>
          </nav>
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className="ml-auto flex-1 sm:flex-initial" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt="User avatar" />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex min-h-[calc(100vh_-_4rem)] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
          {children}
        </main>
      </div>
    </TestResultProvider>
  );
}
