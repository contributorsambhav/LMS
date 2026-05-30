import ClientLayoutShell from './ClientLayoutShell';
import Link from 'next/link';
import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Clock, Ban } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('lms-session');

  if (!sessionCookie) {
    redirect('/login');
  }

  let user = null;
  try {
    user = JSON.parse(decodeURIComponent(sessionCookie.value));
  } catch (e) {
    redirect('/login');
  }

  if (!user || !user.role) {
    redirect('/login');
  }

  // Handle Pending or Suspended statuses with locked screens
  if (user.status === 'Pending') {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full text-center relative overflow-hidden">
          <div className="relative">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-md bg-amber-500/10 mb-6 border border-amber-500/20">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2 tracking-tight">Approval Pending</h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              {user.role === 'admin' || user.role === 'InstituteAdmin'
                ? "Your Institute Administrator account is currently pending review by the Super Admin. You will receive access once approved." 
                : "Your account is currently pending approval by your Institute Administrator. You will receive access once approved."}
            </p>
            <a href="/api/auth/logout" className="inline-flex w-full justify-center items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Return to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (user.status === 'Suspended') {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full text-center relative overflow-hidden">
          <div className="relative">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-md bg-destructive/10 mb-6 border border-destructive/20">
              <Ban className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2 tracking-tight">Account Suspended</h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Your account has been suspended by the platform administrator. You currently do not have access to the LMS portal.
            </p>
            <a href="/api/auth/logout" className="inline-flex w-full justify-center items-center gap-2 rounded-md bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors">
              Sign Out
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Define navigation links dynamically based on user role
  const getNavLinks = (role: string): NavItem[] => {
    switch (role) {
      case 'student':
        return [
          { label: 'Overview', href: '/dashboard/student', icon: 'BarChart3' },
          { label: 'My Courses', href: '/dashboard/student?tab=courses', icon: 'BookOpen' },
          { label: 'Schedule & Calendar', href: '/dashboard/student?tab=calendar', icon: 'Calendar' },
          { label: 'Gradebook', href: '/dashboard/student?tab=grades', icon: 'FolderGit2' },
          { label: 'Portal Settings', href: '/dashboard/student?tab=settings', icon: 'Settings' }
        ];
      case 'faculty':
        return [
          { label: 'Faculty Hub', href: '/dashboard/faculty', icon: 'BarChart3' },
          { label: 'Curriculums', href: '/dashboard/faculty?tab=courses', icon: 'BookOpen' },
          { label: 'Grade Submissions', href: '/dashboard/faculty?tab=grades', icon: 'FolderGit2' },
          { label: 'Students Directory', href: '/dashboard/faculty?tab=students', icon: 'Users' },
          { label: 'Classroom Manager', href: '/dashboard/faculty?tab=settings', icon: 'Settings' }
        ];
      case 'admin':
        return [
          { label: 'Analytics Hub', href: '/dashboard/admin', icon: 'BarChart3' },
          { label: 'Institute Rosters', href: '/dashboard/admin?tab=rosters', icon: 'Users' },
          { label: 'Department Planning', href: '/dashboard/admin?tab=departments', icon: 'Building' },
          { label: 'Invoicing & Billing', href: '/dashboard/admin?tab=billing', icon: 'CreditCard' },
          { label: 'Global Settings', href: '/dashboard/admin?tab=settings', icon: 'Settings' }
        ];
      case 'super':
        return [
          { label: 'Global Analytics', href: '/dashboard/super', icon: 'BarChart3' },
          { label: 'LMS Tenants', href: '/dashboard/super?tab=tenants', icon: 'Building' },
          { label: 'Billing & Plans', href: '/dashboard/super?tab=billing', icon: 'CreditCard' },
          { label: 'Platform Health', href: '/dashboard/super?tab=health', icon: 'Activity' },
          { label: 'Engine Settings', href: '/dashboard/super?tab=settings', icon: 'Settings' }
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks(user.role);

  // Mapped roles theme label
  const roleMetadata = {
    student: { title: 'Student Portal', highlight: 'from-blue-600 to-indigo-500', text: 'text-blue-400', badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20', icon: 'GraduationCap' },
    faculty: { title: 'Faculty Console', highlight: 'from-emerald-600 to-teal-500', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', icon: 'BookOpen' },
    admin: { title: 'Institute Console', highlight: 'from-amber-600 to-orange-500', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20', icon: 'Users' },
    super: { title: 'Super Console', highlight: 'from-purple-600 to-fuchsia-500', text: 'text-purple-400', badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20', icon: 'ShieldCheck' }
  }[user.role as 'student' | 'faculty' | 'admin' | 'super'];

  return (
    <ClientLayoutShell user={user} navLinks={navLinks} roleMetadata={roleMetadata}>
      {children}
    </ClientLayoutShell>
  );
}
