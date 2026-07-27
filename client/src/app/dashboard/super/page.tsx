'use client';

import { Activity, AlertTriangle, BookOpen, Building, CheckCircle2, CreditCard, Database, Mail, Server, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import React, { useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';
import { useUser } from '../../../lib/session';
import { API_BASE_URL } from '../../../lib/api';

export default function SuperAdminDashboard() {
  const session = useUser();
  const searchParams = useSearchParams();
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoDiscount, setNewPromoDiscount] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showStorageModal, setShowStorageModal] = useState<string | null>(null);
  const [storageData, setStorageData] = useState<{videoBytes: number, documentBytes: number} | null>(null);
  const [storageLoading, setStorageLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'tenant' | 'student' | 'plan', id: string } | null>(null);

  // Student Details Modal
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loadingStudentDetails, setLoadingStudentDetails] = useState(false);

  // Action state
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | ''>('');

  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<any>({});
  
  // Create Plan State
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({ planCode: '', name: '', price: '' });

  const fetchInstitutes = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/super/institutes`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setInstitutes(data);
      }
    } catch (e) {
      console.error('Failed to fetch institutes:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifications = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/super/verifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVerifications(data || []);
      }

      // Fetch dynamic pricing plans
      const plansRes = await fetch(`${API_BASE_URL}/api/super/plans`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (plansRes.ok) {
        setPlans(await plansRes.json());
      }

      
      const transRes = await fetch(`${API_BASE_URL}/api/super/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (transRes.ok) {
        setTransactions(await transRes.json());
      }
      
      const promosRes = await fetch(`${API_BASE_URL}/api/super/promos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (promosRes.ok) {
        setPromos(await promosRes.json());
      }
    } catch (e) {
      console.error('Failed to fetch verifications:', e);
    }
  };

  const fetchStudents = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/super/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStudents(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch students:', e);
    }
  };

  useEffect(() => {
    const token = session?.token;
    if (token) {
      fetchInstitutes(token);
      fetchVerifications(token);
      fetchStudents(token);
    } else {
      setLoading(false);
    }
  }, [session?.token, session]);

  const handleApproveVerification = async (id: string) => {
    const token = session?.token;
    if (!token) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/super/verifications/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackType('success');
        toast(data.message || 'Verification approved.');
        await fetchInstitutes(token);
        await fetchVerifications(token);
      } else {
        setFeedbackType('error');
        toast(data.message || 'Failed to approve.');
      }
    } catch (e) {
      setFeedbackType('error');
      toast('Network error approving verification.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejectVerification = async (id: string) => {
    const token = session?.token;
    if (!token) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/super/verifications/${id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackType('success');
        toast(data.message || 'Verification rejected.');
        await fetchVerifications(token);
        await fetchInstitutes(token);
      } else {
        setFeedbackType('error');
        toast(data.message || 'Failed to reject.');
      }
    } catch (e) {
      setFeedbackType('error');
      toast('Network error rejecting verification.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Sync active tab with `?tab=` query param (so sidebar links work)
  useEffect(() => {
    const tabParam = searchParams?.get('tab') || 'overview';
    setActiveTab(tabParam);
  }, [searchParams?.toString()]);

  const handleAdjustWallet = async (instId: string) => {
    const amountStr = window.prompt("Enter amount to adjust (use negative to deduct):");
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (isNaN(amount)) {
      toast("Invalid amount");
      return;
    }

    const reason = window.prompt("Reason for adjustment:");
    
    const token = session?.token;
    if (!token) return;

    setUpdatingId(instId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/super/institutes/${instId}/wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, reason })
      });
      const data = await res.json();
      if (res.ok) {
        toast(data.message);
        await fetchInstitutes(token);
        // Refresh transactions to show the new manual adjustment
        const txRes = await fetch(`${API_BASE_URL}/api/super/transactions`, { headers: { Authorization: `Bearer ${token}` } });
        if(txRes.ok) setTransactions(await txRes.json());
      } else {
        toast(data.message || 'Failed to adjust wallet');
      }
    } catch (error) {
      toast('Network error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (instId: string, currentStatus: string) => {
    const token = session?.token;
    if (!token) return;

    const targetStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';

    setUpdatingId(instId);
    setFeedbackMsg('');
    setFeedbackType('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/super/institutes/${instId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: targetStatus })
      });

      const data = await res.json();

      if (res.ok) {
        setFeedbackType('success');
        toast(data.message || `Successfully marked institute as ${targetStatus}!`);
        await fetchInstitutes(token);
      } else {
        setFeedbackType('error');
        toast(data.message || 'Failed to update status.');
      }
    } catch (error) {
      setFeedbackType('error');
      toast('Network error updating status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBillingChange = async (instId: string, newPlan: string) => {
    const token = session?.token;
    if (!token) return;

    setUpdatingId(instId);
    setFeedbackMsg('');
    setFeedbackType('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/super/institutes/${instId}/billing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ billingPlan: newPlan })
      });

      const data = await res.json();

      if (res.ok) {
        setFeedbackType('success');
        toast(data.message || 'Successfully updated billing plan!');
        await fetchInstitutes(token);
      } else {
        setFeedbackType('error');
        toast(data.message || 'Failed to update billing plan.');
      }
    } catch (error) {
      setFeedbackType('error');
      toast('Network error updating billing.');
    } finally {
      setUpdatingId(null);
    }
  };

  const executeDeleteTenant = async (instId: string) => {
    const token = session?.token;
    if (!token) return;

    setUpdatingId(instId);
    setFeedbackMsg('');
    setFeedbackType('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/super/institutes/${instId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (res.ok) {
        setFeedbackType('success');
        toast(data.message || 'Tenant completely deleted.');
        await fetchInstitutes(token);
        await fetchStudents(token);
      } else {
        setFeedbackType('error');
        toast(data.message || 'Failed to delete tenant.');
      }
    } catch (error) {
      setFeedbackType('error');
      toast('Network error deleting tenant.');
    } finally {
      setUpdatingId(null);
    }
  };

  const fetchStorageData = async (instId: string) => {
    const token = session?.token;
    if (!token) return;
    setStorageLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/super/institutes/${instId}/storage`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStorageData(await res.json());
      } else {
        toast('Failed to fetch storage data.');
      }
    } catch (e) {
      toast('Network error fetching storage.');
    } finally {
      setStorageLoading(false);
    }
  };
  const submitNewPlan = async () => {
    const token = session?.token;
    if (!token) return;
    
    const { planCode, name, price } = newPlanForm;
    if (!planCode || !name || !price) {
      toast('Please fill out all fields.');
      return;
    }
    
    setUpdatingId('create-plan');
    try {
      const res = await fetch(`${API_BASE_URL}/api/super/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ planCode, name, price })
      });
      const data = await res.json();
      if (res.ok) {
        toast(data.message);
        setShowCreatePlanModal(false);
        setNewPlanForm({ planCode: '', name: '', price: '' });
        const plansRes = await fetch(`${API_BASE_URL}/api/super/plans`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (plansRes.ok) setPlans(await plansRes.json());
      } else {
        toast(data.message || 'Failed to create plan');
      }
    } catch (e) {
      toast("Error creating plan.");
    } finally {
      setUpdatingId(null);
    }
  };

  const executeDeletePlan = async (planId: string) => {
    const token = session?.token;
    if (!token) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/super/plans/${planId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast("Plan deleted successfully");
        const plansRes = await fetch(`${API_BASE_URL}/api/super/plans`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (plansRes.ok) setPlans(await plansRes.json());
      } else {
        const data = await res.json();
        toast(data.message || 'Failed to delete plan');
      }
    } catch (error) {
      toast('Network error');
    }
  };


  const handleUpdatePlan = async () => {
    const token = session?.token;
    if (!token || !editingPlanId) return;

    // Convert string inputs back to numbers if needed for storage and students
    const payload = {
      ...planForm,
      maxStorageGB: Number(planForm.maxStorageGB) || 0,
      maxStudents: Number(planForm.maxStudents) || 0
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/super/plans/${editingPlanId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        const plansRes = await fetch(`${API_BASE_URL}/api/super/plans`, { headers: { Authorization: `Bearer ${token}` } });
        if (plansRes.ok) setPlans(await plansRes.json());
        setEditingPlanId(null);
        setFeedbackType('success');
        toast('Plan pricing parameters updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update plan');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const executeDeleteStudent = async (studentId: string) => {
    const token = session?.token;
    if (!token) return;

    setUpdatingId(studentId);
    setFeedbackMsg('');
    setFeedbackType('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/super/users/${studentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackType('success');
        toast(data.message || 'Student deleted.');
        if (selectedStudent?.student?._id === studentId) setSelectedStudent(null);
        await fetchStudents(token);
      } else {
        setFeedbackType('error');
        toast(data.message || 'Failed to delete student.');
      }
    } catch (error) {
      setFeedbackType('error');
      toast('Network error deleting student.');
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;
    setDeleteConfirm(null);
    if (type === 'tenant') await executeDeleteTenant(id);
    else if (type === 'student') await executeDeleteStudent(id);
    else if (type === 'plan') await executeDeletePlan(id);
  };

  const handleViewStudentDetails = async (studentId: string) => {
    const token = session?.token;
    if (!token) return;

    setLoadingStudentDetails(true);
    setSelectedStudent(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/super/students/${studentId}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSelectedStudent(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStudentDetails(false);
    }
  };

  if (!session) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const pendingRequests = institutes.filter((inst) => inst.status === 'Pending').length;
  const activeTenants = institutes.filter((inst) => inst.status === 'Active').length;
  const suspendedTenants = institutes.filter((inst) => inst.status === 'Suspended').length;

  return (
    <div className="space-y-8 font-sans antialiased text-foreground">
      {/* Dynamic Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            Super Admin Terminal
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Global orchestrator panel. Regulate multi-tenant lifecycles, track engine performance metrics, and approve clients.</p>
        </div>
        <div className="rounded-md bg-secondary border border-border px-3 py-1.5 text-xs text-muted-foreground font-medium self-start md:self-auto flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          System Status: Optimal
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-border gap-6 text-sm overflow-x-auto pb-1 scrollbar-violet">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'tenants', label: `Tenants Management (${institutes.length})` },
          { id: 'students', label: `Global Students (${students.length})` },
          { id: 'billing', label: 'Billing Plans' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setFeedbackMsg('');
            }}
            className={`pb-2.5 font-medium transition-colors shrink-0 border-b-2 cursor-pointer ${
              activeTab === tab.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Action Feedback alerts */}
      {feedbackMsg && (
        <div className={`p-4 rounded-md border text-xs ${
          feedbackType === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/10 border-destructive/20 text-destructive'
        }`}>
          {feedbackMsg}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Status Metrics Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Active Tenants', val: activeTenants, desc: 'Onboarded and live clients', icon: Building, color: 'text-foreground' },
              { label: 'Pending Approvals', val: pendingRequests, desc: 'Awaiting SuperAdmin activation', icon: AlertTriangle, color: pendingRequests > 0 ? 'text-amber-500' : 'text-muted-foreground' },
              { label: 'Suspended Clients', val: suspendedTenants, desc: 'In-active platform blocks', icon: ShieldCheck, color: 'text-muted-foreground' },
              { label: 'Hardware Clusters', val: 'Optimal', desc: 'Mongoose database pools', icon: Server, color: 'text-foreground' }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-semibold text-foreground mt-2 leading-none">{stat.val}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{stat.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Pending verification requests list */}
          {verifications.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Pending Verification Requests</h3>
              <div className="space-y-3">
                {verifications.map((v: any) => (
                  <div key={v._id || v.id} className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-xs text-foreground">{v.institute?.name || v.instituteId?.name || String(v.instituteId || 'Unknown')}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Requested by: {v.admin?.email || v.adminId?.email || String(v.adminId || 'Unknown')}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Submitted: {v.createdAt ? new Date(v.createdAt).toLocaleString() : '—'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button disabled={updatingId === (v._id || v.id)} onClick={() => handleApproveVerification(v._id || v.id)} className="rounded-md bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 cursor-pointer">
                        Approve
                      </button>
                      <button disabled={updatingId === (v._id || v.id)} onClick={() => handleRejectVerification(v._id || v.id)} className="rounded-md bg-destructive hover:bg-destructive/90 px-3 py-1.5 text-xs font-medium text-destructive-foreground disabled:opacity-50 cursor-pointer">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tenants List Preview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Platform Tenants</h3>
                <span className="text-xs text-muted-foreground">{institutes.length} registered</span>
              </div>

              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : institutes.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center text-xs text-muted-foreground">No registered tenants currently found on MongoDB.</div>
              ) : (
                <div className="grid gap-3">
                  {institutes.map((inst: any) => (
                    <div key={inst.id} className="bg-card border border-border rounded-lg p-5 hover:bg-secondary/20 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[9px] font-semibold text-primary font-mono">{inst.billingPlan}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                              <span>{inst.usage.courses} Courses</span>
                              <span>•</span>
                              <span>{inst.usage.faculty} Faculty</span>
                              <span>•</span>
                              <span>{inst.usage.students} Students</span>
                            </span>
                          </div>
                          <h4 className="font-semibold text-foreground text-sm mt-2">{inst.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-muted-foreground" /> Admin: {inst.admin?.email || 'Unknown'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            inst.status === 'Active' 
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' 
                              : inst.status === 'Pending' 
                                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' 
                                : 'bg-destructive/10 text-destructive border-destructive/20'
                          }`}>{inst.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tenants Management Tab */}
      {activeTab === 'tenants' && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tenant Allocations & Status</h3>
            <span className="text-xs text-muted-foreground">{institutes.length} total clients</span>
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 pr-4">Institution Name</th>
                    <th className="pb-3 pr-4">Admin Email</th>
                    <th className="pb-3 pr-4">Billing Plan</th>
                    <th className="pb-3 pr-4">Course Load</th>
                    <th className="pb-3 pr-4">Users Breakdown</th>
                    <th className="pb-3 pr-4">Storage Usage</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 text-right">Action Gate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {institutes.map((inst: any) => (
                    <tr key={inst.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-4 font-semibold text-foreground pr-4">{inst.name}</td>
                      <td className="py-4 text-muted-foreground pr-4">{inst.admin?.email || 'Unknown'}</td>
                      <td className="py-4 pr-4">
                        <select 
                          value={inst.billingPlan} 
                          onChange={(e) => handleBillingChange(inst.id, e.target.value)} 
                          disabled={updatingId === inst.id} 
                          className="bg-card border border-input text-xs text-foreground py-1 px-2 rounded focus:outline-none focus:border-primary"
                        >
                          {plans.map(p => (
                            <option key={p.planCode} value={p.planCode}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 font-mono text-primary pr-4">{inst.usage.courses}</td>
                      <td className="py-4 pr-4">
                        <details className="cursor-pointer group">
                          <summary className="text-muted-foreground font-semibold hover:text-foreground outline-none">
                            {inst.usage.faculty + inst.usage.students + 1} Total
                          </summary>
                          <div className="mt-2 pl-2 border-l-2 border-primary/30 flex flex-col gap-1 text-[10px] text-muted-foreground">
                            <span>{inst.usage.students} Students</span>
                            <span>{inst.usage.faculty} Faculty</span>
                            <span>1 Admin</span>
                          </div>
                        </details>
                      </td>
                      <td className="py-4 pr-4">
                        <button 
                          onClick={() => {
                            setShowStorageModal(inst.id);
                            setStorageData(null);
                          }}
                          className="rounded-md border border-border px-3 py-1 bg-card hover:bg-secondary/20 transition-colors text-xs font-medium text-muted-foreground cursor-pointer"
                        >
                          Check Storage
                        </button>
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`rounded border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                          inst.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' 
                            : inst.status === 'Pending' 
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' 
                              : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}>{inst.status}</span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            disabled={updatingId === inst.id} 
                            onClick={() => handleStatusChange(inst.id, inst.status)} 
                            className={`rounded-md px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                              inst.status === 'Active' 
                                ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/20' 
                                : inst.status === 'Pending' 
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-750' 
                                  : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20'
                            } disabled:opacity-50`}
                          >
                            {updatingId === inst.id ? 'Wait...' : inst.status === 'Active' ? 'Suspend' : inst.status === 'Pending' ? 'Approve' : 'Activate'}
                          </button>
                          <button 
                            disabled={updatingId === inst.id} 
                            onClick={() => setDeleteConfirm({ type: 'tenant', id: inst.id })} 
                            className="rounded-md px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Students Management Tab */}
      {activeTab === 'students' && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Global Student Directory</h3>
            <span className="text-xs text-muted-foreground">{students.length} total students</span>
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 pr-4">Student Name</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Base Institute</th>
                    <th className="pb-3 pr-4">Account Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {students.map((student: any) => (
                    <tr key={student._id} onClick={() => handleViewStudentDetails(student._id)} className="hover:bg-secondary/20 transition-colors cursor-pointer group">
                      <td className="py-4 font-semibold text-foreground pr-4 group-hover:text-primary transition-colors">{student.name}</td>
                      <td className="py-4 text-muted-foreground pr-4">{student.email}</td>
                      <td className="py-4 text-muted-foreground pr-4">{student.instituteId?.name || 'Unknown Institute'}</td>
                      <td className="py-4 pr-4">
                        <span className={`rounded border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                          student.status === 'Approved' 
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' 
                            : student.status === 'Pending' 
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' 
                              : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}>{student.status}</span>
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          disabled={updatingId === student._id} 
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'student', id: student._id }); }} 
                          className="rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground">No students are currently registered on the platform.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Subscription Plans Configuration */}
      {activeTab === 'billing' && (
        <div className="space-y-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pricing Plans (Monthly Rates)</h3>
              <button onClick={() => setShowCreatePlanModal(true)} className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 px-3 py-1.5 rounded text-[10px] font-semibold transition-colors cursor-pointer">
                + Create New Plan
              </button>
            </div>
            {plans.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">Loading live plans from database...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {plans.map((plan: any) => (
                  <div key={plan._id} className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between">
                    {editingPlanId === plan._id ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Editing: {plan.name}</h4>
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-muted-foreground uppercase">Plan Name</label>
                          <input type="text" value={planForm.name || ''} onChange={e => setPlanForm({...planForm, name: e.target.value})} className="w-full bg-card border border-input rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary mt-1" />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-muted-foreground uppercase">Price</label>
                          <input type="text" value={planForm.price || ''} onChange={e => setPlanForm({...planForm, price: e.target.value})} className="w-full bg-card border border-input rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary mt-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-medium text-muted-foreground uppercase">Max Users</label>
                            <input type="number" value={planForm.maxStudents || ''} onChange={e => setPlanForm({...planForm, maxStudents: e.target.value})} className="w-full bg-card border border-input rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary mt-1" />
                          </div>
                          <div>
                            <label className="text-[10px] font-medium text-muted-foreground uppercase">Max Storage (GB)</label>
                            <input type="number" value={planForm.maxStorageGB || ''} onChange={e => setPlanForm({...planForm, maxStorageGB: e.target.value})} className="w-full bg-card border border-input rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary mt-1" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-muted-foreground uppercase">Details</label>
                          <textarea value={planForm.details || ''} onChange={e => setPlanForm({...planForm, details: e.target.value})} className="w-full bg-card border border-input rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary mt-1 resize-none" rows={2} />
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button onClick={handleUpdatePlan} className="w-full rounded bg-primary hover:bg-primary/90 py-1.5 text-xs font-medium text-primary-foreground transition-colors cursor-pointer">Save</button>
                          <button onClick={() => setEditingPlanId(null)} className="w-full rounded border border-border hover:bg-secondary py-1.5 text-xs font-medium text-foreground transition-colors cursor-pointer">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{plan.name}</h4>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                          </div>

                          <p className="text-2xl font-semibold text-foreground">{plan.price}</p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Max Users: <strong className="text-foreground font-medium">{plan.maxStudents || 'Unlimited'}</strong></p>
                            <p>Max Storage: <strong className="text-foreground font-medium">{plan.maxStorageGB || 'Unlimited'} GB</strong></p>
                          </div>

                          <div className="h-px bg-border my-4" />
                          <p className="text-xs text-muted-foreground">{plan.details}</p>
                        </div>

                        <div className="flex gap-2 mt-6">
                          <button onClick={() => { setEditingPlanId(plan._id); setPlanForm({ name: plan.name, price: plan.price, details: plan.details, maxStudents: plan.maxStudents, maxStorageGB: plan.maxStorageGB }); }} className="w-full rounded-md border border-border hover:bg-secondary bg-card py-2 text-xs font-medium text-foreground transition-colors cursor-pointer">Modify</button>
                          <button onClick={() => setDeleteConfirm({ type: 'plan', id: plan._id })} className="rounded-md border border-destructive/20 hover:bg-destructive/10 text-destructive px-3 py-2 text-xs font-medium transition-colors cursor-pointer" title="Delete Plan">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Promo Codes & Discounts</h3>
            
            <div className="flex gap-4 mb-6 border-b border-border pb-6">
              <input 
                type="text" 
                placeholder="PROMOCODE" 
                value={newPromoCode}
                onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                className="bg-card border border-input rounded px-3 py-2 text-xs focus:outline-none focus:border-primary w-40 uppercase"
              />
              <div className="relative w-32">
                <input 
                  type="number" 
                  placeholder="Discount %" 
                  value={newPromoDiscount}
                  onChange={(e) => setNewPromoDiscount(e.target.value)}
                  className="bg-card border border-input rounded pl-3 pr-8 py-2 text-xs focus:outline-none focus:border-primary w-full"
                />
                <span className="absolute right-3 top-1.5 text-xs text-muted-foreground">%</span>
              </div>
              <button 
                onClick={async () => {
                  if(!newPromoCode || !newPromoDiscount) return toast.error("Fill both fields");
                  try {
                    const res = await fetch(`${API_BASE_URL}/api/super/promos`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.token}` },
                      body: JSON.stringify({ code: newPromoCode, discountPercentage: newPromoDiscount })
                    });
                    const data = await res.json();
                    if(res.ok) {
                      toast.success(data.message);
                      setNewPromoCode("");
                      setNewPromoDiscount("");
                      const promosRes = await fetch(`${API_BASE_URL}/api/super/promos`, { headers: { Authorization: `Bearer ${session?.token}` } });
                      if(promosRes.ok) setPromos(await promosRes.json());
                    } else {
                      toast.error(data.message);
                    }
                  } catch(e) { toast.error("Error creating promo"); }
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded font-medium text-xs transition-colors"
              >
                Create Promo Code
              </button>
            </div>
            
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-secondary/20 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Discount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {promos.map((promo: any) => (
                    <tr key={promo._id} className="hover:bg-secondary/5 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">{promo.code}</td>
                      <td className="px-4 py-3 text-emerald-500 font-medium">{promo.discountPercentage}% OFF</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${promo.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                          {promo.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={async () => {
                            try {
                              const res = await fetch(`${API_BASE_URL}/api/super/promos/${promo._id}/toggle`, {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${session?.token}` }
                              });
                              if(res.ok) {
                                toast.success("Status updated");
                                const promosRes = await fetch(`${API_BASE_URL}/api/super/promos`, { headers: { Authorization: `Bearer ${session?.token}` } });
                                if(promosRes.ok) setPromos(await promosRes.json());
                              }
                            } catch(e) { toast.error("Error toggling promo"); }
                          }}
                          className={`px-3 py-1.5 rounded text-[10px] font-medium transition-colors ${promo.isActive ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                        >
                          {promo.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {promos.length === 0 && (
                     <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">No promo codes found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Tenant Wallets & Health</h3>
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-secondary/20 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tenant</th>
                    <th className="px-4 py-3 font-medium">Current Plan</th>
                    <th className="px-4 py-3 font-medium">Daily Burn</th>
                    <th className="px-4 py-3 font-medium">Wallet Balance</th>
                    <th className="px-4 py-3 font-medium">Estimated Days Left</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {institutes.filter((inst: any) => inst.status === "Active").map((inst: any) => {
                     const planPriceStr = plans.find(p => p.planCode === inst.billingPlan)?.price || '0';
                     const numMatch = planPriceStr.match(/\d+/g);
                     const planPrice = numMatch ? parseInt(numMatch.join(''), 10) : 0;
                     const dailyRate = planPrice / 28;
                     const daysLeft = dailyRate > 0 && inst.walletBalance > 0 ? Math.floor(inst.walletBalance / dailyRate) : 0;
                     
                     return (
                       <tr key={inst.id} className="hover:bg-secondary/5 transition-colors">
                         <td className="px-4 py-3 font-semibold text-foreground">{inst.name}</td>
                         <td className="px-4 py-3">{inst.billingPlan}</td>
                         <td className="px-4 py-3">₹{dailyRate.toFixed(2)}</td>
                         <td className={`px-4 py-3 font-bold ${inst.walletBalance < 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                           ₹{(inst.walletBalance || 0).toFixed(2)}
                         </td>
                         <td className={`px-4 py-3 font-semibold ${daysLeft <= 3 ? 'text-amber-500' : 'text-foreground'}`}>
                           {inst.walletBalance < 0 ? `Suspends in ${7 - (inst.negativeDaysCount || 0)} days` : `${daysLeft} days`}
                         </td>
                         <td className="px-4 py-3 text-right">
                           <button 
                             onClick={() => handleAdjustWallet(inst.id)}
                             disabled={updatingId === inst.id}
                             className="px-2 py-1 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded text-[10px] transition-colors"
                           >
                             Adjust
                           </button>
                         </td>
                       </tr>
                     );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Global Wallet Recharges</h3>
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-secondary/20 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Tenant</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium text-right">Paid</th>
                    <th className="px-4 py-3 font-medium text-right">Credited</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.filter((tx: any) => ['Recharge', 'Manual Adjustment'].includes(tx.type)).map((tx: any) => (
                    <tr key={tx._id} className="hover:bg-secondary/5 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{tx.instituteId?.name || 'Unknown'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-500">
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {tx.description}
                        {tx.promoCode && <span className="ml-2 px-1.5 py-0.5 bg-secondary rounded text-[10px] text-foreground">Promo: {tx.promoCode}</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-foreground">
                        ₹{(tx.paidAmount || tx.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-emerald-500">
                        +₹{Math.abs(tx.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {transactions.filter((tx: any) => ['Recharge', 'Manual Adjustment'].includes(tx.type)).length === 0 && (
                     <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">No recharge transactions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* Storage Check Modal */}
      {showStorageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-lg shadow-lg overflow-hidden p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-foreground mb-2">Diagnostic Storage Check</h3>
            <p className="text-sm text-muted-foreground mb-6">Running this check performs a Class-A database query to aggregate real-time tenant storage bytes. Proceed?</p>
            
            {storageData ? (
              <div className="bg-secondary/10 border border-border rounded-md p-4 mb-6">
                <p className="text-2xl font-semibold text-foreground mb-3">
                  {((storageData.videoBytes + storageData.documentBytes) / (1024 * 1024 * 1024)).toFixed(3)} GB
                </p>
                <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <span>Video Storage:</span>
                    <span className="font-medium text-foreground">{(storageData.videoBytes / (1024 * 1024 * 1024)).toFixed(3)} GB</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <span>Documents:</span>
                    <span className="font-medium text-foreground">{(storageData.documentBytes / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </div>
              </div>
            ) : storageLoading ? (
              <div className="py-6 flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-muted-foreground animate-pulse">Running diagnostic check...</p>
              </div>
            ) : null}

            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => setShowStorageModal(null)}
                className="flex-1 rounded-md px-4 py-2 border border-border text-foreground text-sm font-medium hover:bg-secondary/50 transition-colors"
              >
                {storageData ? 'Close' : 'Cancel'}
              </button>
              {!storageData && (
                <button 
                  onClick={() => fetchStorageData(showStorageModal)}
                  disabled={storageLoading}
                  className="flex-1 rounded-md px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Run Query
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student Details Overlay Panel */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">{selectedStudent.student.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedStudent.student.email}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Course Enrollments ({selectedStudent.enrollments.length})</h4>
              {selectedStudent.enrollments.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground bg-secondary/10 rounded-md border border-border">This student has not enrolled in any courses.</div>
              ) : (
                <div className="grid gap-3">
                  {selectedStudent.enrollments.map((e: any) => (
                    <div key={e.id} className="p-4 rounded-md border border-border bg-secondary/10 hover:bg-secondary/20 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[9px] font-semibold text-primary font-mono">{e.courseCode || 'NO-CODE'}</span>
                            <h5 className="font-semibold text-foreground text-xs">{e.courseName}</h5>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">Provider: <span className="font-medium text-foreground">{e.institute?.name || e.institute?.brandName || 'Unknown Institute'}</span></p>
                          <p className="text-[10px] text-muted-foreground">Enrolled: {new Date(e.enrolledAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-lg shadow-lg overflow-hidden p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Confirm Deletion</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to permanently delete this {deleteConfirm.type}? This action cannot be undone and will erase all associated data.
            </p>

            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-md px-4 py-2 border border-border text-foreground text-sm font-medium hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 rounded-md px-4 py-2 bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Plan Modal */}
      {showCreatePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-lg shadow-lg overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-foreground mb-4">Create New Plan</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase">Plan Code (e.g. Pro, Ultimate)</label>
                <input 
                  type="text" 
                  value={newPlanForm.planCode} 
                  onChange={e => setNewPlanForm({...newPlanForm, planCode: e.target.value})} 
                  className="w-full bg-secondary/20 border border-input rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary mt-1" 
                  placeholder="Enter code"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase">Plan Name</label>
                <input 
                  type="text" 
                  value={newPlanForm.name} 
                  onChange={e => setNewPlanForm({...newPlanForm, name: e.target.value})} 
                  className="w-full bg-secondary/20 border border-input rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary mt-1" 
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase">Price String (e.g. ₹2999/mo)</label>
                <input 
                  type="text" 
                  value={newPlanForm.price} 
                  onChange={e => setNewPlanForm({...newPlanForm, price: e.target.value})} 
                  className="w-full bg-secondary/20 border border-input rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary mt-1" 
                  placeholder="Enter price"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowCreatePlanModal(false)}
                className="flex-1 rounded-md px-4 py-2 border border-border text-foreground text-sm font-medium hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={submitNewPlan}
                disabled={updatingId === 'create-plan'}
                className="flex-1 rounded-md px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                {updatingId === 'create-plan' ? 'Creating...' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
