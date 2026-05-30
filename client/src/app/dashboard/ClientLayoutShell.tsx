'use client';

import { Activity, ArrowUpRight, BarChart3, BookOpen, Building, Calendar, CreditCard, FolderGit2, GraduationCap, LogOut, Menu, Settings, ShieldCheck, Sparkles, Users, X } from 'lucide-react';
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
  ShieldCheck
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
    highlight: string;
    text: string;
    badge: string;
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
      {/* 1. Mobile Header (Only on small viewports) */}
      <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-border bg-card/85 px-4 backdrop-blur-md md:hidden fixed top-0 left-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
            <RoleIcon className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight text-foreground text-sm font-sans">LumenLMS</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setSidebarOpen(true)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* 2. Responsive Sidebar (Desktop Left Drawer & Mobile slide-over) */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-all duration-300 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Brand Logo */}
        <div className="flex h-20 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
              <RoleIcon className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <span className="font-semibold tracking-tight text-foreground text-md font-sans">LumenLMS</span>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{roleMetadata.title}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden transition-colors cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          <div className="px-3 mb-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Main Console</p>
          </div>
          {navLinks.map((link) => {
            const LinkIcon = IconMap[link.icon] || Settings;
            const active = isLinkActive(link.href);
            return (
              <Link key={link.label} href={link.href} onClick={() => setSidebarOpen(false)} className={`group flex items-center gap-3 rounded-md px-3.5 py-2.5 text-xs font-medium transition-colors ${active ? 'bg-secondary text-foreground border border-border' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
                <LinkIcon className={`h-4 w-4 transition-colors ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <span>{link.label}</span>
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-md bg-secondary/20 p-3 border border-border">
            <img src={user.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`} alt={user.name} className="h-9 w-9 rounded-md bg-muted object-cover border border-border" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground leading-none">{user.name}</p>
              <p className="truncate text-[10px] text-muted-foreground mt-1">{user.email}</p>
              <span className={`inline-block mt-1.5 rounded-md border px-2 py-0.5 text-[8px] font-medium uppercase tracking-wider leading-none bg-primary/10 text-primary border-primary/20`}>{user.role}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <ThemeToggle />
              <button onClick={handleSignOut} disabled={loggingOut} title="Sign Out" className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50 cursor-pointer">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 3. Backdrop for Mobile sidebar overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-45 bg-black/40 backdrop-blur-sm md:hidden" />}

      {/* 4. Main Viewport Panel */}
      <main className="flex flex-1 flex-col overflow-hidden pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <UserProvider user={user}>{children}</UserProvider>
          </div>
        </div>
      </main>
    </div>
  );
}
