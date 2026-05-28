'use client';

import { AlertTriangle, BookOpen, ChevronLeft, GraduationCap, Info, Sparkles, User, Users } from 'lucide-react';
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRole = (searchParams.get('role') || 'student') as 'student' | 'faculty' | 'admin';
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'admin'>(initialRole);
  const [loading, setLoading] = useState(false);
  const allowDevSandbox = process.env.NEXT_PUBLIC_ALLOW_DEV_SANDBOX === 'true';

  // Onboarding form states
  const [legalName, setLegalName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [instituteId, setInstituteId] = useState('');
  const [activeInstitutes, setActiveInstitutes] = useState<any[]>([]);
  const [validationError, setValidationError] = useState('');
  const [billingPlan, setBillingPlan] = useState<'Basic' | 'Premium' | 'Enterprise' | 'Custom'>('Basic');

  useEffect(() => {
    if (searchParams.get('role')) {
      setSelectedRole(searchParams.get('role') as any);
    }
  }, [searchParams]);

  // Fetch approved active institutes for Students and Faculty
  useEffect(() => {
    if (selectedRole === 'student' || selectedRole === 'faculty') {
      fetch('http://localhost:5000/api/auth/active-institutes')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setActiveInstitutes(data);
            if (selectedRole === 'student') {
              setInstituteId('none');
            } else if (data.length > 0) {
              setInstituteId(data[0]._id);
            }
          }
        })
        .catch((e) => console.error("Error fetching active institutes:", e));
    }
  }, [selectedRole]);

  const handleSignup = () => {
    setLoading(true);
    setValidationError('');
    let query = `role=${selectedRole}`;

    if (selectedRole === 'admin') {
      if (!legalName.trim() || !brandName.trim() || !phoneNumber.trim() || !address.trim()) {
        setValidationError("Please fill out all institute fields.");
        setLoading(false);
        return;
      }
      query += `&legalName=${encodeURIComponent(legalName.trim())}&brandName=${encodeURIComponent(brandName.trim())}&phoneNumber=${encodeURIComponent(phoneNumber.trim())}&address=${encodeURIComponent(address.trim())}&billingPlan=${encodeURIComponent(billingPlan)}`;
    } else {
      if (!instituteId) {
        setValidationError("Please select an approved institute.");
        setLoading(false);
        return;
      }
      if (!legalName.trim() || !phoneNumber.trim() || !address.trim()) {
        setValidationError("Please fill out your personal details (Full Name, Phone, and Address).");
        setLoading(false);
        return;
      }
      query += `&instituteId=${encodeURIComponent(instituteId)}&legalName=${encodeURIComponent(legalName.trim())}&phoneNumber=${encodeURIComponent(phoneNumber.trim())}&address=${encodeURIComponent(address.trim())}`;
    }

    router.push(`/api/auth/google?${query}&action=signup`);
  };


  return (
    <div className="w-full max-w-lg">
      {/* Validation Error Alert Box */}
      {validationError && (
        <div className="mb-6 overflow-hidden rounded-xl border border-rose-500/20 bg-rose-500/10 p-5 backdrop-blur-md">
          <div className="flex gap-3">
            <AlertTriangle className="h-6 w-6 shrink-0 text-rose-400" />
            <div>
              <h3 className="font-semibold text-rose-200">Registration Incomplete</h3>
              <p className="mt-1 text-sm leading-relaxed text-rose-300/90">{validationError}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={() => setValidationError('')} className="rounded-lg border border-rose-500/30 px-3.5 py-1.5 text-xs font-medium text-rose-300 transition-colors hover:bg-white/5">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative">
          {/* Back button */}
          <button onClick={() => router.push('/login')} className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-6 group">
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back to Login
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 shadow-lg shadow-purple-500/20">
              <Sparkles className="h-7 w-7 text-white" />
            </div>

            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white font-display">Create Your LMS Account</h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-sm">Complete registration using your single sign-on Google account.</p>
          </div>

          {/* Role selector card list */}
          <div className="mt-8 space-y-3">
            <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Choose Your Registration Path</label>

            {[
              {
                id: 'student',
                title: 'Register as a Student',
                description: 'Enroll in semesters, track assignment schedules, view final grades.',
                icon: User
              },
              {
                id: 'faculty',
                title: 'Register as a Faculty Teacher',
                description: 'Organize lesson structures, publish grades, track submissions.',
                icon: BookOpen
              },
              {
                id: 'admin',
                title: 'Register as an Institute Admin',
                description: 'Onboard faculty rosters, track term metrics, manage departments.',
                icon: Users
              }
            ].map((role) => {
              const Icon = role.icon;
              return (
                <button key={role.id} onClick={() => setSelectedRole(role.id as any)} className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${selectedRole === role.id ? 'border-purple-500 bg-purple-500/10 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-white/5 bg-white/5 text-zinc-400 hover:border-white/10 hover:bg-white/10 hover:text-white'}`}>
                  <div className={`mt-0.5 rounded-lg p-2 ${selectedRole === role.id ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-zinc-500'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{role.title}</h4>
                    <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{role.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Onboarding fields based on role */}
          <div className="mt-6 space-y-4">
            {selectedRole === 'admin' ? (
              <>
                <div className="border-t border-white/5 pt-4 mt-4">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Institute Registry Info</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400">Legal Registered Name</label>
                  <input
                    type="text"
                    required
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="e.g. Acme Educational Trust"
                    className="w-full mt-1.5 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:bg-white/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400">Public Brand Name</label>
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Acme Institute of Technology"
                    className="w-full mt-1.5 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:bg-white/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full mt-1.5 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:bg-white/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400">Physical Address</label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 100 Innovation Way, Suite 400, Tech City, TC 94016"
                    className="w-full mt-1.5 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:bg-white/10 outline-none transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400">Select Billing Plan</label>
                  <select
                    value={billingPlan}
                    onChange={(e) => setBillingPlan(e.target.value as any)}
                    className="w-full mt-1.5 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-purple-500 outline-none transition-all"
                  >
                    <option value="Basic">Basic Plan ($299/mo)</option>
                    <option value="Premium">Premium Plan ($599/mo)</option>
                    <option value="Enterprise">Enterprise Plan ($1,450/mo)</option>
                    <option value="Custom">Custom Plan (Contact Sales)</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="border-t border-white/5 pt-4 mt-4">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Personal Details</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full mt-1.5 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:bg-white/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full mt-1.5 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:bg-white/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400">Physical Address</label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 100 Innovation Way, Suite 400, Tech City, TC 94016"
                    className="w-full mt-1.5 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:bg-white/10 outline-none transition-all resize-none"
                  />
                </div>
                <div className="border-t border-white/5 pt-4 mt-4">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Select Your Institution</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400">Affiliated Institute</label>
                  <select
                    value={instituteId}
                    onChange={(e) => setInstituteId(e.target.value)}
                    className="w-full mt-1.5 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-purple-500 outline-none transition-all"
                  >
                    {selectedRole === 'student' && (
                      <option value="none">Unaffiliated (Independent Learner)</option>
                    )}
                    {activeInstitutes.map((inst) => (
                      <option key={inst._id} value={inst._id}>
                        {inst.name}
                      </option>
                    ))}
                    {activeInstitutes.length === 0 && selectedRole !== 'student' && (
                      <option value="" disabled className="text-zinc-500">No approved institutes available</option>
                    )}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Action Trigger */}
          <div className="mt-8 space-y-3">
            <button onClick={handleSignup} disabled={loading} className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-4 text-sm font-semibold text-zinc-900 transition-all hover:bg-zinc-100 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none">
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
              ) : (
                <svg className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
              )}
              Sign Up with Google
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-zinc-500 border-t border-white/5 pt-6">
            <span>Already have an account?</span>
            <button onClick={() => router.push('/login')} className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
              Sign In Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="mesh-bg min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
      <Suspense
        fallback={
          <div className="glass border border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center w-full max-w-lg text-white">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
            <span className="mt-4 text-sm font-semibold text-zinc-400">Loading signup screen...</span>
          </div>
        }
      >
        <SignupFormContent />
      </Suspense>
    </div>
  );
}
