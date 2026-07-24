'use client';

import { Activity, BarChart3, BookOpen, Building, Calendar, CheckSquare, CreditCard, FolderGit2, GraduationCap, LogOut, Menu, MessageCircle, Settings, ShieldCheck, Users, X, ClipboardCheck } from 'lucide-react';
import React, { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import Link from 'next/link';
import { UserProvider } from '../../lib/session';

const IconMap: Record<string, React.ComponentType<any>> = {
  BarChart3,
  BookOpen,
  Calendar,
  FolderGit2,
  Settings,
  Users,
  Building,
  CreditCard,
  Activity,
  GraduationCap,
  ShieldCheck,
  MessageCircle,
  CheckSquare,
  ClipboardCheck
};

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export interface ClientLayoutShellProps {
  user: {
    name: string;
    email: string;
    role: string;
    picture?: string;
  };
  navLinks: NavItem[];
  roleMetadata: {
    title: string;
    icon: string;
  };
  children: React.ReactNode;
}

import { ThemeToggle } from '../../components/ThemeToggle';

export default function ClientLayoutShell({ user, navLinks, roleMetadata, children }: ClientLayoutShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || '';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch('/api/auth/session', {
        method: 'DELETE'
      });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoggingOut(false);
    }
  };

  const RoleIcon = IconMap[roleMetadata.icon] || GraduationCap;

  // Active check helper
  const isLinkActive = (href: string) => {
    const url = new URL(href, 'http://localhost');
    const linkTab = url.searchParams.get('tab') || '';
    const pathMatch = pathname === url.pathname;
    const tabMatch = currentTab === linkTab;
    return pathMatch && tabMatch;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans antialiased">
      {/* Mobile Header */}
      <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-card px-4 md:hidden fixed top-0 left-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <RoleIcon className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight text-foreground text-sm">LumenLMS</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setSidebarOpen(true)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand */}
        <div className="flex h-14 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <RoleIcon className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold tracking-tight text-foreground text-sm">LumenLMS</span>
              <p className="text-[10px] font-medium text-muted-foreground">{roleMetadata.title}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden transition-colors cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
          {navLinks.map((link) => {
            const LinkIcon = IconMap[link.icon] || Settings;
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors relative ${
                  active
                    ? 'bg-primary/5 text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                {/* Purple left indicator for active state */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                )}
                <LinkIcon className={`h-4 w-4 shrink-0 transition-colors ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-md p-2.5">
            <img
              src={user.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="h-8 w-8 rounded-full bg-muted object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-foreground leading-none">{user.name}</p>
              <p className="truncate text-[11px] text-muted-foreground mt-0.5">{user.email}</p>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <ThemeToggle />
              <button onClick={handleSignOut} disabled={loggingOut} title="Sign Out" className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50 cursor-pointer">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-45 bg-black/40 md:hidden" />}

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden pt-14 md:pt-0">
        <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            <UserProvider user={user}>{children}</UserProvider>
          </div>
        </div>
      </main>
    </div>
  );
}
