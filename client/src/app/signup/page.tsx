'use client';

import { AlertTriangle, BookOpen, ChevronLeft, Sparkles, User, Users } from 'lucide-react';
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ThemeToggle } from '../../components/ThemeToggle';
import { API_BASE_URL } from '../../lib/api';

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRole = (searchParams.get('role') || 'student') as 'student' | 'faculty' | 'admin';
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'admin'>(initialRole);
  const [loading, setLoading] = useState(false);

  // Onboarding form states
  const [legalName, setLegalName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [instituteId, setInstituteId] = useState('');
  const [activeInstitutes, setActiveInstitutes] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [validationError, setValidationError] = useState('');
  const [billingPlan, setBillingPlan] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<'none' | 'loading' | 'valid' | 'invalid'>('none');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);



  useEffect(() => {
    if (searchParams.get('role')) {
      setSelectedRole(searchParams.get('role') as any);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      const plansRes = await fetch(`${API_BASE_URL}/api/auth/plans`);
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData);
        if (plansData.length > 0) {
          setBillingPlan(plansData[0].planCode);
        }
      }
    };
    fetchData();
  }, []);

  // Fetch approved active institutes for Students and Faculty
  useEffect(() => {
    if (selectedRole === 'student' || selectedRole === 'faculty') {
      fetch(`${API_BASE_URL}/api/auth/active-institutes`)
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

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoStatus('loading');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/validate-promo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setPromoStatus('valid');
        setPromoMessage(data.message);
        setPromoDiscount(data.discountPercentage);
      } else {
        setPromoStatus('invalid');
        setPromoMessage(data.message || 'Invalid promo code');
        setPromoDiscount(0);
      }
    } catch (error) {
      setPromoStatus('invalid');
      setPromoMessage('Error validating code');
      setPromoDiscount(0);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSignup = async () => {
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
      query += `&promoCode=${encodeURIComponent(promoCode.trim())}`;
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

    if (selectedRole === 'admin') {
      const res = await loadRazorpay();
      if (!res) {
        setValidationError("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      try {
        const orderRes = await fetch(`${API_BASE_URL}/api/auth/onboarding-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ promoCode: promoCode.trim() })
        });
        const orderData = await orderRes.json();
        
        if (!orderRes.ok) throw new Error(orderData.message || 'Failed to create order');

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_THoeY1eXASp32Z',
          amount: orderData.amount,
          currency: orderData.currency,
          name: "LumenLMS",
          description: "Platform Onboarding Fee",
          order_id: orderData.orderId,
          handler: function (response: any) {
            query += `&razorpay_payment_id=${response.razorpay_payment_id}&razorpay_order_id=${response.razorpay_order_id}&razorpay_signature=${response.razorpay_signature}`;
            window.location.href = `/api/auth/google?${query}&action=signup`;
          },
          prefill: {
            name: legalName,
            contact: phoneNumber
          },
          theme: {
            color: "#6d28d9"
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
            }
          }
        };
        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on('payment.failed', function (response: any) {
          setValidationError("Payment failed. Please try again.");
          setLoading(false);
        });
        paymentObject.open();
      } catch (err: any) {
        setValidationError("Payment initialization failed: " + err.message);
        setLoading(false);
      }
    } else {
      window.location.href = `/api/auth/google?${query}&action=signup`;
    }
  };


  return (
    <div className="w-full max-w-md">
      {/* Validation Error Alert Box */}
      {validationError && (
        <div className="mb-6 rounded-md border border-destructive/20 bg-destructive/10 p-4 text-left">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
            <div>
              <h3 className="font-semibold text-destructive text-sm">Registration Incomplete</h3>
              <p className="mt-1 text-xs leading-relaxed text-destructive/90">{validationError}</p>
              <div className="mt-3">
                <button onClick={() => setValidationError('')} className="rounded border border-destructive/30 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-8 shadow-sm relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="relative">
          {/* Back button */}
          <button onClick={() => router.push('/login')} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6 group cursor-pointer">
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back to Login
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-6 w-6" />
            </div>

            <h2 className="mt-6 text-xl font-semibold tracking-tight text-foreground font-sans">Create Your LMS Account</h2>
            <p className="mt-2 text-xs text-muted-foreground max-w-xs">Complete registration using your single sign-on Google account.</p>
          </div>

          {/* Role selector card list */}
          <div className="mt-8 space-y-2">
            <label className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Choose Your Registration Path</label>

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
              const isSelected = selectedRole === role.id;
              return (
                <button 
                  key={role.id} 
                  onClick={() => setSelectedRole(role.id as any)} 
                  className={`flex w-full items-start gap-4 rounded-md border p-4 text-left transition-colors cursor-pointer ${
                    isSelected 
                      ? 'border-primary bg-primary/10 text-foreground' 
                      : 'border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <div className={`mt-0.5 rounded p-1.5 ${isSelected ? 'bg-primary/25 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-foreground">{role.title}</h4>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{role.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Onboarding fields based on role */}
          <div className="mt-6 space-y-4">
            {selectedRole === 'admin' ? (
              <>
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Institute Registry Info</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Legal Registered Name</label>
                  <input
                    type="text"
                    required
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="e.g. Acme Educational Trust"
                    className="w-full mt-1.5 rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground placeholder-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Public Brand Name</label>
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Acme Institute of Technology"
                    className="w-full mt-1.5 rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground placeholder-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full mt-1.5 rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground placeholder-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Physical Address</label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 100 Innovation Way, Suite 400..."
                    className="w-full mt-1.5 rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground placeholder-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Select Billing Plan</label>
                  <select id="billingPlan" value={billingPlan} onChange={(e: any) => setBillingPlan(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-10">
                    {plans.map(p => (
                      <option key={p.planCode} value={p.planCode}>
                        {p.name} ({p.price} | Max {p.maxStudents || 'Unlimited'} Users | Max {p.maxStorageGB || 'Unlimited'}GB)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Promo Code (Optional)</label>
                  <div className="flex gap-2 mt-1.5">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        setPromoStatus('none');
                        setPromoMessage('');
                      }}
                      placeholder="e.g. EARLYBIRD20"
                      className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground placeholder-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary uppercase"
                    />
                    <button 
                      type="button" 
                      onClick={handleApplyPromo}
                      disabled={!promoCode.trim() || promoStatus === 'loading'}
                      className="whitespace-nowrap px-4 py-2 bg-secondary text-secondary-foreground text-xs font-medium rounded hover:bg-secondary/80 disabled:opacity-50"
                    >
                      {promoStatus === 'loading' ? 'Wait...' : 'Apply'}
                    </button>
                  </div>
                  {promoStatus === 'valid' && <p className="text-[10px] font-medium text-emerald-500 mt-1">{promoMessage} ({promoDiscount}% off)</p>}
                  {promoStatus === 'invalid' && <p className="text-[10px] font-medium text-destructive mt-1">{promoMessage}</p>}
                </div>
              </>
            ) : (
              <>
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Personal Details</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    required
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full mt-1.5 rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground placeholder-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full mt-1.5 rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground placeholder-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Physical Address</label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 100 Innovation Way, Suite 400..."
                    className="w-full mt-1.5 rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground placeholder-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Select Your Institution</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Affiliated Institute</label>
                  <select
                    value={instituteId}
                    onChange={(e) => setInstituteId(e.target.value)}
                    className="w-full mt-1.5 rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-primary outline-none"
                  >
                    <option value="" disabled>Select an Institute...</option>
                    {activeInstitutes.map((inst) => (
                      <option key={inst._id} value={inst._id}>
                        {inst.brandName || inst.name} — ID: {inst._id}
                      </option>
                    ))}
                    {activeInstitutes.length === 0 && selectedRole !== 'student' && (
                      <option value="" disabled className="text-muted-foreground">No approved institutes available</option>
                    )}
                  </select>
                  {selectedRole === 'faculty' && instituteId && instituteId !== 'none' && (
                    <p className="mt-1.5 text-[10px] text-amber-600 dark:text-amber-400 leading-relaxed">
                      ⚠️ Your affiliation request will be sent to the Institute Admin for approval. You can log in immediately but institute features require admin approval.
                    </p>
                  )}
                  {selectedRole === 'faculty' && activeInstitutes.length === 0 && (
                    <p className="mt-1.5 text-[10px] text-destructive leading-relaxed">
                      No active institutes found. Contact your institution to get listed on the platform.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Action Trigger */}
          <div className="mt-8">
            <button 
              onClick={handleSignup} 
              disabled={loading} 
              className="flex w-full items-center justify-center gap-2 rounded-md bg-card border border-border px-4 py-2.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
              ) : (
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
              )}
              {selectedRole === 'admin' ? `Pay ₹${500 - (500 * (promoDiscount || 0) / 100)} & Sign Up with Google` : 'Sign Up with Google'}
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground border-t border-border pt-6">
            <span>Already have an account?</span>
            <button onClick={() => router.push('/login')} className="font-medium text-primary hover:underline cursor-pointer">
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
    <div className="bg-background min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 font-sans">
      <Suspense
        fallback={
          <div className="bg-card border border-border rounded-lg p-10 flex flex-col items-center justify-center w-full max-w-md text-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="mt-4 text-xs text-muted-foreground">Loading signup screen...</span>
          </div>
        }
      >
        <SignupFormContent />
      </Suspense>
    </div>
  );
}
