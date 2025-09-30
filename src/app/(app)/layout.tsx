
"use client";
import type { ReactNode } from "react";
import { LogOut, User, Settings, LayoutDashboard, Trophy, BookOpen, Users, School, Menu } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TestResultProvider } from "@/context/TestResultContext";
import { getUserProfile } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/achievements", label: "Achievements", icon: <Trophy className="h-5 w-5" /> },
    { href: "/parent/dashboard", label: "Parent View", icon: <Users className="h-5 w-5" /> },
    { href: "/teacher/dashboard", label: "Teacher View", icon: <School className="h-5 w-5" /> },
    { href: "/story/sanga", label: "Story", icon: <BookOpen className="h-5 w-5" /> },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState("guest");
  const [displayName, setDisplayName] = useState("Guest");
  const [userAvatar, setUserAvatar] = useState(`https://picsum.photos/seed/Guest/32/32`);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const fetchAndSetUserData = useCallback(async (user: import('firebase/auth').User | null) => {
    if (user) {
        const storedName = user.displayName || localStorage.getItem('userName');
        if (storedName) {
            setUserName(storedName);
            const profile = await getUserProfile(storedName);
            if (profile) {
                setDisplayName(profile.name || storedName);
            } else {
                setDisplayName(storedName);
            }
            if (!profile && pathname !== '/dashboard') { // Allow onboarding flow on dashboard
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

    } else {
        router.push('/');
    }
  }, [pathname, router]);

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        fetchAndSetUserData(user);
    });
    
    // Also listen for local storage changes for things like avatar updates
    const handleStorageChange = () => {
        const storedName = localStorage.getItem('userName');
        const storedAvatar = localStorage.getItem('userAvatar');
        if (storedName) {
            getUserProfile(storedName).then(profile => {
                setDisplayName(profile?.name || storedName);
            });
        }
        if (storedAvatar) setUserAvatar(storedAvatar);
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
        unsubscribe();
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchAndSetUserData]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    router.push('/');
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
    name: displayName,
    avatar: userAvatar,
  };

  return (
    <TestResultProvider>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
          
          <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
              <span className="font-bold">Lumio</span>
            </Link>
            {navItems.map((item) => (
                <Link key={item.href} href={item.href} 
                    className={cn("relative flex items-center gap-2 font-semibold transition-colors hover:text-primary",
                    pathname === item.href ? "text-primary" : "text-muted-foreground",
                    "after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-full after:bg-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100",
                    pathname === item.href && "after:scale-x-100"
                    )}
                >
                    {item.icon}
                    {item.label}
                </Link>
            ))}
          </nav>

           <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                   <span className="font-bold">Lumio</span>
                </Link>
                <Separator />
                {navItems.map((item) => (
                     <Link
                        key={item.href}
                        href={item.href}
                        className={cn("flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground", pathname === item.href && "bg-muted text-foreground")}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

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
        <main className="flex min-h-[calc(100vh_-_4rem)] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-8">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </TestResultProvider>
  );
}
