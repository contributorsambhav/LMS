'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '../../../../lib/session';
import { 
  ArrowLeft, BookOpen, Calendar, LayoutList, Users, FileText, Plus, Trash2, Edit, 
  Copy, Check, ExternalLink, Video, Clock, UserCheck, UserMinus, 
  AlertCircle, CheckCircle2, FileUp, Sparkles, ShieldAlert 
} from 'lucide-react';
import SessionCalendar from '../../../../components/SessionCalendar';

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();
  const session = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data states
  const [courseData, setCourseData] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courseFaculty, setCourseFaculty] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  
  // Institute records (for dropdowns)
  const [instituteStudents, setInstituteStudents] = useState<any[]>([]);
  const [instituteFaculty, setInstituteFaculty] = useState<any[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<'sessions' | 'materials' | 'roster'>('sessions');
  const [sessionView, setSessionView] = useState<'list' | 'calendar'>('list');
  const [isCopied, setIsCopied] = useState<Record<string, boolean>>({});
  
  // Modal / Form toggle states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAssignFacultyModal, setShowAssignFacultyModal] = useState(false);

  // Form states - Edit Course
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  
  // Form states - Add Session
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDesc, setSessionDesc] = useState('');
  const [sessionStart, setSessionStart] = useState('');
  const [sessionEnd, setSessionEnd] = useState('');
  const [sessionLiveLink, setSessionLiveLink] = useState('');
  const [sessionVideo, setSessionVideo] = useState('');
  const [sessionFaculty, setSessionFaculty] = useState('');
  const [sessionFiles, setSessionFiles] = useState<FileList | null>(null);
  const [sessionError, setSessionError] = useState('');
  const [sessionSuccess, setSessionSuccess] = useState('');
  const [sessionSubmitting, setSessionSubmitting] = useState(false);
  const [autoGenerateZoom, setAutoGenerateZoom] = useState(true);
  const [isZoomActive, setIsZoomActive] = useState(false);

  // Form states - Upload Material
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [materialError, setMaterialError] = useState('');
  const [materialSuccess, setMaterialSuccess] = useState('');
  const [materialSubmitting, setMaterialSubmitting] = useState(false);

  // Form states - Direct Student Enrollment
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);

  // Form states - Faculty Assignment
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>([]);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // Copy code helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied({ ...isCopied, [key]: true });
    setTimeout(() => {
      setIsCopied(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  // Auth roles
  const isAdmin = session?.role === 'admin';
  const isFaculty = session?.role === 'faculty';
  const isStudent = session?.role === 'student';

  const fetchCourseData = async () => {
    if (!session?.token || !courseId) return;
    try {
      // 1. Fetch Course details and Stats
      const courseRes = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (!courseRes.ok) throw new Error("Failed to retrieve course details.");
      const details = await courseRes.json();
      setCourseData(details.course);

      // Pre-fill edit fields
      setEditName(details.course.name);
      setEditDesc(details.course.description || '');
      setEditCode(details.course.courseCode || '');

      // 2. Fetch Sessions
      const sessionsRes = await fetch(`http://localhost:5000/api/courses/${courseId}/sessions`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (sessionsRes.ok) setSessions(await sessionsRes.json());

      // 3. Fetch Materials
      const materialsRes = await fetch(`http://localhost:5000/api/courses/${courseId}/materials`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (materialsRes.ok) setMaterials(await materialsRes.json());

      // 4. Fetch Students
      const studentsRes = await fetch(`http://localhost:5000/api/courses/${courseId}/students`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (studentsRes.ok) setStudents(await studentsRes.json());

      // 5. Fetch assigned Faculty
      const facultyRes = await fetch(`http://localhost:5000/api/courses/${courseId}/faculty`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (facultyRes.ok) setCourseFaculty(await facultyRes.json());

      // 6. Fetch pending enrollment approvals (Admins / Faculty)
      if (isAdmin || isFaculty) {
        const pendingRes = await fetch(`http://localhost:5000/api/courses/pending-enrollments`, {
          headers: { Authorization: `Bearer ${session.token}` }
        });
        if (pendingRes.ok) {
          const allPending = await pendingRes.json();
          // Filter to only match current courseId
          const coursePending = allPending.filter((e: any) => e.courseId?._id === courseId);
          setPendingRequests(coursePending);
        }

        // Fetch roster students registry
        const registryRes = await fetch(`http://localhost:5000/api/courses/students`, {
          headers: { Authorization: `Bearer ${session.token}` }
        });
        if (registryRes.ok) setInstituteStudents(await registryRes.json());
      }

      // 7. Fetch all institute faculty (Admins only)
      if (isAdmin) {
        const instituteFacultyRes = await fetch(`http://localhost:5000/api/courses/institute-faculty`, {
          headers: { Authorization: `Bearer ${session.token}` }
        });
        if (instituteFacultyRes.ok) setInstituteFaculty(await instituteFacultyRes.json());
      }

      // 8. Fetch user profile / check Zoom configuration status
      const profileRes = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setIsZoomActive(!!profile.isZoomConfigured);
        setAutoGenerateZoom(!!profile.isZoomConfigured);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while loading this course.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId, session]);

  // Form - Update Course
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token || !editName || !editCode) {
      setEditError('Course Name and Course Code are required.');
      return;
    }
    setEditError('');
    setEditSuccess('');

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({
          name: editName,
          description: editDesc,
          courseCode: editCode
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.message || 'Failed to update course details.');
      } else {
        setEditSuccess('Course updated successfully!');
        setCourseData(data.course);
        setTimeout(() => setShowEditModal(false), 1200);
      }
    } catch (err) {
      setEditError('Network error updating course.');
    }
  };

  // Form - Delete Course
  const handleDeleteCourse = async () => {
    if (!confirm('Are you absolutely sure you want to delete this course? This will permanently delete all classes, rosters, and uploaded materials.')) return;
    if (!session?.token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (res.ok) {
        router.push(`/dashboard/${session.role}`);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete course.');
      }
    } catch (err) {
      alert('Network error deleting course.');
    }
  };

  // Form - Add Session
  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) return;
    if (!sessionTitle || !sessionStart || !sessionEnd) {
      setSessionError('Please fill in all mandatory fields.');
      return;
    }
    if (!autoGenerateZoom && !sessionLiveLink) {
      setSessionError('Please provide a Live Link or enable Zoom auto-generation.');
      return;
    }
    setSessionError('');
    setSessionSuccess('');
    setSessionSubmitting(true);

    const formData = new FormData();
    formData.append('title', sessionTitle);
    formData.append('description', sessionDesc);
    formData.append('startTime', sessionStart);
    formData.append('endTime', sessionEnd);
    formData.append('autoGenerateZoom', String(autoGenerateZoom));
    if (!autoGenerateZoom) {
      formData.append('liveLink', sessionLiveLink);
    }
    formData.append('recordedVideo', sessionVideo);
    if (sessionFaculty) formData.append('facultyId', sessionFaculty);
    
    if (sessionFiles) {
      for (let i = 0; i < sessionFiles.length; i++) {
        formData.append('pdfs', sessionFiles[i]);
      }
    }

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/sessions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        setSessionError(data.message || 'Failed to schedule session.');
      } else {
        setSessionSuccess(data.message || 'Lecture session scheduled successfully!');
        // Reset form
        setSessionTitle('');
        setSessionDesc('');
        setSessionLiveLink('');
        setSessionVideo('');
        setSessionFaculty('');
        setSessionFiles(null);
        setAutoGenerateZoom(true);
        // Refresh
        fetchCourseData();
        setTimeout(() => setShowAddSessionModal(false), 1200);
      }
    } catch (err) {
      setSessionError('Network error scheduling session.');
    } finally {
      setSessionSubmitting(false);
    }
  };

  // Form - Upload Material (Independent)
  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) return;
    if (!materialFile) {
      setMaterialError('Please select a PDF file.');
      return;
    }

    setMaterialError('');
    setMaterialSuccess('');
    setMaterialSubmitting(true);

    const formData = new FormData();
    formData.append('title', materialTitle);
    formData.append('pdf', materialFile);

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/materials`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        setMaterialError(data.message || 'Failed to upload material.');
      } else {
        setMaterialSuccess('Material uploaded successfully!');
        setMaterialTitle('');
        setMaterialFile(null);
        fetchCourseData();
        setTimeout(() => setShowAddMaterialModal(false), 1200);
      }
    } catch (err) {
      setMaterialError('Network error uploading material.');
    } finally {
      setMaterialSubmitting(false);
    }
  };

  // Form - Enroll Students
  const handleEnrollStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) return;
    if (selectedStudentIds.length === 0) {
      setEnrollError('Please select at least one student.');
      return;
    }

    setEnrollError('');
    setEnrollSuccess('');
    setEnrollSubmitting(true);

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({ studentIds: selectedStudentIds })
      });

      const data = await res.json();
      if (!res.ok) {
        setEnrollError(data.message || 'Failed to enroll students.');
      } else {
        setEnrollSuccess(`Successfully enrolled ${selectedStudentIds.length} students.`);
        setSelectedStudentIds([]);
        fetchCourseData();
        setTimeout(() => setShowAddStudentModal(false), 1200);
      }
    } catch (err) {
      setEnrollError('Network error enrolling students.');
    } finally {
      setEnrollSubmitting(false);
    }
  };

  // Form - Assign Faculty
  const handleAssignFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) return;
    if (selectedFacultyIds.length === 0) {
      setAssignError('Please select at least one faculty member.');
      return;
    }

    setAssignError('');
    setAssignSuccess('');
    setAssignSubmitting(true);

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/assign-faculty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({ facultyIds: selectedFacultyIds })
      });

      const data = await res.json();
      if (!res.ok) {
        setAssignError(data.message || 'Failed to assign faculty.');
      } else {
        setAssignSuccess(`Successfully assigned ${selectedFacultyIds.length} faculty.`);
        setSelectedFacultyIds([]);
        fetchCourseData();
        setTimeout(() => setShowAssignFacultyModal(false), 1200);
      }
    } catch (err) {
      setAssignError('Network error assigning faculty.');
    } finally {
      setAssignSubmitting(false);
    }
  };

  // Action - Unassign Faculty
  const handleUnassignFaculty = async (facultyId: string) => {
    if (!confirm('Are you sure you want to unassign this faculty member from this course?')) return;
    if (!session?.token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/unassign-faculty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({ facultyId })
      });
      if (res.ok) {
        fetchCourseData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to unassign faculty.');
      }
    } catch (err) {
      alert('Network error unassigning faculty.');
    }
  };

  // Action - Remove Student
  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student from this course?')) return;
    if (!session?.token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/students/${studentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (res.ok) {
        fetchCourseData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to remove student.');
      }
    } catch (err) {
      alert('Network error removing student.');
    }
  };

  // Action - Resolve Enrollment Request
  const handleResolveEnrollment = async (requestId: string, status: 'Approved' | 'Rejected') => {
    if (!session?.token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/courses/enrollments/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchCourseData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update request.');
      }
    } catch (err) {
      alert('Network error resolving request.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm font-medium text-muted-foreground">Loading course portal...</span>
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="container max-w-lg mx-auto py-24 px-4 text-center">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-base font-semibold text-foreground mb-2">Access Denied or Course Not Found</h3>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            {error || 'We could not fetch the course requested. Make sure you are registered and approved in this course.'}
          </p>
          <button 
            onClick={() => router.push(`/dashboard/${session?.role || ''}`)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8 animate-in fade-in duration-300">
      
      {/* Back Button */}
      <button 
        onClick={() => router.push(`/dashboard/${session?.role}`)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
        Back to Dashboard
      </button>

      {/* Header Panel */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden">
        <div className="space-y-4 max-w-2xl relative z-10">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="rounded bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary font-mono">
              Code: {courseData.courseCode}
            </span>
            <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
              {session?.role} view
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{courseData.name}</h1>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-sans">{courseData.description}</p>
          </div>

          {/* Join Codes (Admin & Faculty only) */}
          {(isAdmin || isFaculty) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center justify-between gap-4 bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs">
                <span className="text-muted-foreground font-medium">Student Join Code:</span>
                <div className="flex items-center gap-1.5">
                  <code className="font-mono font-bold text-foreground text-sm">{courseData.studentCode}</code>
                  <button 
                    onClick={() => copyToClipboard(courseData.studentCode, 'student')} 
                    className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {isCopied['student'] ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs">
                <span className="text-muted-foreground font-medium">Faculty Join Code:</span>
                <div className="flex items-center gap-1.5">
                  <code className="font-mono font-bold text-foreground text-sm">{courseData.facultyCode}</code>
                  <button 
                    onClick={() => copyToClipboard(courseData.facultyCode, 'faculty')} 
                    className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {isCopied['faculty'] ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Panel / Stats */}
        <div className="flex flex-col justify-between items-end gap-6 min-w-[200px] border-t md:border-t-0 pt-6 md:pt-0 md:border-l border-border md:pl-8">
          {/* Quick numbers */}
          <div className="grid grid-cols-3 gap-6 w-full md:w-auto text-center md:text-right">
            <div>
              <p className="text-xl font-bold text-foreground">{sessions.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Sessions</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{students.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Students</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{courseFaculty.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Faculty</p>
            </div>
          </div>

          {/* Admin CRUD controls */}
          {isAdmin && (
            <div className="flex gap-2 w-full justify-end">
              <button 
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5" /> Edit
              </button>
              <button 
                onClick={handleDeleteCourse}
                className="inline-flex items-center gap-1.5 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/25 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border space-x-1 shrink-0">
        {(['sessions', 'materials', 'roster'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 cursor-pointer capitalize transition-all ${
              activeTab === tab 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'sessions' ? 'Lectures & Sessions' : tab === 'materials' ? `Course Materials (${materials.length})` : `Class Roster (${students.length + courseFaculty.length})`}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        
        {/* 1. SESSIONS TAB */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            
            {/* Header + Add button */}
            <div className="flex justify-between items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Lecture Calendar</h3>
                <p className="text-xs text-muted-foreground">List of upcoming and past classroom lectures.</p>
              </div>
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center bg-secondary/30 border border-border rounded-md p-0.5">
                  <button
                    onClick={() => setSessionView('list')}
                    className={`flex items-center gap-1 rounded px-2.5 py-1 text-[10px] font-semibold transition-colors cursor-pointer ${
                      sessionView === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <LayoutList className="h-3 w-3" /> List
                  </button>
                  <button
                    onClick={() => setSessionView('calendar')}
                    className={`flex items-center gap-1 rounded px-2.5 py-1 text-[10px] font-semibold transition-colors cursor-pointer ${
                      sessionView === 'calendar' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Calendar className="h-3 w-3" /> Calendar
                  </button>
                </div>
                {(isAdmin || isFaculty) && (
                  <button 
                    onClick={() => {
                      const now = new Date();
                      setSessionStart(now.toISOString().slice(0, 16));
                      setSessionEnd(new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16));
                      setShowAddSessionModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Schedule Session
                  </button>
                )}
              </div>
            </div>

            {/* Sessions view */}
            {sessionView === 'calendar' ? (
              <SessionCalendar sessions={sessions} showJoinButton={true} />
            ) : sessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <h4 className="text-xs font-semibold text-foreground mb-1">No Lectures Scheduled</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  {isAdmin || isFaculty 
                    ? "Schedule your first interactive classroom lecture to share attachments, zoom links, and materials." 
                    : "No lectures have been scheduled for this curriculum yet."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sessions.map((sess) => {
                  const start = new Date(sess.startTime);
                  const end = new Date(sess.endTime);
                  const isUpcoming = end > new Date();
                  
                  return (
                    <div key={sess._id} className={`bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row justify-between gap-6 hover:shadow-sm transition-all ${isUpcoming ? 'ring-1 ring-primary/20 border-primary/30' : 'opacity-85'}`}>
                      <div className="space-y-3 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isUpcoming ? (
                            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Upcoming
                            </span>
                          ) : (
                            <span className="bg-secondary border border-border text-muted-foreground rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                              Concluded
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-foreground">{sess.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{sess.description}</p>
                        </div>

                        {/* Faculty assigned display */}
                        {sess.facultyId && (
                          <p className="text-[10px] text-muted-foreground font-medium">
                            Conducted by: <span className="text-foreground font-semibold">{sess.facultyId.name}</span> ({sess.facultyId.email})
                          </p>
                        )}

                        {/* Attachments */}
                        {sess.attachments && sess.attachments.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Class Materials & PDF attachments:</p>
                            <div className="flex flex-wrap gap-2">
                              {sess.attachments.map((fileUrl: string, idx: number) => {
                                const filename = fileUrl.split('/').pop() || `Attachment-${idx + 1}`;
                                return (
                                  <a
                                    key={idx}
                                    href={`http://localhost:5000${fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded border border-border bg-secondary/20 hover:bg-secondary px-2.5 py-1 text-[11px] text-foreground transition-colors"
                                  >
                                    <FileText className="h-3 w-3 text-red-500" />
                                    <span>{filename.slice(14) || filename}</span>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex md:flex-col justify-end items-end gap-3.5 border-t md:border-t-0 pt-4 md:pt-0 border-border">
                        <a
                          href={sess.liveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all w-full md:w-auto text-center justify-center"
                        >
                          Join Zoom Lecture <ExternalLink className="h-3 w-3" />
                        </a>

                        {/* Host Start URL (Faculty/Admin only) */}
                        {(isAdmin || isFaculty) && sess.zoomStartUrl && (
                          <a
                            href={sess.zoomStartUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-md border border-blue-500/20 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors w-full md:w-auto text-center justify-center"
                          >
                            Start as Host <ExternalLink className="h-3 w-3" />
                          </a>
                        )}

                        {/* Zoom Meeting Password */}
                        {sess.zoomPassword && (
                          <div className="text-[10px] text-muted-foreground font-mono">
                            Passcode: <span className="text-foreground font-semibold">{sess.zoomPassword}</span>
                          </div>
                        )}
                        
                        {sess.recordedVideo && (
                          <a
                            href={sess.recordedVideo}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors w-full md:w-auto text-center justify-center"
                          >
                            <Video className="h-3.5 w-3.5 text-muted-foreground" /> Watch Recording
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. MATERIALS TAB */}
        {activeTab === 'materials' && (
          <div className="space-y-6">
            
            {/* Header + Add button */}
            <div className="flex justify-between items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Reference Catalog</h3>
                <p className="text-xs text-muted-foreground">Access reference documents, lecture notes, and uploads.</p>
              </div>
              {(isAdmin || isFaculty) && (
                <button 
                  onClick={() => setShowAddMaterialModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Upload Material
                </button>
              )}
            </div>

            {/* Materials List */}
            {materials.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <h4 className="text-xs font-semibold text-foreground mb-1">No Materials Uploaded</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  {isAdmin || isFaculty 
                    ? "Upload standalone references, syllabus files, and lecture notes for enrolled students." 
                    : "No reference materials have been uploaded by teachers yet."}
                </p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-secondary/15 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                        <th className="p-4">Name / Reference Document</th>
                        <th className="p-4">Session Context</th>
                        <th className="p-4">Uploaded At</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {materials.map((mat) => (
                        <tr key={mat._id} className="hover:bg-secondary/10 transition-colors">
                          <td className="p-4 font-semibold text-foreground">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-red-500 shrink-0" />
                              <span>{mat.title || mat.originalName}</span>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {mat.sessionId ? (
                              <span className="text-primary font-medium">{mat.sessionId.title}</span>
                            ) : (
                              <span className="text-muted-foreground italic">General Reference</span>
                            )}
                          </td>
                          <td className="p-4 text-muted-foreground font-mono">
                            {new Date(mat.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="p-4 text-right">
                            <a
                              href={`http://localhost:5000${mat.filePath}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              Download PDF <ExternalLink className="h-3 w-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. ROSTER TAB */}
        {activeTab === 'roster' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Enrollment Approvals Section (Admins/Faculty) */}
            {(isAdmin || isFaculty) && pendingRequests.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Pending Approval Requests ({pendingRequests.length})
                </h4>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl overflow-hidden divide-y divide-border">
                  {pendingRequests.map((req) => (
                    <div key={req._id} className="flex justify-between items-center p-4 gap-4 bg-amber-500/[0.01]">
                      <div>
                        <p className="text-xs font-bold text-foreground">{req.userId?.name}</p>
                        <p className="text-[10px] text-muted-foreground">{req.userId?.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolveEnrollment(req._id, 'Approved')}
                          className="inline-flex items-center gap-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          <UserCheck className="h-3 w-3" /> Approve
                        </button>
                        <button
                          onClick={() => handleResolveEnrollment(req._id, 'Rejected')}
                          className="inline-flex items-center gap-1 rounded border border-destructive/20 bg-destructive/10 hover:bg-destructive/20 text-destructive px-2.5 py-1 text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          <UserMinus className="h-3 w-3" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FACULTY SECTION */}
            <div className="space-y-4">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Faculty & Instructors</h3>
                  <p className="text-xs text-muted-foreground font-sans">Instructors conducting and managing curriculum lectures.</p>
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => setShowAssignFacultyModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Assign Faculty
                  </button>
                )}
              </div>

              {courseFaculty.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  No instructors assigned.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {courseFaculty.map((fac) => (
                    <div key={fac._id} className="bg-card border border-border rounded-xl p-4 flex justify-between items-center gap-4">
                      <div>
                        <p className="text-xs font-bold text-foreground">{fac.name}</p>
                        <p className="text-[10px] text-muted-foreground">{fac.email}</p>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleUnassignFaculty(fac._id)}
                          className="p-1.5 hover:bg-secondary rounded text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          title="Unassign Faculty"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ENROLLED STUDENTS SECTION */}
            <div className="space-y-4">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Enrolled Students</h3>
                  <p className="text-xs text-muted-foreground font-sans">Enrolled student registry approved to participate in lectures.</p>
                </div>
                {(isAdmin || isFaculty) && (
                  <button 
                    onClick={() => setShowAddStudentModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Enroll Students
                  </button>
                )}
              </div>

              {students.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-12 text-center">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <h4 className="text-xs font-semibold text-foreground mb-1">Roster is Empty</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    {isAdmin || isFaculty 
                      ? "Enroll students directly or share the Course Join Code to receive enrollment applications." 
                      : "No students are enrolled in this course registry."}
                  </p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
                  {students.map((student) => (
                    <div key={student._id} className="flex justify-between items-center p-4 gap-4 hover:bg-secondary/5 transition-colors">
                      <div>
                        <p className="text-xs font-bold text-foreground">{student.name}</p>
                        <p className="text-[10px] text-muted-foreground">{student.email}</p>
                      </div>
                      {(isAdmin || isFaculty) && (
                        <button
                          onClick={() => handleRemoveStudent(student._id)}
                          className="p-1.5 hover:bg-secondary rounded text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          title="Remove Student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 4. MODALS & FORMS (PORTALS)                              */}
      {/* ======================================================== */}

      {/* MODAL: EDIT COURSE */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="border-b border-border p-6 flex justify-between items-center">
              <h3 className="text-sm font-bold text-foreground">Edit Course Details</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="rounded-md border border-border p-1.5 hover:bg-secondary transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4 rotate-45 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleUpdateCourse} className="p-6 space-y-4">
              {editError && (
                <div className="flex gap-2 rounded-md border border-destructive/20 bg-destructive/15 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}
              {editSuccess && (
                <div className="flex gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{editSuccess}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Course Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Full Stack Web Development"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                <textarea 
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Brief syllabus outline..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Course Code (Unique)</label>
                <input 
                  type="text" 
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono font-bold"
                  placeholder="e.g. WD-101"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full rounded-md bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all mt-4 cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE SESSION */}
      {showAddSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="border-b border-border p-5 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold text-foreground">Schedule Lecture Session</h3>
              <button 
                onClick={() => setShowAddSessionModal(false)}
                className="rounded-md border border-border p-1.5 hover:bg-secondary transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4 rotate-45 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleAddSession} className="p-5 space-y-4 overflow-y-auto flex-1">
              {sessionError && (
                <div className="flex gap-2 rounded-md border border-destructive/20 bg-destructive/15 p-3 text-xs text-destructive shrink-0">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{sessionError}</span>
                </div>
              )}
              {sessionSuccess && (
                <div className="flex gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{sessionSuccess}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Session Title *</label>
                <input 
                  type="text" 
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  placeholder="e.g. Introduction to React state"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                <textarea 
                  value={sessionDesc}
                  onChange={(e) => setSessionDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  placeholder="Topic objectives, requirements..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Start Time *</label>
                  <input 
                    type="datetime-local" 
                    value={sessionStart}
                    onChange={(e) => setSessionStart(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">End Time *</label>
                  <input 
                    type="datetime-local" 
                    value={sessionEnd}
                    onChange={(e) => setSessionEnd(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Zoom Meeting Link</label>
                
                {isZoomActive ? (
                  <>
                    {/* Toggle between auto-generate and manual */}
                    <div className="flex items-center bg-secondary/30 border border-border rounded-md p-0.5 w-fit">
                      <button
                        type="button"
                        onClick={() => setAutoGenerateZoom(true)}
                        className={`rounded px-3 py-1.5 text-[10px] font-semibold transition-colors cursor-pointer ${
                          autoGenerateZoom ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        ⚡ Auto-generate Zoom
                      </button>
                      <button
                        type="button"
                        onClick={() => setAutoGenerateZoom(false)}
                        className={`rounded px-3 py-1.5 text-[10px] font-semibold transition-colors cursor-pointer ${
                          !autoGenerateZoom ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        🔗 Manual Link
                      </button>
                    </div>

                    {autoGenerateZoom ? (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 rounded-md px-3 py-2">
                        A Zoom meeting will be automatically created when you schedule this session. The join link, host URL, and passcode will be generated.
                      </p>
                    ) : (
                      <input 
                        type="url" 
                        value={sessionLiveLink}
                        onChange={(e) => setSessionLiveLink(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none font-mono"
                        placeholder="https://zoom.us/j/..."
                        required={!autoGenerateZoom}
                      />
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="rounded-md bg-amber-500/10 border border-amber-500/20 p-3 text-[10px] text-amber-700 dark:text-amber-300">
                      ⚡ <strong>Zoom auto-generation is not configured.</strong> Ask your Institute Administrator to enter Zoom Server-to-Server OAuth credentials in their settings to enable this feature.
                    </div>
                    <input 
                      type="url" 
                      value={sessionLiveLink}
                      onChange={(e) => setSessionLiveLink(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none font-mono"
                      placeholder="https://zoom.us/j/... (Paste manual class link here)"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recorded Video Link</label>
                <input 
                  type="url" 
                  value={sessionVideo}
                  onChange={(e) => setSessionVideo(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none font-mono"
                  placeholder="https://vimeo.com/..."
                />
              </div>

              {/* Select Faculty conducting the session */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Conducting Faculty Member</label>
                <select
                  value={sessionFaculty}
                  onChange={(e) => setSessionFaculty(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                >
                  <option value="">Select Instructor...</option>
                  {courseFaculty.map(f => (
                    <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                  ))}
                </select>
              </div>

              {/* Attachments - PDF Multi Upload */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Upload Lecture PDF Attachments <span className="text-muted-foreground font-normal normal-case">(Optional — Multiple PDF support)</span></label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-secondary/10 transition-colors relative cursor-pointer">
                  <input 
                    type="file" 
                    accept=".pdf"
                    multiple
                    onChange={(e) => setSessionFiles(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <FileUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-[11px] font-medium text-foreground">
                    {sessionFiles && sessionFiles.length > 0 
                      ? `${sessionFiles.length} files selected` 
                      : "Drag and drop or click to select PDFs"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">Accepts multiple PDF documents</p>
                </div>
                {sessionFiles && sessionFiles.length > 0 && (
                  <div className="mt-2 text-[10px] text-muted-foreground space-y-1 border border-border rounded p-2 bg-secondary/5">
                    {Array.from(sessionFiles).map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="truncate max-w-[200px]">{file.name}</span>
                        <span>({Math.round(file.size / 1024)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit"
                disabled={sessionSubmitting}
                className="w-full rounded-md bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all mt-4 cursor-pointer disabled:opacity-50"
              >
                {sessionSubmitting ? 'Scheduling...' : 'Schedule Lecture Session'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD GENERAL MATERIAL */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="border-b border-border p-6 flex justify-between items-center">
              <h3 className="text-sm font-bold text-foreground">Upload Reference Material</h3>
              <button 
                onClick={() => setShowAddMaterialModal(false)}
                className="rounded-md border border-border p-1.5 hover:bg-secondary transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4 rotate-45 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleAddMaterial} className="p-6 space-y-4">
              {materialError && (
                <div className="flex gap-2 rounded-md border border-destructive/20 bg-destructive/15 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{materialError}</span>
                </div>
              )}
              {materialSuccess && (
                <div className="flex gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{materialSuccess}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Document Title (Optional)</label>
                <input 
                  type="text" 
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  placeholder="e.g. Syllabus Guide, Reading Chapter 1"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">PDF Document *</label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-secondary/10 transition-colors relative cursor-pointer">
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={(e) => setMaterialFile(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <FileUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-[11px] font-medium text-foreground">
                    {materialFile ? materialFile.name : "Drag and drop or click to select PDF"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">Only PDF attachments allowed</p>
                </div>
              </div>

              <button 
                type="submit"
                disabled={materialSubmitting}
                className="w-full rounded-md bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all mt-4 cursor-pointer disabled:opacity-50"
              >
                {materialSubmitting ? 'Uploading...' : 'Upload PDF Document'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DIRECT BULK STUDENT ENROLLMENT */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="border-b border-border p-6 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold text-foreground">Enroll Students</h3>
              <button 
                onClick={() => setShowAddStudentModal(false)}
                className="rounded-md border border-border p-1.5 hover:bg-secondary transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4 rotate-45 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleEnrollStudents} className="p-6 space-y-4 overflow-y-auto flex-1">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select registered students to directly enroll them in the course registry.
              </p>

              {enrollError && (
                <div className="flex gap-2 rounded-md border border-destructive/20 bg-destructive/15 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{enrollError}</span>
                </div>
              )}
              {enrollSuccess && (
                <div className="flex gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{enrollSuccess}</span>
                </div>
              )}

              <div className="border border-border rounded-md max-h-60 overflow-y-auto p-2 space-y-1 bg-secondary/10">
                {instituteStudents.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground p-3 text-center">No students registered in this institute.</p>
                ) : (
                  instituteStudents.map((stud) => {
                    const isEnrolled = students.some(s => s._id === stud._id);
                    return (
                      <label 
                        key={stud._id} 
                        className={`flex items-center gap-3 p-2 rounded text-xs transition-colors cursor-pointer ${
                          isEnrolled ? 'opacity-50 cursor-not-allowed bg-secondary/10' : 'hover:bg-secondary/40'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          disabled={isEnrolled}
                          checked={selectedStudentIds.includes(stud._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudentIds([...selectedStudentIds, stud._id]);
                            } else {
                              setSelectedStudentIds(selectedStudentIds.filter(id => id !== stud._id));
                            }
                          }}
                          className="rounded border-input text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className="truncate">
                          <span className="font-bold text-foreground">{stud.name}</span>
                          <span className="text-[10px] text-muted-foreground ml-2">({stud.email})</span>
                          {isEnrolled && (
                            <span className="text-[9px] text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded font-semibold ml-2">
                              Already Enrolled
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              <button 
                type="submit"
                disabled={enrollSubmitting}
                className="w-full rounded-md bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all mt-4 cursor-pointer disabled:opacity-50"
              >
                {enrollSubmitting ? 'Enrolling...' : `Enroll Selected Students (${selectedStudentIds.length})`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN FACULTY (ADMINS ONLY) */}
      {showAssignFacultyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="border-b border-border p-6 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold text-foreground">Assign Instructors</h3>
              <button 
                onClick={() => setShowAssignFacultyModal(false)}
                className="rounded-md border border-border p-1.5 hover:bg-secondary transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4 rotate-45 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleAssignFaculty} className="p-6 space-y-4 overflow-y-auto flex-1">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Assign faculty members registered in your institute to teach this course.
              </p>

              {assignError && (
                <div className="flex gap-2 rounded-md border border-destructive/20 bg-destructive/15 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{assignError}</span>
                </div>
              )}
              {assignSuccess && (
                <div className="flex gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{assignSuccess}</span>
                </div>
              )}

              <div className="border border-border rounded-md max-h-60 overflow-y-auto p-2 space-y-1 bg-secondary/10">
                {instituteFaculty.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground p-3 text-center">No approved faculty found in your institute registry.</p>
                ) : (
                  instituteFaculty.map((fac) => {
                    const isAssigned = courseFaculty.some(f => f._id === fac._id);
                    return (
                      <label 
                        key={fac._id} 
                        className={`flex items-center gap-3 p-2 rounded text-xs transition-colors cursor-pointer ${
                          isAssigned ? 'opacity-50 cursor-not-allowed bg-secondary/10' : 'hover:bg-secondary/40'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          disabled={isAssigned}
                          checked={selectedFacultyIds.includes(fac._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFacultyIds([...selectedFacultyIds, fac._id]);
                            } else {
                              setSelectedFacultyIds(selectedFacultyIds.filter(id => id !== fac._id));
                            }
                          }}
                          className="rounded border-input text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className="truncate">
                          <span className="font-bold text-foreground">{fac.name}</span>
                          <span className="text-[10px] text-muted-foreground ml-2">({fac.email})</span>
                          {isAssigned && (
                            <span className="text-[9px] text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded font-semibold ml-2">
                              Already Assigned
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              <button 
                type="submit"
                disabled={assignSubmitting}
                className="w-full rounded-md bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all mt-4 cursor-pointer disabled:opacity-50"
              >
                {assignSubmitting ? 'Assigning...' : `Assign Selected Faculty (${selectedFacultyIds.length})`}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
