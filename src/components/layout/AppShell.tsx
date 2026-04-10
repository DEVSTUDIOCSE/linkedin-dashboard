'use client';

import { useAuth } from '@/contexts/AuthContext';
import { APIBook } from '@/lib/firebase/services';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { LayoutGrid, User, LogOut, KeyRound, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  return (email?.[0] ?? '?').toUpperCase();
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    const result = await APIBook.auth.signOut();
    if (result.success) {
      router.replace('/login');
    } else {
      toast.error('Failed to sign out');
    }
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-14 items-center gap-6 px-4 max-w-7xl">
          {/* Brand */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-foreground tracking-tight shrink-0 hover:opacity-80 transition-opacity"
          >
            {/* LinkedIn-inspired "in" logo mark */}
            <span className="flex h-7 w-7 items-center justify-center rounded bg-[#0A66C2] text-white text-xs font-black select-none">
              in
            </span>
            <span className="hidden sm:block text-sm">LinkedIn Dashboard</span>
          </Link>

          <Separator orientation="vertical" className="h-5 hidden sm:block" />

          {/* Nav links */}
          <nav className="flex items-center gap-1 flex-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full p-0 ring-2 ring-border/40 hover:ring-[#0A66C2]/40 transition-all"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                    <AvatarFallback className="text-xs bg-[#0A66C2] text-white font-semibold">
                      {getInitials(user.displayName, user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-semibold leading-none truncate">
                      {user.displayName ?? 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/change-password" className="cursor-pointer">
                    <KeyRound className="mr-2 h-4 w-4" />
                    Change password
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/delete-account" className="cursor-pointer text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* Page content */}
      <main>{children}</main>
    </div>
  );
}
