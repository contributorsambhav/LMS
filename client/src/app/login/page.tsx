'use client';

import { AlertTriangle, BookOpen, ChevronRight, GraduationCap, Info, Layers, ShieldCheck, User, Users } from 'lucide-react';
import React, { Suspense, useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter, useSearchParams } from 'next/navigation';

// Wrap search params reading in a Suspense boundary to comply with Next.js Client Component requirements
function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const errorParam = searchParams.get('error');
  const simRoleParam = searchParams.get('sim_role') || 'student';

  const [loadingRole, setLoadingRole] = useState<'student' | 'faculty' | 'admin' | 'super' | null>(null);
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'admin' | 'super'>('student');
  const [showPendingAlert, setShowPendingAlert] = useState(false);
  const [superCode, setSuperCode] = useState('');
  const [superCodeError, setSuperCodeError] = useState('');

  useEffect(() => {
    if (errorParam === 'no_credentials') {
      toast.error('Google OAuth credentials missing or invalid.', { theme: "dark", autoClose: 5000 });
      router.replace('/login');
    } else if (errorParam === 'pending_approval') {
      setShowPendingAlert(true);
      if (simRoleParam) {
        setSelectedRole(simRoleParam as any);
      }
    } else if (errorParam === 'backend_auth_failed') {
      const details = searchParams.get('details');
      let msg = "Authentication failed. Please check your account details.";
      try {
        if (details) msg = JSON.parse(decodeURIComponent(details)).message || msg;
      } catch (e) {}
      
      toast.error(msg, { theme: "dark", autoClose: 6000 });
      router.replace('/login');
    } else if (errorParam === 'suspended_account') {
      toast.error('Your account has been suspended by the platform administrator. Access denied.', { theme: "dark", autoClose: 5000 });
      router.replace('/login');
    } else if (errorParam === 'role_mismatch') {
      const msg = searchParams.get('msg') || "Role mismatch: Your email is registered under a different role.";
      toast.error(msg, { theme: "dark", autoClose: 6000 });
      router.replace('/login');
    } else if (errorParam === 'oauth_internal_error') {
      const msg = searchParams.get('msg') || "An internal error occurred during authentication.";
      toast.error(`OAuth Error: ${msg}`, { theme: "dark", autoClose: 5000 });
      router.replace('/login');
    } else if (errorParam === 'token_exchange_failed' || errorParam === 'fetch_userinfo_failed' || errorParam === 'no_code') {
      toast.error('Failed to communicate with Google Authentication. Please try again.', { theme: "dark", autoClose: 5000 });
      router.replace('/login');
    }
  }, [errorParam, simRoleParam, searchParams, router]);



  const handleSuperCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!superCode) {
      setSuperCodeError('Please enter the Super Access Code.');
      return;
    }

    setLoadingRole('super');
    setSuperCodeError('');

    try {
      const backendRes = await fetch('http://localhost:5000/api/auth/super-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: superCode })
      });

      if (!backendRes.ok) {
        const errorData = await backendRes.json();
        setSuperCodeError(errorData.message || 'Authentication failed.');
        return;
      }

      const backendData = await backendRes.json();
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: backendData.user.name,
          email: backendData.user.email,
          role: 'super',
          picture: backendData.user.picture,
          token: backendData.token,
          id: backendData.user.id,
          instituteId: null,
          status: backendData.user.status
        })
      });
      if (res.ok) {
        router.push(`/dashboard/super`);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
      setSuperCodeError('Failed to connect to the backend server.');
    } finally {
      setLoadingRole(null);
    }
  };

  const triggerGoogleAuth = () => {
    // Redirect directly to our Google OAuth initiation route
    router.push(`/api/auth/google?role=${selectedRole}&action=login`);
  };

  return (
    <div className="w-full max-w-lg">
      <ToastContainer />
      
      {/* Pending Approval Alert Box */}
      {showPendingAlert && (
        <div className="mb-6 overflow-hidden rounded-xl border border-rose-500/20 bg-rose-500/10 p-5 backdrop-blur-md">
          <div className="flex gap-3">
            <AlertTriangle className="h-6 w-6 shrink-0 text-rose-400 animate-pulse" />
            <div>
              <h3 className="font-semibold text-rose-200">Registration Pending Review</h3>
              <p className="mt-1 text-sm leading-relaxed text-rose-300/90">Your Institute Admin profile registration was recorded, but is currently pending review. Please contact the Super Admin to activate this account.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={() => setShowPendingAlert(false)} className="rounded-lg border border-rose-500/30 px-3.5 py-1.5 text-xs font-medium text-rose-300 transition-colors hover:bg-white/5">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Main Glass Card */}
      <div className="glass border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 shadow-lg shadow-purple-500/20">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>

          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white font-display">Welcome to LumenLMS</h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-sm">Access your next-generation learning portal. Authenticate secure, modern sessions.</p>
        </div>

        {/* Role Selector before Auth */}
        <div className="mt-8 space-y-4">
          <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Select Your Role Onboarding</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'student', label: 'Student', icon: User },
              { id: 'faculty', label: 'Faculty', icon: BookOpen },
              { id: 'admin', label: 'Institute Admin', icon: Users },
              { id: 'super', label: 'Super Admin', icon: ShieldCheck }
            ].map((role) => {
              const Icon = role.icon;
              return (
                <button key={role.id} onClick={() => setSelectedRole(role.id as any)} className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-left text-sm transition-all duration-200 ${selectedRole === role.id ? 'border-purple-500 bg-purple-500/10 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-white/5 bg-white/5 text-zinc-400 hover:border-white/10 hover:bg-white/10 hover:text-white'}`}>
                  <Icon className={`h-4.5 w-4.5 ${selectedRole === role.id ? 'text-purple-400' : 'text-zinc-500'}`} />
                  <span className="font-medium">{role.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Auth Method rendering based on selected role */}
        {selectedRole === 'super' ? (
          <form onSubmit={handleSuperCodeLogin} className="mt-8 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Enter Super Access Code</label>
              <input type="password" value={superCode} onChange={(e) => setSuperCode(e.target.value)} placeholder="••••••••••••" className="w-full rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
            {superCodeError && <p className="text-xs text-rose-400 font-semibold">{superCodeError}</p>}
            <button type="submit" disabled={loadingRole === 'super'} className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-purple-600 px-5 py-4 text-sm font-semibold text-white transition-all hover:bg-purple-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50">
              {loadingRole === 'super' ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Verify & Enter Console'}
            </button>
          </form>
        ) : (
          /* Google OAuth Login Button */
          <div className="mt-8">
            <button onClick={triggerGoogleAuth} disabled={!!loadingRole} className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-4 text-sm font-semibold text-zinc-900 transition-all hover:bg-zinc-100 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-[0_4px_20px_rgba(255,255,255,0.05)]">
              {loadingRole ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
              ) : (
                <svg className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
              )}
              Sign In with Google
            </button>
          </div>
        )}

        {/* Alternate Navigation */}
        {selectedRole !== 'super' && (
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
            <span>New to LumenLMS?</span>
            <button onClick={() => router.push(`/signup?role=${selectedRole}`)} className="font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-0.5">
              Register Account <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="mesh-bg min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
      <Suspense
        fallback={
          <div className="glass border border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center w-full max-w-lg text-white">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
            <span className="mt-4 text-sm font-semibold text-zinc-400">Loading auth screen...</span>
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
