"use client";
import React, { useEffect, useState } from "react";
import { 
  Building, 
  Users, 
  FileText, 
  CheckCircle2, 
  Mail,
  Shield,
  Sparkles,
  Plus
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useUser } from "../../../lib/session";

export default function AdminDashboard() {
  const session = useUser();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<any[]>([]);
  const [institute, setInstitute] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [roster, setRoster] = useState<{faculties: any[], students: any[]}>({ faculties: [], students: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Approval action states
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Settings Edit State
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [savingSettings, setSavingSettings] = useState(false);

  // Fetch courses from backend when session is ready
  const fetchCourses = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/admin/courses", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
      const instRes = await fetch("http://localhost:5000/api/admin/institute", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (instRes.ok) {
        const instData = await instRes.json();
        setInstitute(instData);
      }
      
      const plansRes = await fetch("http://localhost:5000/api/admin/plans", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (plansRes.ok) {
        setPlans(await plansRes.json());
      }
      
      const pendingRes = await fetch("http://localhost:5000/api/admin/pending-users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (pendingRes.ok) {
        setPendingUsers(await pendingRes.json());
      }

      const rosterRes = await fetch("http://localhost:5000/api/admin/roster", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (rosterRes.ok) {
        setRoster(await rosterRes.json());
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = session?.token;
    if (token) {
      fetchCourses(token);
    } else {
      setLoading(false);
    }
  }, [session?.token, session]);

  // Sync active tab with `?tab=` query param (sidebar navigation)
  useEffect(() => {
    const tabParam = searchParams?.get("tab") || "overview";
    setActiveTab(tabParam);
  }, [searchParams]);

  if (!session) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const coursesCount = courses.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display flex items-center gap-2">
            Institute Admin Console <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">Manage your institute: courses, rosters, and billing.</p>
        </div>
        <div className="rounded-full bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 text-xs text-zinc-300 font-semibold self-start md:self-auto flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          Tenant: {session.instituteId ? 'Linked Tenant' : 'No Tenant Linked'}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 gap-4 text-sm overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'approvals', label: `Approvals (${pendingUsers.length})` },
          { id: 'rosters', label: 'Rosters' },
          { id: 'departments', label: 'Departments' },
          { id: 'billing', label: 'Billing' },
          { id: 'settings', label: 'Settings' }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-2 font-semibold transition-colors shrink-0 ${activeTab === tab.id ? 'border-b-2 border-amber-500 text-white' : 'text-zinc-400 hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Courses', val: coursesCount, desc: 'Active courses in this institute', icon: Building, color: 'text-amber-400' },
              { label: 'Total Faculty', val: roster.faculties.length, desc: 'Approved faculty members', icon: Users, color: 'text-emerald-400' },
              { label: 'Students', val: roster.students.length, desc: 'Enrolled students', icon: Users, color: 'text-blue-400' },
              { label: 'License', val: plans.find(p => p.planCode === institute?.billingPlan)?.name || institute?.billingPlan || 'Managed', desc: 'Active billing plan tier', icon: Shield, color: 'text-purple-400' }
            ].map((stat, i) => {
              const Icon = stat.icon as any;
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400">Courses Overview</h3>
                <button className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black">
                  <Plus className="h-3.5 w-3.5" /> Create Course
                </button>
              </div>

              {loading ? (
                <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" /></div>
              ) : courses.length === 0 ? (
                <div className="glass border border-white/5 rounded-xl p-8 text-center text-zinc-500">No courses found for this institute. Create your first course to get started.</div>
              ) : (
                <div className="grid gap-4">
                  {courses.map((course: any) => (
                    <div key={course._id} className="glass border border-white/5 hover:border-white/10 rounded-xl p-5 shadow-lg transition-all group">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-white text-base">{course.name}</h4>
                          <p className="text-xs text-zinc-400 mt-1">{course.description}</p>
                        </div>
                        <div className="text-right text-zinc-400">Code: <strong className="text-white">{course.studentCode}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400">Quick Actions</h3>
                <span className="text-xs text-zinc-500 font-semibold">Tools</span>
              </div>

              <div className="glass border border-white/5 rounded-xl p-5 shadow-xl space-y-4">
                <button className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3.5 text-left text-sm font-semibold text-zinc-200">Onboard Faculty Roster</button>
                <button className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3.5 text-left text-sm font-semibold text-zinc-200">Onboard Student Roster</button>
                <button className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3.5 text-left text-sm font-semibold text-zinc-200">Generate Reports</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rosters' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="glass border border-white/5 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-emerald-400">Approved Faculty</h3>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-300">{roster.faculties.length} Total</span>
              </div>
              <div className="space-y-3">
                {roster.faculties.length === 0 && <p className="text-xs text-zinc-500 py-4 text-center">No approved faculty members yet.</p>}
                {roster.faculties.map((fac) => (
                  <div key={fac._id} className="flex justify-between items-center rounded-lg border border-white/5 bg-white/5 p-3">
                    <div>
                      <h4 className="font-bold text-sm text-white">{fac.name}</h4>
                      <p className="text-xs text-zinc-400">{fac.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass border border-white/5 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-blue-400">Enrolled Students</h3>
                <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-[10px] font-bold text-blue-300">{roster.students.length} Total</span>
              </div>
              <div className="space-y-3">
                {roster.students.length === 0 && <p className="text-xs text-zinc-500 py-4 text-center">No approved students yet.</p>}
                {roster.students.map((stu) => (
                  <div key={stu._id} className="flex justify-between items-center rounded-lg border border-white/5 bg-white/5 p-3">
                    <div>
                      <h4 className="font-bold text-sm text-white">{stu.name}</h4>
                      <p className="text-xs text-zinc-400">{stu.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass border border-white/5 rounded-xl p-6 text-center text-zinc-500">No departmental mock data. Integrate your real department records from the API.</div>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="glass border border-white/5 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400">Billing</h3>
            <span className="text-xs text-zinc-500">Managed by platform</span>
          </div>

          <div className="glass border border-white/5 rounded-xl p-8 text-center text-zinc-500">Billing and invoice history will appear here when connected to backend billing data.</div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="glass border border-white/5 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-amber-400">Pending User Approvals</h3>
                <p className="text-xs text-zinc-400 mt-1">Review and grant access to faculty and students registering for your institute.</p>
              </div>
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400">{pendingUsers.length} Pending</span>
            </div>

            {pendingUsers.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-dashed border-white/10 bg-white/5">
                <Shield className="h-10 w-10 text-zinc-500 mx-auto mb-3" />
                <p className="text-sm font-semibold text-zinc-400">All caught up!</p>
                <p className="text-xs text-zinc-500 mt-1">No pending registrations waiting for your approval.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map(user => (
                  <div key={user._id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{user.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-zinc-400">{user.email}</p>
                          <span className="text-[10px] text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-700 font-bold uppercase">{user.role}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        disabled={updatingUserId === user._id}
                        onClick={async () => {
                          if (!session?.token) return;
                          setUpdatingUserId(user._id);
                          try {
                            const res = await fetch(`http://localhost:5000/api/admin/users/${user._id}/status`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
                              body: JSON.stringify({ status: 'Approved' })
                            });
                            if (res.ok) await fetchCourses(session.token);
                          } finally {
                            setUpdatingUserId(null);
                          }
                        }}
                        className="rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-400 disabled:opacity-50 transition-colors"
                      >
                        Approve
                      </button>
                      <button 
                        disabled={updatingUserId === user._id}
                        onClick={async () => {
                          if (!session?.token) return;
                          if (!confirm("Are you sure you want to reject and remove this user?")) return;
                          setUpdatingUserId(user._id);
                          try {
                            // Using the remove endpoint which is /api/admin/faculties/:id or students/:id
                            const endpoint = user.role === 'Faculty' ? `/api/admin/faculties/${user._id}` : `/api/admin/students/${user._id}`;
                            const res = await fetch(`http://localhost:5000${endpoint}`, {
                              method: 'DELETE',
                              headers: { Authorization: `Bearer ${session.token}` }
                            });
                            if (res.ok) await fetchCourses(session.token);
                          } finally {
                            setUpdatingUserId(null);
                          }
                        }}
                        className="rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-400 disabled:opacity-50 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="glass border border-white/5 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400">Institutional Configurations</h3>
            {!isEditingSettings ? (
              <button 
                onClick={() => { setEditForm(institute); setIsEditingSettings(true); }}
                className="rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 px-3 py-1.5 text-xs font-bold transition-colors"
              >
                Edit Details
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditingSettings(false)}
                  disabled={savingSettings}
                  className="rounded-lg bg-white/5 text-zinc-300 hover:bg-white/10 px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    setSavingSettings(true);
                    try {
                      const res = await fetch("http://localhost:5000/api/admin/institute", {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${session?.token}`
                        },
                        body: JSON.stringify(editForm)
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setInstitute(data.institute);
                        setIsEditingSettings(false);
                      } else {
                        alert("Failed to update settings");
                      }
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setSavingSettings(false);
                    }
                  }}
                  disabled={savingSettings}
                  className="rounded-lg bg-amber-500 text-black hover:bg-amber-400 px-3 py-1.5 text-xs font-black transition-colors disabled:opacity-50"
                >
                  {savingSettings ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
          
          <div className="grid gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-zinc-900 pb-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Legal Name</label>
                {isEditingSettings ? (
                  <input type="text" value={editForm.legalName || ''} onChange={(e) => setEditForm({...editForm, legalName: e.target.value})} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none" />
                ) : (
                  <div className="rounded-lg border border-zinc-900 bg-zinc-900/30 p-3 text-sm font-semibold text-white">
                    {institute?.legalName || 'N/A'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Brand Name</label>
                {isEditingSettings ? (
                  <input type="text" value={editForm.brandName || ''} onChange={(e) => setEditForm({...editForm, brandName: e.target.value})} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none" />
                ) : (
                  <div className="rounded-lg border border-zinc-900 bg-zinc-900/30 p-3 text-sm font-semibold text-white">
                    {institute?.brandName || 'N/A'}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-zinc-900 pb-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Contact Email</label>
                {isEditingSettings ? (
                  <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none" />
                ) : (
                  <div className="rounded-lg border border-zinc-900 bg-zinc-900/30 p-3 text-sm font-semibold text-white">
                    {institute?.email || 'N/A'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Phone Number</label>
                {isEditingSettings ? (
                  <input type="tel" value={editForm.phoneNumber || ''} onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none" />
                ) : (
                  <div className="rounded-lg border border-zinc-900 bg-zinc-900/30 p-3 text-sm font-semibold text-white">
                    {institute?.phoneNumber || 'N/A'}
                  </div>
                )}
              </div>
            </div>

            <div className="border-b border-zinc-900 pb-6">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Physical Address</label>
              {isEditingSettings ? (
                <textarea value={editForm.address || ''} onChange={(e) => setEditForm({...editForm, address: e.target.value})} rows={2} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none resize-none" />
              ) : (
                <div className="rounded-lg border border-zinc-900 bg-zinc-900/30 p-3 text-sm font-semibold text-white whitespace-pre-wrap">
                  {institute?.address || 'N/A'}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Platform Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${institute?.status === 'Active' ? 'bg-emerald-500' : institute?.status === 'Pending' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span className="text-sm font-bold text-white uppercase">{institute?.status || 'Unknown'}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Billing Plan</label>
                {isEditingSettings ? (
                  <select 
                    value={editForm.billingPlan || 'Basic'} 
                    onChange={e => setEditForm({...editForm, billingPlan: e.target.value})}
                    className="w-full bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2 text-sm font-bold text-purple-400 focus:outline-none focus:border-purple-500"
                  >
                    {plans.map(p => (
                      <option key={p.planCode} value={p.planCode}>{p.name} ({p.price})</option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-lg border border-zinc-900 bg-purple-500/10 p-3 text-sm font-bold text-purple-400">
                    {plans.find(p => p.planCode === institute?.billingPlan)?.name || institute?.billingPlan || 'Basic'} Plan
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
