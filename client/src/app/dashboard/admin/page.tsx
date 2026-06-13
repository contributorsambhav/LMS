"use client";
import React, { useEffect, useState } from "react";
import { 
  Building, 
  Users, 
  Shield, 
  Plus,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  X,
  FileText,
  BookOpen,
  PlayCircle,
  Compass
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "../../../lib/session";

export default function AdminDashboard() {
  const session = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
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

  // Course Creation State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createCourseCode, setCreateCourseCode] = useState("");
  const [creating, setCreating] = useState(false);

  // Course Details Modal State
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [detailsTab, setDetailsTab] = useState<'sessions' | 'materials' | 'roster'>('sessions');
  const [sessions, setSessions] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // New Session Input State
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionDesc, setNewSessionDesc] = useState('');
  const [newSessionStart, setNewSessionStart] = useState('');
  const [newSessionEnd, setNewSessionEnd] = useState('');
  const [newSessionLiveLink, setNewSessionLiveLink] = useState('');
  const [newSessionRecordedVideo, setNewSessionRecordedVideo] = useState('');
  const [newSessionFiles, setNewSessionFiles] = useState<FileList | null>(null);
  const [autoGenerateZoom, setAutoGenerateZoom] = useState(true);
  const [addingSession, setAddingSession] = useState(false);
  const [sessionError, setSessionError] = useState('');

  // Bulk Student Add State
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [enrollingStudents, setEnrollingStudents] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');

  // Independent Course Material Input State
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialFile, setNewMaterialFile] = useState<File | null>(null);
  const [addingMaterial, setAddingMaterial] = useState(false);
  const [materialError, setMaterialError] = useState('');
  const [materialSuccess, setMaterialSuccess] = useState('');

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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName || !createDesc || !createCourseCode || !session?.token) return;
    setCreating(true);
    try {
      const res = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({ 
          name: createName, 
          description: createDesc, 
          courseCode: createCourseCode 
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCreateName("");
        setCreateDesc("");
        setCreateCourseCode("");
        setIsCreateOpen(false);
        await fetchCourses(session.token);
      } else {
        alert(data.message || "Failed to create course.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const fetchCourseSessions = async (courseId: string) => {
    if (!session?.token) return;
    setLoadingSessions(true);
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/sessions`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (res.ok) {
        setSessions(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchCourseMaterials = async (courseId: string) => {
    if (!session?.token) return;
    setLoadingMaterials(true);
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/materials`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (res.ok) {
        setMaterials(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const fetchCourseStudents = async (courseId: string) => {
    if (!session?.token) return;
    setLoadingStudents(true);
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/students`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (res.ok) {
        setStudents(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const openCourseDetails = (course: any) => {
    router.push(`/dashboard/courses/${course._id}`);
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const isZoomActive = !!(institute?.zoomAccountId && institute?.zoomClientId && institute?.zoomClientSecret);
    const requiresLiveLink = !isZoomActive || !autoGenerateZoom;

    if (!selectedCourse || !newSessionTitle || !newSessionStart || !newSessionEnd || (requiresLiveLink && !newSessionLiveLink) || !session?.token) {
      setSessionError('Please fill in all mandatory fields.');
      return;
    }

    setAddingSession(true);
    setSessionError('');

    try {
      const formData = new FormData();
      formData.append('title', newSessionTitle);
      formData.append('description', newSessionDesc);
      formData.append('startTime', newSessionStart);
      formData.append('endTime', newSessionEnd);
      formData.append('recordedVideo', newSessionRecordedVideo);
      formData.append('autoGenerateZoom', String(isZoomActive && autoGenerateZoom));

      if (!isZoomActive || !autoGenerateZoom) {
        formData.append('liveLink', newSessionLiveLink);
      }

      if (newSessionFiles) {
        for (let i = 0; i < newSessionFiles.length; i++) {
          formData.append('pdfs', newSessionFiles[i]);
        }
      }

      const res = await fetch(`http://localhost:5000/api/courses/${selectedCourse._id}/sessions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setNewSessionTitle('');
        setNewSessionDesc('');
        setNewSessionLiveLink('');
        setNewSessionRecordedVideo('');
        setNewSessionFiles(null);
        
        const fileInput = document.getElementById('session-files') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        await fetchCourseSessions(selectedCourse._id);
        await fetchCourseMaterials(selectedCourse._id);
      } else {
        setSessionError(data.message || 'Failed to add session.');
      }
    } catch (error) {
      console.error(error);
      setSessionError('Network error occurred.');
    } finally {
      setAddingSession(false);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !newMaterialFile || !session?.token) {
      setMaterialError('Please select a PDF file.');
      return;
    }

    setAddingMaterial(true);
    setMaterialError('');
    setMaterialSuccess('');

    try {
      const formData = new FormData();
      formData.append('title', newMaterialTitle || newMaterialFile.name);
      formData.append('pdf', newMaterialFile);

      const res = await fetch(`http://localhost:5000/api/courses/${selectedCourse._id}/materials`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setNewMaterialTitle('');
        setNewMaterialFile(null);
        
        const fileInput = document.getElementById('material-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        setMaterialSuccess('Material uploaded successfully!');
        await fetchCourseMaterials(selectedCourse._id);
      } else {
        setMaterialError(data.message || 'Failed to upload material.');
      }
    } catch (error) {
      console.error(error);
      setMaterialError('Network error occurred.');
    } finally {
      setAddingMaterial(false);
    }
  };

  const handleEnrollStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || selectedStudentIds.length === 0 || !session?.token) {
      setEnrollError('Please select at least one student.');
      return;
    }

    setEnrollingStudents(true);
    setEnrollError('');
    setEnrollSuccess('');

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${selectedCourse._id}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({ studentIds: selectedStudentIds })
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedStudentIds([]);
        setEnrollSuccess(data.message || 'Students enrolled successfully!');
        await fetchCourseStudents(selectedCourse._id);
      } else {
        setEnrollError(data.message || 'Failed to enroll students.');
      }
    } catch (error) {
      console.error(error);
      setEnrollError('Network error occurred.');
    } finally {
      setEnrollingStudents(false);
    }
  };

  if (!session) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const coursesCount = courses.length;

  return (
    <div className="space-y-8 font-sans antialiased text-foreground">
      {/* Dynamic Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            Institute Admin Console
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Manage your institute: courses, rosters, and billing.</p>
        </div>
        <div className="rounded-md bg-secondary border border-border px-3 py-1.5 text-xs text-muted-foreground font-medium self-start md:self-auto flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Tenant: {session.instituteId ? 'Linked Tenant' : 'No Tenant Linked'}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-6 text-sm overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'approvals', label: `Approvals (${pendingUsers.length})` },
          { id: 'rosters', label: 'Rosters' },
          { id: 'departments', label: 'Departments' },
          { id: 'billing', label: 'Billing' },
          { id: 'settings', label: 'Settings' }
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`pb-2.5 font-medium transition-colors shrink-0 border-b-2 cursor-pointer ${
              activeTab === tab.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Courses', val: coursesCount, desc: 'Active courses in this institute', icon: Building },
              { label: 'Total Faculty', val: roster.faculties.length, desc: 'Approved faculty members', icon: Users },
              { label: 'Students', val: roster.students.length, desc: 'Enrolled students', icon: Users },
              { label: 'License', val: plans.find(p => p.planCode === institute?.billingPlan)?.name || institute?.billingPlan || 'Managed', desc: 'Active billing plan tier', icon: Shield }
            ].map((stat, i) => {
              const Icon = stat.icon as any;
              return (
                <div key={i} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-semibold text-foreground mt-2 leading-none">{stat.val}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{stat.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Courses Overview</h3>
                <button 
                  onClick={() => setIsCreateOpen(true)}
                  className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Create Course
                </button>
              </div>

              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : courses.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center text-xs text-muted-foreground">No courses found for this institute. Create your first course to get started.</div>
              ) : (
                <div className="grid gap-3">
                  {courses.map((course: any) => (
                    <div 
                      key={course._id} 
                      onClick={() => openCourseDetails(course)}
                      className="bg-card border border-border rounded-lg p-5 hover:bg-secondary/20 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{course.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{course.description}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        Code: <strong className="text-foreground font-mono font-medium">{course.studentCode}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Quick Actions</h3>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                <button className="w-full rounded-md border border-border bg-card px-4 py-2.5 text-left text-xs font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer">Onboard Faculty Roster</button>
                <button className="w-full rounded-md border border-border bg-card px-4 py-2.5 text-left text-xs font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer">Onboard Student Roster</button>
                <button className="w-full rounded-md border border-border bg-card px-4 py-2.5 text-left text-xs font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer">Generate Reports</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rosters' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Approved Faculty</h3>
                <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">{roster.faculties.length} Total</span>
              </div>
              <div className="space-y-3">
                {roster.faculties.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No approved faculty members yet.</p>}
                {roster.faculties.map((fac) => (
                  <div key={fac._id} className="flex justify-between items-center rounded-md border border-border bg-secondary/10 p-3">
                    <div>
                      <h4 className="font-semibold text-xs text-foreground">{fac.name}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{fac.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Enrolled Students</h3>
                <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">{roster.students.length} Total</span>
              </div>
              <div className="space-y-3">
                {roster.students.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No approved students yet.</p>}
                {roster.students.map((stu) => (
                  <div key={stu._id} className="flex justify-between items-center rounded-md border border-border bg-secondary/10 p-3">
                    <div>
                      <h4 className="font-semibold text-xs text-foreground">{stu.name}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{stu.email}</p>
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
          <div className="bg-card border border-border rounded-lg p-8 text-center text-xs text-muted-foreground">
            No departmental records found. Integrate your real department records from the API.
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Billing</h3>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Managed by Platform</span>
          </div>

          <div className="bg-secondary/10 border border-border rounded-md p-8 text-center text-xs text-muted-foreground">
            Billing and invoice history will appear here when connected to backend billing data.
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-border">
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending User Approvals</h3>
                <p className="text-[11px] text-muted-foreground mt-1">Review and grant access to faculty and students registering for your institute.</p>
              </div>
              <span className="rounded bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">{pendingUsers.length} Pending</span>
            </div>

            {pendingUsers.length === 0 ? (
              <div className="text-center py-12 rounded-md border border-dashed border-border bg-secondary/10">
                <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-xs font-semibold text-foreground">All caught up!</p>
                <p className="text-[11px] text-muted-foreground mt-1">No pending registrations waiting for your approval.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map(user => (
                  <div key={user._id} className="flex items-center justify-between rounded-md border border-border bg-secondary/15 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-foreground">{user.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[11px] text-muted-foreground">{user.email}</p>
                          <span className="text-[9px] text-muted-foreground px-1.5 py-0.5 rounded border border-border bg-secondary font-medium uppercase">{user.role}</span>
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
                        className="rounded-md bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 text-xs font-medium disabled:opacity-50 transition-colors cursor-pointer"
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
                        className="rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 px-3 py-1.5 text-xs font-medium disabled:opacity-50 transition-colors cursor-pointer"
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
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Institutional Configurations</h3>
            {!isEditingSettings ? (
              <button 
                onClick={() => { setEditForm(institute); setIsEditingSettings(true); }}
                className="rounded-md border border-border bg-card hover:bg-secondary px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
              >
                Edit Details
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditingSettings(false)}
                  disabled={savingSettings}
                  className="rounded-md border border-border hover:bg-secondary bg-card px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
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
                  className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {savingSettings ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
          
          <div className="grid gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-border pb-6">
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Legal Name</label>
                {isEditingSettings ? (
                  <input type="text" value={editForm.legalName || ''} onChange={(e) => setEditForm({...editForm, legalName: e.target.value})} className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none" />
                ) : (
                  <div className="rounded-md border border-border bg-secondary/10 p-3 text-xs text-foreground">
                    {institute?.legalName || 'N/A'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Brand Name</label>
                {isEditingSettings ? (
                  <input type="text" value={editForm.brandName || ''} onChange={(e) => setEditForm({...editForm, brandName: e.target.value})} className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none" />
                ) : (
                  <div className="rounded-md border border-border bg-secondary/10 p-3 text-xs text-foreground">
                    {institute?.brandName || 'N/A'}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-border pb-6">
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Contact Email</label>
                {isEditingSettings ? (
                  <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none" />
                ) : (
                  <div className="rounded-md border border-border bg-secondary/10 p-3 text-xs text-foreground">
                    {institute?.email || 'N/A'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Phone Number</label>
                {isEditingSettings ? (
                  <input type="tel" value={editForm.phoneNumber || ''} onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})} className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none" />
                ) : (
                  <div className="rounded-md border border-border bg-secondary/10 p-3 text-xs text-foreground">
                    {institute?.phoneNumber || 'N/A'}
                  </div>
                )}
              </div>
            </div>

            <div className="border-b border-border pb-6">
              <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Physical Address</label>
              {isEditingSettings ? (
                <textarea value={editForm.address || ''} onChange={(e) => setEditForm({...editForm, address: e.target.value})} rows={2} className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none resize-none" />
              ) : (
                <div className="rounded-md border border-border bg-secondary/10 p-3 text-xs text-foreground whitespace-pre-wrap">
                  {institute?.address || 'N/A'}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Platform Status</label>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`inline-block h-2 w-2 rounded-full ${institute?.status === 'Active' ? 'bg-emerald-500' : institute?.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                  <span className="text-xs font-semibold text-foreground uppercase">{institute?.status || 'Unknown'}</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Billing Plan</label>
                {isEditingSettings ? (
                  <select 
                    value={editForm.billingPlan || 'Basic'} 
                    onChange={e => setEditForm({...editForm, billingPlan: e.target.value})}
                    className="w-full bg-card border border-input rounded-md px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    {plans.map(p => (
                      <option key={p.planCode} value={p.planCode}>{p.name} ({p.price})</option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-md border border-primary/20 bg-primary/10 p-3 text-xs text-primary font-medium">
                    {(() => {
                      const matchedPlan = plans.find(p => p.planCode === institute?.billingPlan);
                      if (matchedPlan) return matchedPlan.name;
                      const rawPlan = institute?.billingPlan || 'Basic';
                      return rawPlan.toLowerCase().includes('plan') ? rawPlan : `${rawPlan} Plan`;
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Zoom Integration Section */}
            <div className="border-t border-border pt-6 mt-2">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Zoom Server-to-Server OAuth Integration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Zoom Account ID</label>
                  {isEditingSettings ? (
                    <input 
                      type="text" 
                      value={editForm.zoomAccountId || ''} 
                      onChange={(e) => setEditForm({...editForm, zoomAccountId: e.target.value})} 
                      placeholder="Account ID"
                      className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none" 
                    />
                  ) : (
                    <div className="rounded-md border border-border bg-secondary/10 p-3 text-xs text-foreground truncate">
                      {institute?.zoomAccountId || 'Not Configured'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Zoom Client ID</label>
                  {isEditingSettings ? (
                    <input 
                      type="text" 
                      value={editForm.zoomClientId || ''} 
                      onChange={(e) => setEditForm({...editForm, zoomClientId: e.target.value})} 
                      placeholder="Client ID"
                      className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none" 
                    />
                  ) : (
                    <div className="rounded-md border border-border bg-secondary/10 p-3 text-xs text-foreground truncate">
                      {institute?.zoomClientId || 'Not Configured'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Zoom Client Secret</label>
                  {isEditingSettings ? (
                    <input 
                      type="password" 
                      value={editForm.zoomClientSecret || ''} 
                      onChange={(e) => setEditForm({...editForm, zoomClientSecret: e.target.value})} 
                      placeholder="Client Secret"
                      className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none" 
                    />
                  ) : (
                    <div className="rounded-md border border-border bg-secondary/10 p-3 text-xs text-foreground truncate">
                      {institute?.zoomClientSecret ? '••••••••••••••••' : 'Not Configured'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-xl overflow-hidden">
            <div className="border-b border-border p-6 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-foreground">Create New Course</h2>
              <button onClick={() => setIsCreateOpen(false)} className="rounded hover:bg-secondary p-1">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleCreateCourse}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Course Code (Unique for Institute)</label>
                  <input 
                    type="text" 
                    required 
                    value={createCourseCode} 
                    onChange={e => setCreateCourseCode(e.target.value)} 
                    placeholder="e.g. CS-101"
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Course Name</label>
                  <input 
                    type="text" 
                    required 
                    value={createName} 
                    onChange={e => setCreateName(e.target.value)} 
                    placeholder="e.g. Introduction to Computer Science"
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Description</label>
                  <textarea 
                    required 
                    rows={3}
                    value={createDesc} 
                    onChange={e => setCreateDesc(e.target.value)} 
                    placeholder="Provide a comprehensive course description."
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>
              <div className="border-t border-border bg-secondary/5 p-6 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded border border-border bg-card hover:bg-secondary px-4 py-2 text-xs font-medium text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={creating}
                  className="rounded bg-primary hover:bg-primary/90 px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50 cursor-pointer"
                >
                  {creating ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Detail Modal removed */}
    </div>
  );
}
