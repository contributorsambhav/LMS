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
    // Extract tab from href
    const url = new URL(href, 'http://localhost');
    const linkTab = url.searchParams.get('tab') || '';

    // Exact path match
    const pathMatch = pathname === url.pathname;

    // Tab match
    const tabMatch = currentTab === linkTab;

    return pathMatch && tabMatch;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* 1. Mobile Header (Only on small viewports) */}
      <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 backdrop-blur-md md:hidden fixed top-0 left-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${roleMetadata.highlight} shadow-md`}>
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold tracking-wide text-white text-base font-display">LumenLMS</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* 2. Responsive Sidebar (Desktop Left Drawer & Mobile slide-over) */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-900 bg-zinc-950 transition-all duration-300 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Brand Logo */}
        <div className="flex h-20 items-center justify-between border-b border-zinc-900 px-6">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${roleMetadata.highlight} shadow-lg`}>
              <RoleIcon className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold tracking-wide text-white text-lg font-display">LumenLMS</span>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{roleMetadata.title}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white md:hidden transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          <div className="px-3 mb-2">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Main Console</p>
          </div>
          {navLinks.map((link) => {
            const LinkIcon = IconMap[link.icon] || Settings;
            const active = isLinkActive(link.href);
            return (
              <Link key={link.label} href={link.href} onClick={() => setSidebarOpen(false)} className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${active ? `bg-white/5 border border-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]` : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
                <LinkIcon className={`h-4.5 w-4.5 transition-colors ${active ? 'text-purple-400' : 'text-zinc-500 group-hover:text-white'}`} />
                <span>{link.label}</span>
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="border-t border-zinc-900 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-zinc-900/30 p-3 border border-zinc-900">
            <img src={user.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`} alt={user.name} className="h-10 w-10 rounded-xl bg-zinc-800 object-cover shadow-[0_0_10px_rgba(255,255,255,0.05)]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white leading-none">{user.name}</p>
              <p className="truncate text-[10px] text-zinc-500 mt-1">{user.email}</p>
              <span className={`inline-block mt-1.5 rounded-full border px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-widest leading-none ${roleMetadata.badge}`}>{user.role}</span>
            </div>

            <button onClick={handleSignOut} disabled={loggingOut} title="Sign Out" className="rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 3. Backdrop for Mobile sidebar overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-45 bg-black/60 backdrop-blur-sm md:hidden" />}

      {/* 4. Main Viewport Panel */}
      <main className="flex flex-1 flex-col overflow-hidden pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto bg-zinc-950 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <UserProvider user={user}>{children}</UserProvider>
          </div>
        </div>
      </main>
    </div>
  );
}
