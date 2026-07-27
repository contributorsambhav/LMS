"use client";
import { toast } from 'react-toastify';
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
  Compass,
  HardDrive
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "../../../lib/session";
import { API_BASE_URL } from "../../../lib/api";

export default function AdminDashboard() {
  const session = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [institute, setInstitute] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [rechargeAmount, setRechargeAmount] = useState<string>("");
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingCourseApprovals, setPendingCourseApprovals] = useState<any[]>([]);
  const [processingCourseId, setProcessingCourseId] = useState<string | null>(null);
  const [syncingStorage, setSyncingStorage] = useState(false);
  const [roster, setRoster] = useState<{faculties: any[], students: any[]}>({ faculties: [], students: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [expandedDescIds, setExpandedDescIds] = useState<Record<string, boolean>>({});
  const toggleDesc = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedDescIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
      const res = await fetch(`${API_BASE_URL}/api/admin/courses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
      const instRes = await fetch(`${API_BASE_URL}/api/admin/institute`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (instRes.ok) {
        const instData = await instRes.json();
        setInstitute(instData);
      }
      
      const plansRes = await fetch(`${API_BASE_URL}/api/admin/plans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (plansRes.ok) {
        setPlans(await plansRes.json());
      }
      
      const pendingRes = await fetch(`${API_BASE_URL}/api/admin/pending-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (pendingRes.ok) {
        setPendingUsers(await pendingRes.json());
      }

      const pendingCoursesRes = await fetch(`${API_BASE_URL}/api/courses/pending-enrollments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (pendingCoursesRes.ok) {
        setPendingCourseApprovals(await pendingCoursesRes.json());
      }

      const rosterRes = await fetch(`${API_BASE_URL}/api/admin/roster`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (rosterRes.ok) {
        setRoster(await rosterRes.json());
      }
      
      const transRes = await fetch(`${API_BASE_URL}/api/admin/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (transRes.ok) {
        setTransactions(await transRes.json());
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncStorage = async () => {
    if (!session?.token) return;
    setSyncingStorage(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sync-storage`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInstitute((prev: any) => ({ ...prev, storageUsage: data.storageUsage }));
        toast.success('Storage synced successfully with Cloudflare R2!');
      } else {
        toast.error('Failed to sync storage');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setSyncingStorage(false);
    }
  };

  const handleProcessCourseEnrollment = async (enrollmentId: string, status: 'Approved' | 'Rejected') => {
    if (!session?.token) return;
    setProcessingCourseId(enrollmentId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/enrollments/${enrollmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Enrollment ${status.toLowerCase()} successfully`);
        await fetchCourses(session.token);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setProcessingCourseId(null);
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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
      const res = await fetch(`${API_BASE_URL}/api/courses`, {
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
        toast.error(data.message || "Failed to create course.");
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
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/sessions`, {
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
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/materials`, {
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
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/students`, {
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
      toast.error('Please fill in all mandatory fields.');
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

      const res = await fetch(`${API_BASE_URL}/api/courses/${selectedCourse._id}/sessions`, {
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
        toast.error(data.message || 'Failed to add session.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error occurred.');
    } finally {
      setAddingSession(false);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !newMaterialFile || !session?.token) {
      toast.error('Please select a PDF file.');
      return;
    }

    setAddingMaterial(true);
    setMaterialError('');
    setMaterialSuccess('');

    try {
      const formData = new FormData();
      formData.append('title', newMaterialTitle || newMaterialFile.name);
      formData.append('pdf', newMaterialFile);

      const res = await fetch(`${API_BASE_URL}/api/courses/${selectedCourse._id}/materials`, {
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

        toast.success('Material uploaded successfully!');
        await fetchCourseMaterials(selectedCourse._id);
      } else {
        toast.error(data.message || 'Failed to upload material.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error occurred.');
    } finally {
      setAddingMaterial(false);
    }
  };

  const handleEnrollStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || selectedStudentIds.length === 0 || !session?.token) {
      toast.error('Please select at least one student.');
      return;
    }

    setEnrollingStudents(true);
    setEnrollError('');
    setEnrollSuccess('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${selectedCourse._id}/students`, {
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
        toast.success(data.message || 'Students enrolled successfully!');
        await fetchCourseStudents(selectedCourse._id);
      } else {
        toast.error(data.message || 'Failed to enroll students.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error occurred.');
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
        
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-6 text-sm overflow-x-auto pb-1 scrollbar-violet">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'approvals', label: `Approvals (${pendingUsers.length + pendingCourseApprovals.length})` },
          { id: 'rosters', label: 'Rosters' },
          { id: 'courses', label: 'Courses' },
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
      {(activeTab === 'overview' || activeTab === 'courses') && (
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
                      className="bg-card border border-border rounded-lg p-5 hover:bg-secondary/20 transition-colors cursor-pointer flex items-start justify-between"
                    >
                      <div className="flex-1 pr-4">
                        <h4 className="font-semibold text-foreground text-sm line-clamp-1">{course.name}</h4>
                        {course.description && (
                          <p className={`mt-1 text-[11px] text-muted-foreground ${expandedDescIds[course._id] ? '' : 'line-clamp-2'}`}>
                            {expandedDescIds[course._id] || course.description.length <= 120 ? (
                              <>
                                {course.description}
                                {course.description.length > 120 && (
                                  <span onClick={(e) => toggleDesc(e, course._id)} className="text-primary font-medium ml-1 hover:underline cursor-pointer">show less</span>
                                )}
                              </>
                            ) : (
                              <>
                                {course.description.substring(0, 120)}...
                                <span onClick={(e) => toggleDesc(e, course._id)} className="text-primary font-medium ml-1 hover:underline cursor-pointer">read more</span>
                              </>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-xs text-muted-foreground shrink-0">
                        Code: <strong className="text-foreground font-mono font-medium">{course.studentCode}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Resource Usage</h3>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <HardDrive className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Storage Consumed</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Cloudflare R2 & Backblaze B2</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium flex items-center gap-1.5"><PlayCircle className="h-3.5 w-3.5 text-blue-500" /> Video Storage</span>
                      <span className="text-xs font-semibold">
                        {institute?.storageUsage?.videoBytes 
                          ? (institute.storageUsage.videoBytes / (1024 * 1024 * 1024)).toFixed(2) 
                          : '0.00'} GB
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, (institute?.storageUsage?.videoBytes || 0) / (10 * 1024 * 1024 * 1024) * 100)}%` }} // Assumes 10GB limit for visual scale
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-amber-500" /> Document Storage</span>
                      <span className="text-xs font-semibold">
                        {institute?.storageUsage?.documentBytes 
                          ? (institute.storageUsage.documentBytes / (1024 * 1024)).toFixed(2) 
                          : '0.00'} MB
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${Math.min(100, (institute?.storageUsage?.documentBytes || 0) / (1024 * 1024 * 1024) * 100)}%` }} // Assumes 1GB limit for visual scale
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Total Usage:</span>
                    <span className="font-bold text-foreground">
                      {(((institute?.storageUsage?.videoBytes || 0) + (institute?.storageUsage?.documentBytes || 0)) / (1024 * 1024 * 1024)).toFixed(2)} GB
                    </span>
                  </div>
                  <button
                    onClick={handleSyncStorage}
                    disabled={syncingStorage}
                    className="w-full py-2 bg-secondary/50 hover:bg-secondary text-secondary-foreground text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                  >
                    {syncingStorage ? 'Syncing with Cloud...' : 'Sync Storage'}
                  </button>
                </div>
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

      {activeTab === 'billing' && (() => {
        const planPriceStr = plans.find(p => p.planCode === institute?.billingPlan)?.price || '0';
        const numMatch = planPriceStr.match(/\d+/g);
        const planPrice = numMatch ? parseInt(numMatch.join(''), 10) : 0;
        const dailyRate = planPrice / 28;
        const daysLeft = dailyRate > 0 && institute?.walletBalance > 0 ? Math.floor(institute.walletBalance / dailyRate) : 0;
        
        return (
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Prepaid Wallet Billing</h3>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Daily Burn Model</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-secondary/10 border border-border rounded-lg p-6">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Wallet Balance</h4>
              <p className={`text-3xl font-bold ${institute?.walletBalance < 0 ? 'text-destructive' : 'text-foreground'}`}>₹{institute?.walletBalance?.toFixed(2) || '0.00'}</p>
              {institute?.walletBalance < 0 && (
                <p className="text-xs text-destructive mt-2 font-medium">Negative balance! Account suspends in {7 - (institute?.negativeDaysCount || 0)} days.</p>
              )}
            </div>

            <div className="bg-secondary/10 border border-border rounded-lg p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Daily Burn Rate</h4>
                <p className="text-3xl font-bold text-foreground">₹{dailyRate.toFixed(2)}</p>
              </div>
              <div className="mt-4">
                <label className="text-[10px] text-muted-foreground font-medium uppercase mb-1.5 block">Change Plan</label>
                <select 
                  value={institute?.billingPlan || 'Basic'} 
                  onChange={async (e) => {
                    const newPlan = e.target.value;
                    toast.info("Updating plan...");
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/admin/institute`, {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${session?.token}`
                        },
                        body: JSON.stringify({ billingPlan: newPlan })
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setInstitute(data.institute);
                        toast.success("Plan updated! New daily rate apiplies at midnight.");
                      } else {
                        const errorData = await res.json();
                        toast.error(errorData.message || "Failed to update plan");
                      }
                    } catch (error) {
                      toast.error("Network error");
                    }
                  }}
                  className="w-full bg-card border border-input rounded-md px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer"
                >
                  {plans.map(p => (
                    <option key={p.planCode} value={p.planCode}>
                      {p.name} ({p.price} | Max {p.maxStudents || 'Unlimited'} Users | Max {p.maxStorageGB || 'Unlimited'}GB)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-secondary/10 border border-border rounded-lg p-6">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Estimated Days Left</h4>
              <p className={`text-3xl font-bold ${daysLeft <= 3 ? 'text-amber-500' : 'text-emerald-500'}`}>{daysLeft}</p>
              <p className="text-[11px] text-muted-foreground mt-2 leading-tight">After {daysLeft} days, charges double to ₹{(dailyRate * 2).toFixed(2)}/day as a late penalty.</p>
            </div>
          </div>

          <div className="border-t border-border pt-6 mt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-border pt-4">
               <div className="w-full sm:w-auto flex-1">
                 <h4 className="text-sm font-semibold mb-1">Recharge Wallet</h4>
                 <p className="text-xs text-muted-foreground">Add funds to keep your services active</p>
               </div>
               
               <div className="flex items-center gap-2">
                 <div className="relative w-32">
                   <span className="absolute left-3 top-2 text-xs text-muted-foreground">₹</span>
                   <input 
                      type="number" 
                      placeholder={planPrice.toString()}
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      className="bg-card border border-input rounded pl-7 pr-3 py-2 text-xs focus:outline-none focus:border-primary w-full"
                   />
                 </div>
                 <input 
                    type="text" 
                    placeholder="Promo Code" 
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setDiscountPercent(0);
                    }}
                    className="bg-card border border-input rounded px-3 py-2 text-xs focus:outline-none focus:border-primary w-32"
                 />
                 <button 
                    onClick={async () => {
                      if (!promoCode) return toast.error("Enter a promo code");
                      try {
                        const res = await fetch(`${API_BASE_URL}/api/admin/validate-promo`, {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${session?.token}`
                          },
                          body: JSON.stringify({ code: promoCode })
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setDiscountPercent(data.discountPercentage);
                          toast.success(`Promo applied! ${data.discountPercentage}% off.`);
                        } else {
                          toast.error(data.message || "Invalid code");
                          setDiscountPercent(0);
                        }
                      } catch(e) {
                        toast.error("Error validating code");
                      }
                    }}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-2 rounded font-medium text-xs transition-colors"
                 >
                   Apply
                 </button>
               </div>
               
               <button 
                 onClick={async () => {
                    const finalRechargeAmount = parseFloat(rechargeAmount) || planPrice;
                    if(finalRechargeAmount <= 0) return toast.error('Invalid amount for recharge');
                    
                    try {
                      const orderRes = await fetch(`${API_BASE_URL}/api/auth/create-order`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ amount: finalRechargeAmount, promoCode: discountPercent > 0 ? promoCode : undefined })
                      });
                      
                      if (!orderRes.ok) {
                          return toast.error("Failed to initialize payment.");
                      }
                      
                      const order = await orderRes.json();
                      const discountedPrice = finalRechargeAmount - (finalRechargeAmount * discountPercent / 100);
                      
                      const options = {
                          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                          amount: order.amount,
                          currency: order.currency,
                          name: "LumenLMS Wallet Recharge",
                          description: `Adding ₹${finalRechargeAmount} to Wallet`,
                          order_id: order.id,
                          handler: async function (response: any) {
                              toast.info("Verifying payment...");
                              try {
                                const verifyRes = await fetch(`${API_BASE_URL}/api/admin/verify-recharge`, {
                                    method: 'POST',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      Authorization: `Bearer ${session?.token}`
                                    },
                                    body: JSON.stringify({
                                        razorpay_payment_id: response.razorpay_payment_id,
                                        razorpay_order_id: response.razorpay_order_id,
                                        razorpay_signature: response.razorpay_signature,
                                        amount: finalRechargeAmount,
                                        paidAmount: discountPercent > 0 ? discountedPrice : finalRechargeAmount,
                                        promoCode: discountPercent > 0 ? promoCode : undefined
                                    })
                                });
                                if (verifyRes.ok) {
                                    const verifyData = await verifyRes.json();
                                    setInstitute(verifyData.institute);
                                    toast.success(`Successfully added ₹${finalRechargeAmount} to wallet!`);
                                    setPromoCode("");
                                    setDiscountPercent(0);
                                    setRechargeAmount("");
                                } else {
                                    toast.error("Payment verification failed.");
                                }
                              } catch(e) {
                                toast.error("Error verifying payment.");
                              }
                          },
                          prefill: {
                              name: institute?.legalName,
                              contact: institute?.phoneNumber
                          },
                          theme: {
                              color: "#3399cc"
                          }
                      };
                      
                      const rzp1 = new (window as any).Razorpay(options);
                      rzp1.open();
                    } catch (e) {
                      toast.error("Payment service is currently unavailable.");
                    }
                 }}
                 className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer"
               >
                 {(() => {
                   const finalRechargeAmount = parseFloat(rechargeAmount) || planPrice;
                   const discountedPrice = finalRechargeAmount - (finalRechargeAmount * discountPercent / 100);
                   return `Add ₹${finalRechargeAmount} ${discountPercent > 0 ? `(Pay ₹${discountedPrice})` : ''}`;
                 })()}
               </button>
             </div>
           </div>

           {/* Transaction History Table */}
           <div className="border-t border-border pt-6 mt-6">
             <h4 className="text-sm font-semibold mb-4">Transaction History</h4>
             {transactions.length === 0 ? (
               <div className="text-center py-6 text-xs text-muted-foreground bg-secondary/10 rounded-md border border-border">
                 No transactions found.
               </div>
             ) : (
               <div className="overflow-x-auto rounded-md border border-border">
                 <table className="w-full text-left text-[11px]">
                   <thead className="bg-secondary/20 text-muted-foreground border-b border-border">
                     <tr>
                       <th className="px-4 py-3 font-medium">Date</th>
                       <th className="px-4 py-3 font-medium">Type</th>
                       <th className="px-4 py-3 font-medium">Description</th>
                       <th className="px-4 py-3 font-medium text-right">Paid</th>
                       <th className="px-4 py-3 font-medium text-right">Credited</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border">
                     {transactions.map((tx: any) => (
                       <tr key={tx._id} className="hover:bg-secondary/5 transition-colors">
                         <td className="px-4 py-3 whitespace-nowrap">{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                         <td className="px-4 py-3">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${tx.type === 'Recharge' ? 'bg-emerald-500/10 text-emerald-500' : tx.type === 'Penalty' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                             {tx.type}
                           </span>
                         </td>
                         <td className="px-4 py-3 text-muted-foreground">
                           {tx.description}
                           {tx.promoCode && <span className="ml-2 px-1.5 py-0.5 bg-secondary rounded text-[10px] text-foreground">Promo: {tx.promoCode}</span>}
                         </td>
                         <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-foreground">
                            {tx.type === 'Recharge' ? `₹${(tx.paidAmount || tx.amount).toFixed(2)}` : '-'}
                         </td>
                         <td className={`px-4 py-3 whitespace-nowrap text-right font-medium ${tx.amount > 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                           {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toFixed(2)}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
           </div>
         </div>
         );
       })()}

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
                            const res = await fetch(`${API_BASE_URL}/api/admin/users/${user._id}/status`, {
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
                            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
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

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-border">
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Course Enrollment Requests</h3>
                <p className="text-[11px] text-muted-foreground mt-1">Review and grant course access to students who requested to join.</p>
              </div>
              <span className="rounded bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">{pendingCourseApprovals.length} Pending</span>
            </div>

            {pendingCourseApprovals.length === 0 ? (
              <div className="text-center py-12 rounded-md border border-dashed border-border bg-secondary/10">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-xs font-semibold text-foreground">All caught up!</p>
                <p className="text-[11px] text-muted-foreground mt-1">No pending student join requests waiting.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingCourseApprovals.map((req: any) => (
                  <div key={req.id} className="flex items-center justify-between rounded-md border border-border bg-secondary/15 p-4">
                    <div>
                      <h4 className="font-semibold text-xs text-foreground">{req.student?.name}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{req.student?.email}</p>
                      <p className="text-[10px] text-primary font-medium mt-2">Requested to join: <span className="font-semibold">{req.course?.name}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        disabled={processingCourseId === req.id}
                        onClick={() => handleProcessCourseEnrollment(req.id, 'Approved')}
                        className="rounded bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Approve
                      </button>
                      <button 
                        disabled={processingCourseId === req.id}
                        onClick={() => handleProcessCourseEnrollment(req.id, 'Rejected')}
                        className="rounded bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
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
                      const res = await fetch(`${API_BASE_URL}/api/admin/institute`, {
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
                        toast.error("Failed to update settings");
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
                      <option key={p.planCode} value={p.planCode}>
                        {p.name} ({p.price} | Max {p.maxStudents || 'Unlimited'} Users | Max {p.maxStorageGB || 'Unlimited'}GB)
                      </option>
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
