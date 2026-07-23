'use client';

import { AlertCircle, BookOpen, Building2, Calendar, CheckCircle2, Compass, PlayCircle, Plus, X, Video, ExternalLink, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '../../../lib/session';
import SessionCalendar from '../../../components/SessionCalendar';
import { API_BASE_URL } from '../../../lib/api';

export default function FacultyDashboard() {
  const session = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Course Creation State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createCourseCode, setCreateCourseCode] = useState('');
  const [creating, setCreating] = useState(false);

  // Pending Approvals State
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loadingApprovals, setLoadingApprovals] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Course Details State
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [detailsTab, setDetailsTab] = useState<'sessions' | 'materials' | 'roster'>('sessions');
  const [sessions, setSessions] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [loadingAllSessions, setLoadingAllSessions] = useState(false);

  // Institute Affiliation State
  const [activeInstitutes, setActiveInstitutes] = useState<any[]>([]);
  const [loadingInstitutes, setLoadingInstitutes] = useState(false);
  const [selectedInstituteId, setSelectedInstituteId] = useState('');
  const [affiliationStatus, setAffiliationStatus] = useState<string>('');
  const [currentInstituteId, setCurrentInstituteId] = useState<string | null>(null);
  const [submittingAffiliation, setSubmittingAffiliation] = useState(false);
  const [affiliationError, setAffiliationError] = useState('');
  const [affiliationSuccess, setAffiliationSuccess] = useState('');

  const fetchUpcomingSessions = async () => {
    if (!session?.token) return;
    setLoadingUpcoming(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/upcoming-sessions`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (res.ok) {
        setUpcomingSessions(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch upcoming sessions:", e);
    } finally {
      setLoadingUpcoming(false);
    }
  };

  const fetchAllSessions = async () => {
    if (!session?.token) return;
    setLoadingAllSessions(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/all-sessions`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (res.ok) {
        setAllSessions(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch all sessions:", e);
    } finally {
      setLoadingAllSessions(false);
    }
  };

  const fetchActiveInstitutes = async () => {
    setLoadingInstitutes(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/active-institutes`);
      if (res.ok) {
        const data = await res.json();
        setActiveInstitutes(data);
        if (data.length > 0 && !selectedInstituteId) {
          setSelectedInstituteId(data[0]._id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch active institutes:', e);
    } finally {
      setLoadingInstitutes(false);
    }
  };

  const handleUpdateInstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token || !selectedInstituteId) {
      setAffiliationError('Please select an institute.');
      return;
    }
    setSubmittingAffiliation(true);
    setAffiliationError('');
    setAffiliationSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/update-institute`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({ instituteId: selectedInstituteId })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentInstituteId(data.instituteId);
        setAffiliationStatus(data.affiliationStatus || 'Pending');
        setAffiliationSuccess('Affiliation request submitted! Your request is pending approval from the Institute Admin.');

        // Update local session context and local storage
        const updatedUser = { 
          ...session, 
          instituteId: data.instituteId
        };
        
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser)
        });

        const authDataStr = localStorage.getItem('auth');
        if (authDataStr) {
          const authData = JSON.parse(authDataStr);
          if (data.instituteId) {
            authData.user.instituteId = data.instituteId;
          } else {
            delete authData.user.instituteId;
          }
          localStorage.setItem('auth', JSON.stringify(authData));
        }
      } else {
        setAffiliationError(data.message || 'Failed to submit affiliation request.');
      }
    } catch (err) {
      setAffiliationError('Network error. Please try again.');
    } finally {
      setSubmittingAffiliation(false);
    }
  };

  // List of all students in the institute (for multiselect dropdown)
  const [instituteStudents, setInstituteStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [enrollingStudents, setEnrollingStudents] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');

  // New Session Input State (with attachments & live link)
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionDesc, setNewSessionDesc] = useState('');
  const [newSessionStart, setNewSessionStart] = useState('');
  const [newSessionEnd, setNewSessionEnd] = useState('');
  const [newSessionLiveLink, setNewSessionLiveLink] = useState('');
  const [newSessionRecordedVideo, setNewSessionRecordedVideo] = useState('');
  const [newSessionFiles, setNewSessionFiles] = useState<FileList | null>(null);
  const [addingSession, setAddingSession] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [autoGenerateZoom, setAutoGenerateZoom] = useState(true);

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
      const res = await fetch(`${API_BASE_URL}/api/courses/my-courses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Failed to fetch faculty courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApprovals = async (token: string) => {
    setLoadingApprovals(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/pending-enrollments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setPendingApprovals(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
    } finally {
      setLoadingApprovals(false);
    }
  };

  const fetchInstituteStudents = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setInstituteStudents(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch institute students:', error);
    }
  };

  const fetchFacultyProfile = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAffiliationStatus(data.affiliationStatus || 'Unaffiliated');
        const newInstId = data.instituteId ? (typeof data.instituteId === 'object' ? data.instituteId._id : data.instituteId) : null;
        setCurrentInstituteId(newInstId);

        // Sync local session context/cookie if out of sync
        if (session && (session.instituteId !== newInstId || session.status !== data.status)) {
          const updatedUser = {
            ...session,
            instituteId: newInstId,
            status: data.status
          };
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser)
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch faculty profile:', error);
    }
  };

  useEffect(() => {
    const token = session?.token;
    if (token) {
      fetchCourses(token);
      fetchPendingApprovals(token);
      fetchInstituteStudents(token);
      fetchUpcomingSessions();
      fetchFacultyProfile(token);
    } else {
      setLoading(false);
    }
    // Sync current institute from session
    if (session?.instituteId) {
      setCurrentInstituteId(session.instituteId);
    }
  }, [session?.token, session]);

  // Sync active tab with `?tab=` query param (sidebar navigation)
  useEffect(() => {
    const tabParam = searchParams?.get('tab') || 'overview';
    setActiveTab(tabParam);
  }, [searchParams?.toString()]);

  // Fetch institutes when affiliation tab is opened
  useEffect(() => {
    if (activeTab === 'affiliation' && activeInstitutes.length === 0) {
      fetchActiveInstitutes();
    }
  }, [activeTab]);

  // Fetch all sessions when calendar tab opens (lazy)
  useEffect(() => {
    if (activeTab === 'calendar' && session?.token && allSessions.length === 0) {
      fetchAllSessions();
    }
  }, [activeTab, session?.token]);

  const handleJoinCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode || joinCode.trim().length !== 6) {
      setJoinError('Please enter a valid 6-character code.');
      return;
    }

    setJoining(true);
    setJoinError('');
    setJoinSuccess('');

    try {
      const token = session?.token;
      if (!token) {
        setJoinError('Not authenticated');
        setJoining(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/courses/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ joinCode: joinCode.trim().toUpperCase() })
      });

      const data = await res.json();

      if (!res.ok) {
        setJoinError(data.message || 'Failed to join course.');
      } else {
        setJoinSuccess(data.message || 'Successfully joined course as Faculty!');
        setJoinCode('');
        await fetchCourses(token);
      }
    } catch (error) {
      setJoinError('Network error. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName || !createDesc || !createCourseCode || !session?.token) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        setCreateName('');
        setCreateDesc('');
        setCreateCourseCode('');
        setIsCreateOpen(false);
        await fetchCourses(session.token);
      } else {
        alert(data.message || 'Failed to create course.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleProcessEnrollment = async (enrollmentId: string, status: 'Approved' | 'Rejected') => {
    if (!session?.token) return;
    setProcessingId(enrollmentId);
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
        await fetchPendingApprovals(session.token);
        await fetchCourses(session.token);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update enrollment status.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
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
    if (!selectedCourse || !newSessionTitle || !newSessionStart || !newSessionEnd || !session?.token) {
      setSessionError('Please fill in all mandatory fields.');
      return;
    }
    if (!autoGenerateZoom && !newSessionLiveLink) {
      setSessionError('Please provide a Live Link or enable Zoom auto-generation.');
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
      formData.append('autoGenerateZoom', String(autoGenerateZoom));
      if (!autoGenerateZoom) {
        formData.append('liveLink', newSessionLiveLink);
      }
      formData.append('recordedVideo', newSessionRecordedVideo);

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
        setAutoGenerateZoom(true);
        
        // Reset file input in UI
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

  return (
    <div className="space-y-8 font-sans antialiased text-foreground">
      {/* Dynamic Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            Faculty Hub Console
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Welcome back, {session.name}. Publish syllabuses, direct classrooms, and evaluate courses.</p>
        </div>
        <div className="rounded-md bg-secondary border border-border px-3 py-1.5 text-xs text-muted-foreground font-medium self-start md:self-auto flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Role: Faculty Member
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-border gap-6 text-sm overflow-x-auto">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`pb-2.5 font-medium transition-colors border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'overview' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('courses')} 
          className={`pb-2.5 font-medium transition-colors border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'courses' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          My Courses ({courses.length})
        </button>
        <button 
          onClick={() => setActiveTab('calendar')} 
          className={`pb-2.5 font-medium transition-colors border-b-2 cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'calendar' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          Schedule
        </button>
        <button 
          onClick={() => setActiveTab('approvals')} 
          className={`pb-2.5 font-medium transition-colors border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'approvals' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Approvals ({pendingApprovals.length})
        </button>
        <button 
          onClick={() => setActiveTab('affiliation')} 
          className={`pb-2.5 font-medium transition-colors border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'affiliation' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Institute Affiliation
        </button>
      </div>

      {/* Render Dynamic Tab views */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Status Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Active Classes</span>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold text-foreground mt-2 leading-none">{courses.length}</p>
              <p className="text-[10px] text-muted-foreground mt-2">Syllabuses linked directly to your profile</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Active Tenant</span>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold text-foreground mt-2 leading-none truncate">{session.instituteId ? 'Linked Tenant' : 'No Institution Linked'}</p>
              <p className="text-[10px] text-muted-foreground mt-2">Determined by course codes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Join Course Card */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="h-4.5 w-4.5 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground text-sm">Join Course Registry</h3>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Enter the unique 6-character Faculty Join Code to link your profile to a course as its Instructor.</p>

                <form onSubmit={handleJoinCourse} className="space-y-3">
                  <div>
                    <input 
                      type="text" 
                      maxLength={6} 
                      value={joinCode} 
                      onChange={(e) => setJoinCode(e.target.value)} 
                      placeholder="e.g. FAC9X2" 
                      className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs font-mono font-medium text-foreground uppercase placeholder-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
                    />
                  </div>

                  {joinError && (
                    <div className="flex gap-2 rounded-md border border-destructive/20 bg-destructive/15 p-3 text-xs text-destructive">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{joinError}</span>
                    </div>
                  )}

                  {joinSuccess && (
                    <div className="flex gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{joinSuccess}</span>
                    </div>
                  )}

                  <button type="submit" disabled={joining} className="w-full rounded-md bg-primary py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 cursor-pointer">
                    {joining ? 'Registering...' : 'Submit Join Code'}
                  </button>
                </form>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Plus className="h-4.5 w-4.5 text-muted-foreground" /> Actions Panel
                </h3>
                <button 
                  onClick={() => setActiveTab('affiliation')}
                  className="w-full rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border py-2 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Building2 className="h-3.5 w-3.5" /> Manage Institute Affiliation
                </button>
              </div>

              {/* Upcoming Sessions Widget */}
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="h-4.5 w-4.5 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground text-sm">Upcoming Live Classes</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('calendar')}
                    className="text-[10px] font-medium text-primary hover:underline cursor-pointer"
                  >
                    Full Calendar →
                  </button>
                </div>
                
                {loadingUpcoming ? (
                  <div className="flex h-16 items-center justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : upcomingSessions.length === 0 ? (
                  <p className="text-xs text-muted-foreground leading-relaxed text-left">No upcoming sessions scheduled.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingSessions.slice(0, 3).map((sess: any) => {
                      const start = new Date(sess.startTime);
                      return (
                        <div key={sess._id} className="border border-border rounded-md p-3 space-y-2 bg-secondary/5 text-left">
                          <div>
                            <p className="text-[11px] font-bold text-foreground line-clamp-1">{sess.title}</p>
                            <p className="text-[9px] text-muted-foreground">{sess.courseId?.name}</p>
                          </div>
                          <div className="flex justify-between items-center text-[9px] text-muted-foreground">
                            <span>{start.toLocaleDateString()} {start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <a href={sess.liveLink} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold flex items-center gap-0.5">
                              Join <ExternalLink className="h-2 w-2" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                    {upcomingSessions.length > 3 && (
                      <button
                        onClick={() => setActiveTab('calendar')}
                        className="w-full text-[10px] font-medium text-primary hover:underline text-center cursor-pointer py-1"
                      >
                        +{upcomingSessions.length - 3} more — view full calendar
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Mini Calendar Preview */}
              {upcomingSessions.length > 0 && (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <h3 className="text-xs font-semibold text-foreground">This Month</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('calendar')}
                      className="text-[10px] font-medium text-primary hover:underline cursor-pointer"
                    >
                      Expand →
                    </button>
                  </div>
                  <div className="p-3">
                    <div className="grid grid-cols-7 gap-0.5 text-center">
                      {['S','M','T','W','T','F','S'].map((d, i) => (
                        <div key={i} className="text-[9px] font-bold text-muted-foreground py-1">{d}</div>
                      ))}
                      {(() => {
                        const now = new Date();
                        const y = now.getFullYear(), m = now.getMonth();
                        const firstDay = new Date(y, m, 1).getDay();
                        const daysInMonth = new Date(y, m + 1, 0).getDate();
                        const sessionDays = new Set(
                          upcomingSessions
                            .filter((s: any) => {
                              const d = new Date(s.startTime);
                              return d.getMonth() === m && d.getFullYear() === y;
                            })
                            .map((s: any) => new Date(s.startTime).getDate())
                        );
                        const cells: React.ReactNode[] = [];
                        for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />);
                        for (let d = 1; d <= daysInMonth; d++) {
                          const isToday = d === now.getDate();
                          const hasSession = sessionDays.has(d);
                          cells.push(
                            <div
                              key={d}
                              className={`relative flex items-center justify-center rounded text-[10px] py-1 font-medium
                                ${isToday ? 'bg-primary text-primary-foreground' : hasSession ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}
                            >
                              {d}
                              {hasSession && !isToday && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-0.5 rounded-full bg-emerald-500" />
                              )}
                            </div>
                          );
                        }
                        return cells;
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Courses Taught Preview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Courses Under Directorship</h3>
              </div>

              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : courses.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center text-xs text-muted-foreground">
                  You are not leading any courses yet. Enter a join code to link to a course.
                </div>
              ) : (
                <div className="grid gap-3">
                  {courses.map((course: any) => (
                    <div 
                      key={course._id} 
                      onClick={() => openCourseDetails(course)}
                      className="bg-card border border-border rounded-lg p-5 transition-colors hover:bg-secondary/20 cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[9px] font-medium text-primary font-mono">{course.courseCode}</span>
                            <span className="text-[10px] text-muted-foreground">Active Director</span>
                          </div>
                          <h4 className="font-semibold text-foreground text-sm mt-2">{course.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{course.description}</p>
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

      {/* Calendar Tab View */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">My Teaching Schedule</h3>
              <p className="text-xs text-muted-foreground mt-0.5">All sessions scheduled across your courses — navigate months to explore.</p>
            </div>
            {loadingAllSessions && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            )}
          </div>
          <SessionCalendar sessions={allSessions} showJoinButton={true} />
        </div>
      )}

      {/* Courses Tab View */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">My Classroom Registries</h3>
          </div>

          {loading ? (
            <div className="flex h-[30vh] items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-10 text-center">
              <p className="text-xs text-muted-foreground">No courses linked to your profile. Join a course from the Overview tab.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course: any) => (
                <div key={course._id} className="bg-card border border-border rounded-lg overflow-hidden flex flex-col justify-between">
                  <div className="p-6">
                    <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary font-mono">{course.courseCode}</span>
                    <h3 className="mt-4 text-base font-semibold text-foreground leading-tight">{course.name}</h3>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{course.description}</p>
                  </div>
                  <div className="border-t border-border bg-secondary/10 px-6 py-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">LumenEngine Control Panel</span>
                    <button 
                      onClick={() => openCourseDetails(course)}
                      className="rounded border border-border hover:bg-secondary bg-card px-3 py-1.5 text-xs font-medium text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <PlayCircle className="h-4 w-4 text-primary" /> Manage Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approvals Tab View */}
      {activeTab === 'approvals' && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-border">
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Student Enrollments Verification</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Review and grant course access to student join requests.</p>
            </div>
            <span className="rounded bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">{pendingApprovals.length} Pending</span>
          </div>

          {loadingApprovals ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : pendingApprovals.length === 0 ? (
            <div className="text-center py-12 rounded-md border border-dashed border-border bg-secondary/10">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-xs font-semibold text-foreground">All caught up!</p>
              <p className="text-[11px] text-muted-foreground mt-1">No pending student join requests waiting.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map((req: any) => (
                <div key={req.id} className="flex items-center justify-between rounded-md border border-border bg-secondary/15 p-4">
                  <div>
                    <h4 className="font-semibold text-xs text-foreground">{req.student?.name}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{req.student?.email}</p>
                    <p className="text-[10px] text-primary font-medium mt-2">Requested to join: <span className="font-semibold">{req.course?.name}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      disabled={processingId === req.id}
                      onClick={() => handleProcessEnrollment(req.id, 'Approved')}
                      className="rounded bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Approve
                    </button>
                    <button 
                      disabled={processingId === req.id}
                      onClick={() => handleProcessEnrollment(req.id, 'Rejected')}
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
      )}

      {/* Institute Affiliation Tab */}
      {activeTab === 'affiliation' && (
        <div className="space-y-6">
          {/* Current Status Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Building2 className="h-4.5 w-4.5 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Current Affiliation Status</h3>
              </div>
              <button
                onClick={fetchActiveInstitutes}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-secondary/10 border border-border rounded-md p-4">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Institute ID</p>
                <p className="text-xs font-mono font-semibold text-foreground break-all">
                  {currentInstituteId || session?.instituteId || <span className="text-muted-foreground italic">Not affiliated</span>}
                </p>
              </div>
              <div className="bg-secondary/10 border border-border rounded-md p-4">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Institute Name</p>
                <p className="text-xs font-semibold text-foreground">
                  {(currentInstituteId || session?.instituteId)
                    ? (activeInstitutes.find(i => i._id === (currentInstituteId || session?.instituteId))?.brandName ||
                       activeInstitutes.find(i => i._id === (currentInstituteId || session?.instituteId))?.name ||
                       'Loading...')
                    : <span className="text-muted-foreground italic">Unaffiliated</span>
                  }
                </p>
              </div>
              <div className="bg-secondary/10 border border-border rounded-md p-4">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Affiliation Status</p>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                  affiliationStatus === 'Approved' || (!affiliationStatus && !session?.instituteId)
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : affiliationStatus === 'Pending'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-secondary text-muted-foreground border border-border'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    affiliationStatus === 'Approved' ? 'bg-emerald-500'
                    : affiliationStatus === 'Pending' ? 'bg-amber-500'
                    : 'bg-muted-foreground'
                  }`} />
                  {affiliationStatus || (session?.instituteId ? 'Pending' : 'Unaffiliated')}
                </span>
              </div>
            </div>
          </div>

          {/* Request / Change Affiliation Form */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="mb-5 pb-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Register with an Institute</h3>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Select an active institute below to submit an affiliation request. The Institute Admin will review and approve your request. You can switch institutes at any time.
              </p>
            </div>

            {affiliationSuccess && (
              <div className="mb-4 flex gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{affiliationSuccess}</span>
              </div>
            )}
            {affiliationError && (
              <div className="mb-4 flex gap-2 rounded-md border border-destructive/20 bg-destructive/15 p-3 text-xs text-destructive">
                <X className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{affiliationError}</span>
              </div>
            )}

            {loadingInstitutes ? (
              <div className="flex h-20 items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : activeInstitutes.length === 0 ? (
              <div className="text-center py-8 rounded-md border border-dashed border-border bg-secondary/10">
                <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-xs font-semibold text-foreground">No Active Institutes</p>
                <p className="text-[11px] text-muted-foreground mt-1">No approved institutes are currently available on this platform.</p>
              </div>
            ) : (
              <form onSubmit={handleUpdateInstitute} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Select Institute</label>
                  <select
                    value={selectedInstituteId}
                    onChange={(e) => setSelectedInstituteId(e.target.value)}
                    className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="none">Unaffiliated (Independent Faculty)</option>
                    {activeInstitutes.map((inst) => (
                      <option key={inst._id} value={inst._id}>
                        {inst.brandName || inst.name} — ID: {inst._id}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Institute Preview Card */}
                {selectedInstituteId && (() => {
                  const inst = activeInstitutes.find(i => i._id === selectedInstituteId);
                  if (!inst) return null;
                  return (
                    <div className="rounded-md border border-border bg-secondary/10 p-4 space-y-2">
                      <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Selected Institute Preview</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Brand Name</p>
                          <p className="text-xs font-semibold text-foreground mt-0.5">{inst.brandName || inst.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Legal Name</p>
                          <p className="text-xs font-medium text-foreground mt-0.5">{inst.legalName || inst.name}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-muted-foreground">Address</p>
                          <p className="text-xs text-foreground mt-0.5">{inst.address || '—'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-muted-foreground">Institute ID</p>
                          <p className="text-[10px] font-mono text-muted-foreground mt-0.5 break-all">{inst._id}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="rounded-md border border-amber-500/20 bg-amber-500/10 p-3">
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
                    <strong>Note:</strong> Submitting this request will link your faculty account to the selected institute and set your affiliation status to <strong>Pending</strong>. The Institute Admin must approve it before you gain full institute access. You can change your affiliation at any time.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingAffiliation || !selectedInstituteId}
                    className="flex items-center gap-2 rounded-md bg-primary hover:bg-primary/90 px-5 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {submittingAffiliation ? (
                      <><div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> Submitting...</>
                    ) : (
                      <><Building2 className="h-3.5 w-3.5" /> Submit Affiliation Request</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
