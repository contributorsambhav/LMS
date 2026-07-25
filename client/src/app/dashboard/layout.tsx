import ClientLayoutShell from './ClientLayoutShell';
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
        <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full text-center">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-md bg-amber-50 dark:bg-amber-500/10 mb-6 border border-amber-200 dark:border-amber-500/20">
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
    );
  }

  if (user.status === 'Suspended') {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full text-center">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-md bg-red-50 dark:bg-destructive/10 mb-6 border border-red-200 dark:border-destructive/20">
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
    );
  }

  // Define navigation links dynamically based on user role
  const getNavLinks = (role: string): NavItem[] => {
    switch (role) {
      case 'student':
        return [
          { label: 'Dashboard', href: '/dashboard/student', icon: 'BarChart3' },
          { label: 'My Courses', href: '/dashboard/student?tab=courses', icon: 'BookOpen' },
          { label: 'Schedule', href: '/dashboard/student?tab=calendar', icon: 'Calendar' },
          { label: 'Pending Tasks', href: '/dashboard/student?tab=tasks', icon: 'CheckSquare' },
          { label: 'Profile', href: '/dashboard/student?tab=profile', icon: 'Settings' }
        ];
      case 'faculty':
        return [
          { label: 'Dashboard', href: '/dashboard/faculty', icon: 'BarChart3' },
          { label: 'My Courses', href: '/dashboard/faculty?tab=courses', icon: 'BookOpen' },
          { label: 'Schedule', href: '/dashboard/faculty?tab=calendar', icon: 'Calendar' },
          { label: 'Grading', href: '/dashboard/faculty?tab=grading', icon: 'ClipboardCheck' },
          { label: 'Approvals', href: '/dashboard/faculty?tab=approvals', icon: 'CheckSquare' },
          { label: 'Profile', href: '/dashboard/faculty?tab=affiliation', icon: 'Settings' }
        ];
      case 'admin':
        return [
          { label: 'Dashboard', href: '/dashboard/admin', icon: 'BarChart3' },
          { label: 'Courses', href: '/dashboard/admin?tab=courses', icon: 'BookOpen' },
          { label: 'People', href: '/dashboard/admin?tab=rosters', icon: 'Users' },
          { label: 'Approvals', href: '/dashboard/admin?tab=approvals', icon: 'CheckSquare' },
          { label: 'Billing', href: '/dashboard/admin?tab=billing', icon: 'CreditCard' },
          { label: 'Settings', href: '/dashboard/admin?tab=settings', icon: 'Settings' }
        ];
      case 'super':
        return [
          { label: 'Dashboard', href: '/dashboard/super', icon: 'BarChart3' },
          { label: 'Tenants', href: '/dashboard/super?tab=tenants', icon: 'Building' },
          { label: 'Platform Health', href: '/dashboard/super?tab=health', icon: 'Activity' },
          { label: 'Settings', href: '/dashboard/super?tab=settings', icon: 'Settings' }
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks(user.role);

  // Simplified role metadata — no more per-role gradient colors
  const roleMetadata = {
    student: { title: 'Student Portal', icon: 'GraduationCap' },
    faculty: { title: 'Faculty Console', icon: 'BookOpen' },
    admin: { title: 'Institute Admin', icon: 'Users' },
    super: { title: 'Super Admin', icon: 'ShieldCheck' }
  }[user.role as 'student' | 'faculty' | 'admin' | 'super'] || { title: 'Portal', icon: 'GraduationCap' };

  return (
    <ClientLayoutShell user={user} navLinks={navLinks} roleMetadata={roleMetadata}>
      {children}
    </ClientLayoutShell>
  );
}
