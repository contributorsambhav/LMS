'use client';

import { Activity, AlertTriangle, BookOpen, Building, CheckCircle2, CreditCard, Database, HelpCircle, Mail, MapPin, Play, Plus, Server, Settings, ShieldCheck, Sparkles, Terminal, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';
import { useUser } from '../../../lib/session';

export default function SuperAdminDashboard() {
  const session = useUser();
  const searchParams = useSearchParams();
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Student Details Modal
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loadingStudentDetails, setLoadingStudentDetails] = useState(false);

  // Action state
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | ''>('');

  // Edit Plan State
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<any>({});

  const fetchInstitutes = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/super/institutes', {
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
      const res = await fetch('http://localhost:5000/api/super/verifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVerifications(data || []);
      }

      // Fetch dynamic pricing plans
      const plansRes = await fetch('http://localhost:5000/api/super/plans', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (plansRes.ok) {
        setPlans(await plansRes.json());
      }

      // Fetch all students
      const studentsRes = await fetch('http://localhost:5000/api/super/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (studentsRes.ok) {
        setStudents(await studentsRes.json());
      }
    } catch (e) {
      console.error('Failed to fetch verifications:', e);
    }
  };

  useEffect(() => {
    const token = session?.token;
    if (token) {
      fetchInstitutes(token);
      fetchVerifications(token);
    } else {
      // If session exists but no backend token was provided,
      // stop the loader so the empty-state UI can render.
      setLoading(false);
    }
  }, [session?.token, session]);

  const handleApproveVerification = async (id: string) => {
    const token = session?.token;
    if (!token) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/super/verifications/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackType('success');
        setFeedbackMsg(data.message || 'Verification approved.');
        await fetchInstitutes(token);
        await fetchVerifications(token);
      } else {
        setFeedbackType('error');
        setFeedbackMsg(data.message || 'Failed to approve.');
      }
    } catch (e) {
      setFeedbackType('error');
      setFeedbackMsg('Network error approving verification.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejectVerification = async (id: string) => {
    const token = session?.token;
    if (!token) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/super/verifications/${id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackType('success');
        setFeedbackMsg(data.message || 'Verification rejected.');
        await fetchVerifications(token);
        await fetchInstitutes(token);
      } else {
        setFeedbackType('error');
        setFeedbackMsg(data.message || 'Failed to reject.');
      }
    } catch (e) {
      setFeedbackType('error');
      setFeedbackMsg('Network error rejecting verification.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Sync active tab with `?tab=` query param (so sidebar links work)
  useEffect(() => {
    const tabParam = searchParams?.get('tab') || 'overview';
    setActiveTab(tabParam);
  }, [searchParams?.toString()]);

  const handleStatusChange = async (instId: string, currentStatus: string) => {
    const token = session?.token;
    if (!token) return;

    // Determine target status
    // If pending/suspended -> "Active". If active -> "Suspended"
    const targetStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';

    setUpdatingId(instId);
    setFeedbackMsg('');
    setFeedbackType('');

    try {
      const res = await fetch(`http://localhost:5000/api/super/institutes/${instId}/status`, {
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
        setFeedbackMsg(data.message || `Successfully marked institute as ${targetStatus}!`);
        // Refresh local data
        await fetchInstitutes(token);
      } else {
        setFeedbackType('error');
        setFeedbackMsg(data.message || 'Failed to update status.');
      }
    } catch (error) {
      setFeedbackType('error');
      setFeedbackMsg('Network error updating status.');
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
      const res = await fetch(`http://localhost:5000/api/super/institutes/${instId}/billing`, {
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
        setFeedbackMsg(data.message || 'Successfully updated billing plan!');
        // Refresh local data
        await fetchInstitutes(token);
      } else {
        setFeedbackType('error');
        setFeedbackMsg(data.message || 'Failed to update billing plan.');
      }
    } catch (error) {
      setFeedbackType('error');
      setFeedbackMsg('Network error updating billing.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteTenant = async (instId: string) => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this tenant, its configurations, and all its users? This action cannot be undone.')) return;
    
    const token = session?.token;
    if (!token) return;

    setUpdatingId(instId);
    setFeedbackMsg('');
    setFeedbackType('');

    try {
      const res = await fetch(`http://localhost:5000/api/super/institutes/${instId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (res.ok) {
        setFeedbackType('success');
        setFeedbackMsg(data.message || 'Tenant completely deleted.');
        await fetchInstitutes(token);
      } else {
        setFeedbackType('error');
        setFeedbackMsg(data.message || 'Failed to delete tenant.');
      }
    } catch (error) {
      setFeedbackType('error');
      setFeedbackMsg('Network error deleting tenant.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdatePlan = async () => {
    const token = session?.token;
    if (!token || !editingPlanId) return;

    try {
      const res = await fetch(`http://localhost:5000/api/super/plans/${editingPlanId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(planForm)
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh plans list
        const plansRes = await fetch('http://localhost:5000/api/super/plans', { headers: { Authorization: `Bearer ${token}` } });
        if (plansRes.ok) setPlans(await plansRes.json());
        setEditingPlanId(null);
        setFeedbackType('success');
        setFeedbackMsg('Plan pricing parameters updated successfully!');
      } else {
        alert(data.message || 'Failed to update plan');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteStudent = async (e: React.MouseEvent, studentId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to completely delete this student?')) return;
    
    const token = session?.token;
    if (!token) return;

    setUpdatingId(studentId);
    setFeedbackMsg('');
    setFeedbackType('');

    try {
      const res = await fetch(`http://localhost:5000/api/super/users/${studentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackType('success');
        setFeedbackMsg(data.message || 'Student deleted.');
        if (selectedStudent?.student?._id === studentId) setSelectedStudent(null);
        await fetchInstitutes(token);
      } else {
        setFeedbackType('error');
        setFeedbackMsg(data.message || 'Failed to delete student.');
      }
    } catch (error) {
      setFeedbackType('error');
      setFeedbackMsg('Network error deleting student.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewStudentDetails = async (studentId: string) => {
    const token = session?.token;
    if (!token) return;

    setLoadingStudentDetails(true);
    setSelectedStudent(null);
    try {
      const res = await fetch(`http://localhost:5000/api/super/students/${studentId}/details`, {
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  // System stats calculated dynamically
  const pendingRequests = institutes.filter((inst) => inst.status === 'Pending').length;
  const activeTenants = institutes.filter((inst) => inst.status === 'Active').length;
  const suspendedTenants = institutes.filter((inst) => inst.status === 'Suspended').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Dynamic Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display flex items-center gap-2">
            Super Admin Terminal <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">Global orchestrator panel. Regulate multi-tenant lifecycles, track engine performance metrics, and approve clients.</p>
        </div>
        <div className="rounded-full bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 text-xs text-zinc-300 font-semibold self-start md:self-auto flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse" />
          System Status: Optimal
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-zinc-800 gap-4 text-sm overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'tenants', label: `Tenants Management (${institutes.length})` },
          { id: 'students', label: `Global Students (${students.length})` },
          { id: 'billing', label: 'Billing Plans' },
          { id: 'health', label: 'Diagnostics' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setFeedbackMsg('');
            }}
            className={`pb-2 font-semibold transition-colors shrink-0 ${activeTab === tab.id ? 'border-b-2 border-purple-500 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Action Feedback alerts */}
      {feedbackMsg && <div className={`p-4 rounded-xl border text-sm ${feedbackType === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>{feedbackMsg}</div>}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Status Metrics Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Active Tenants', val: activeTenants, desc: 'Onboarded and live clients', icon: Building, color: 'text-blue-400' },
              { label: 'Pending Approvals', val: pendingRequests, desc: 'Awaiting SuperAdmin activation', icon: AlertTriangle, color: pendingRequests > 0 ? 'text-amber-400 animate-pulse' : 'text-zinc-500' },
              { label: 'Suspended Clients', val: suspendedTenants, desc: 'In-active platform blocks', icon: ShieldCheck, color: 'text-rose-400' },
              { label: 'Hardware Clusters', val: 'Optimal', desc: 'Mongoose database pools', icon: Server, color: 'text-purple-400' }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="glass border border-white/5 rounded-xl p-5 shadow-xl relative overflow-hidden">
                  <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-white/5 blur-xl" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                    <Icon className={`h-4.5 w-4.5 ${stat.color}`} />
                  </div>
                  <p className="text-xl md:text-2xl font-extrabold text-white mt-2 leading-none">{stat.val}</p>
                  <p className="text-[10px] text-zinc-400 mt-2">{stat.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Pending verification requests list */}
          {verifications.length > 0 && (
            <div className="glass border border-white/5 rounded-xl p-5 shadow-xl">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400 mb-3">Pending Verification Requests</h3>
              <div className="space-y-3">
                {verifications.map((v: any) => (
                  <div key={v._id || v.id} className="flex items-center justify-between border-b border-zinc-900/40 pb-3">
                    <div>
                      <p className="font-bold text-white">{v.institute?.name || v.instituteId?.name || String(v.instituteId || 'Unknown')}</p>
                      <p className="text-xs text-zinc-400">Requested by: {v.admin?.email || v.adminId?.email || String(v.adminId || 'Unknown')}</p>
                      <p className="text-xs text-zinc-500 mt-1">Submitted: {v.createdAt ? new Date(v.createdAt).toLocaleString() : '—'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button disabled={updatingId === (v._id || v.id)} onClick={() => handleApproveVerification(v._id || v.id)} className="rounded px-3 py-1.5 text-xs font-black bg-emerald-500 text-black">
                        Approve
                      </button>
                      <button disabled={updatingId === (v._id || v.id)} onClick={() => handleRejectVerification(v._id || v.id)} className="rounded px-3 py-1.5 text-xs font-black bg-rose-500 text-white">
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
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400">Platform Tenants</h3>
                <span className="text-xs text-zinc-500 font-semibold">{institutes.length} registered</span>
              </div>

              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                </div>
              ) : institutes.length === 0 ? (
                <div className="glass border border-white/5 rounded-xl p-8 text-center text-zinc-500">No registered tenants currently found on MongoDB.</div>
              ) : (
                <div className="grid gap-4">
                  {institutes.map((inst: any) => (
                    <div key={inst.id} className="glass border border-white/5 hover:border-white/10 rounded-xl p-5 shadow-lg transition-all group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-300 font-mono">{inst.billingPlan}</span>
                            <span className="text-[10px] text-zinc-500 font-semibold flex items-center gap-2">
                              <span>{inst.usage.courses} Courses</span>
                              <span>•</span>
                              <span>{inst.usage.faculty} Faculty</span>
                              <span>•</span>
                              <span>{inst.usage.students} Students</span>
                            </span>
                          </div>
                          <h4 className="font-bold text-white text-base mt-1.5 group-hover:text-purple-300 transition-colors">{inst.name}</h4>
                          <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-zinc-500" /> Admin: {inst.admin?.email || 'Unknown'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${inst.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : inst.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>{inst.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Static diagnostics details / live terminal log emulation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400">System Logs</h3>
                <span className="text-xs text-zinc-500 font-semibold">Live Monitor</span>
              </div>

              <div className="glass border border-white/5 rounded-xl p-5 shadow-xl font-mono text-[10px] space-y-4 max-h-[350px] overflow-y-auto bg-zinc-950/90 text-zinc-400 border-zinc-900">
                <div className="border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">11:51:20</span>
                    <span className="font-bold text-purple-400">[INFO]</span>
                  </div>
                  <p className="mt-1 text-zinc-300 leading-normal">SuperAdmin authenticated via Secure code successfully.</p>
                </div>
                <div className="border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">11:48:02</span>
                    <span className="font-bold text-purple-400">[INFO]</span>
                  </div>
                  <p className="mt-1 text-zinc-300 leading-normal">Database indexes verified. Course join keys active.</p>
                </div>
                <div className="border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">11:32:15</span>
                    <span className="font-bold text-amber-400">[WARN]</span>
                  </div>
                  <p className="mt-1 text-zinc-300 leading-normal">Google OAuth configuration loaded. Local Dev Sandbox active.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tenants Management Tab */}
      {activeTab === 'tenants' && (
        <div className="glass border border-white/5 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400">Tenant Allocations & Status</h3>
            <span className="text-xs text-zinc-500 font-semibold">{institutes.length} total clients</span>
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <th className="pb-3 pr-4">Institution Name</th>
                    <th className="pb-3 pr-4">Admin Email</th>
                    <th className="pb-3 pr-4">Billing Plan</th>
                    <th className="pb-3 pr-4">Course Load</th>
                    <th className="pb-3 pr-4">Total Users</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 text-right">Action Gate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-sm">
                  {institutes.map((inst: any) => (
                    <tr key={inst.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 font-bold text-white pr-4">{inst.name}</td>
                      <td className="py-4 text-zinc-400 pr-4">{inst.admin?.email || 'Unknown'}</td>
                      <td className="py-4 pr-4">
                        <select value={inst.billingPlan} onChange={(e) => handleBillingChange(inst.id, e.target.value)} disabled={updatingId === inst.id} className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-semibold py-1 px-2 rounded focus:outline-none focus:border-purple-500">
                          {plans.map(p => (
                            <option key={p.planCode} value={p.planCode}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 font-mono text-purple-400 pr-4">{inst.usage.courses}</td>
                      <td className="py-4 text-zinc-400 pr-4">{inst.usage.faculty + inst.usage.students}</td>
                      <td className="py-4 pr-4">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest ${inst.status === 'Active' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : inst.status === 'Pending' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 animate-pulse' : 'bg-rose-500/10 text-rose-300 border-rose-500/20'}`}>{inst.status}</span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button disabled={updatingId === inst.id} onClick={() => handleStatusChange(inst.id, inst.status)} className={`rounded px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${inst.status === 'Active' ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20' : inst.status === 'Pending' ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-md shadow-emerald-500/10' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'} disabled:opacity-50`}>
                            {updatingId === inst.id ? 'Wait...' : inst.status === 'Active' ? 'Suspend' : inst.status === 'Pending' ? 'Approve' : 'Activate'}
                          </button>
                          <button disabled={updatingId === inst.id} onClick={() => handleDeleteTenant(inst.id)} className="rounded px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 disabled:opacity-50">
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
        <div className="glass border border-white/5 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400">Global Student Directory</h3>
            <span className="text-xs text-zinc-500 font-semibold">{students.length} total students</span>
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <th className="pb-3 pr-4">Student Name</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Base Institute</th>
                    <th className="pb-3 pr-4">Account Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-sm">
                  {students.map((student: any) => (
                    <tr key={student._id} onClick={() => handleViewStudentDetails(student._id)} className="hover:bg-white/5 transition-colors cursor-pointer group">
                      <td className="py-4 font-bold text-white pr-4 group-hover:text-purple-400 transition-colors">{student.name}</td>
                      <td className="py-4 text-zinc-400 pr-4">{student.email}</td>
                      <td className="py-4 text-zinc-400 pr-4">{student.instituteId?.name || 'Independent Learner'}</td>
                      <td className="py-4 pr-4">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest ${student.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : student.status === 'Pending' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 animate-pulse' : 'bg-rose-500/10 text-rose-300 border-rose-500/20'}`}>{student.status}</span>
                      </td>
                      <td className="py-4 text-right">
                        <button disabled={updatingId === student._id} onClick={(e) => handleDeleteStudent(e, student._id)} className="rounded px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 disabled:opacity-50">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 && (
                <div className="text-center py-8 text-sm text-zinc-500">No students are currently registered on the platform.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Subscription Plans Configuration */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {plans.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-zinc-500">Loading live plans from database...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {plans.map((plan: any) => (
                <div key={plan._id} className="glass border border-white/5 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between p-6 relative">
                  {editingPlanId === plan._id ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400">{plan.name}</h4>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Price</label>
                        <input type="text" value={planForm.price || ''} onChange={e => setPlanForm({...planForm, price: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500 mt-1" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">API Limit</label>
                        <input type="text" value={planForm.apiLimit || ''} onChange={e => setPlanForm({...planForm, apiLimit: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500 mt-1" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Details</label>
                        <textarea value={planForm.details || ''} onChange={e => setPlanForm({...planForm, details: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500 mt-1 resize-none" rows={2} />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button onClick={handleUpdatePlan} className="w-full rounded bg-purple-500 hover:bg-purple-400 py-1.5 text-xs font-bold text-white transition-colors">Save</button>
                        <button onClick={() => setEditingPlanId(null)} className="w-full rounded bg-zinc-800 hover:bg-zinc-700 py-1.5 text-xs font-bold text-white transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400">{plan.name}</h4>
                          <CreditCard className="h-4.5 w-4.5 text-purple-400" />
                        </div>

                        <p className="text-3xl font-black text-white">{plan.price}</p>
                        <p className="text-xs text-zinc-500">
                          API limits configuration: <strong className="text-white">{plan.apiLimit}</strong>
                        </p>

                        <div className="h-1 bg-zinc-900 rounded-full my-4" />
                        <p className="text-xs text-zinc-400 font-semibold">{plan.details}</p>
                      </div>

                      <button onClick={() => { setEditingPlanId(plan._id); setPlanForm({ price: plan.price, apiLimit: plan.apiLimit, details: plan.details }); }} className="w-full mt-6 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 py-2.5 text-xs font-bold text-white transition-colors">Modify Pricing Parameters</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Diagnostics Health checks */}
      {activeTab === 'health' && (
        <div className="glass border border-white/5 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400">Live Hardware Monitors</h3>
            <span className="text-xs text-purple-400 font-semibold flex items-center gap-1.5">
              <Activity className="h-4 w-4 animate-bounce" /> Optimal diagnostics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Database pool size</span>
              <p className="text-2xl font-black text-white mt-1">18 / 50</p>
              <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-purple-500" style={{ width: '36%' }} />
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Memory usage load</span>
              <p className="text-2xl font-black text-white mt-1">4.2 GB / 16 GB</p>
              <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-blue-500" style={{ width: '26%' }} />
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Storage capacity</span>
              <p className="text-2xl font-black text-white mt-1">14.8 GB / 100 GB</p>
              <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-emerald-500" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Overlay Panel */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] p-5">
              <div>
                <h3 className="text-xl font-extrabold text-white">{selectedStudent.student.name}</h3>
                <p className="text-sm text-zinc-400 mt-0.5">{selectedStudent.student.email}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Course Enrollments ({selectedStudent.enrollments.length})</h4>
              {selectedStudent.enrollments.length === 0 ? (
                <div className="text-center py-8 text-sm text-zinc-500 bg-zinc-900/30 rounded-xl border border-zinc-900">This student has not enrolled in any courses.</div>
              ) : (
                <div className="grid gap-3">
                  {selectedStudent.enrollments.map((e: any) => (
                    <div key={e.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="rounded bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-300 font-mono">{e.courseCode || 'NO-CODE'}</span>
                            <h5 className="font-bold text-white text-sm">{e.courseName}</h5>
                          </div>
                          <p className="text-xs text-zinc-400 mb-2">Provider: <span className="font-semibold text-zinc-300">{e.institute?.name || e.institute?.brandName || 'Unknown Institute'}</span></p>
                          <p className="text-[10px] text-zinc-500">Enrolled: {new Date(e.enrolledAt).toLocaleDateString()}</p>
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
    </div>
  );
}
