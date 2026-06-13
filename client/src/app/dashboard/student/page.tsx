'use client';

import { AlertCircle, Award, BookOpen, Calendar, CheckCircle2, ChevronRight, Clock, Compass, FileText, Mail, PlayCircle, Plus, School, User, X, Video, ExternalLink } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '../../../lib/session';
import SessionCalendar from '../../../components/SessionCalendar';

export default function StudentDashboard() {
  const session = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [activeInstitutes, setActiveInstitutes] = useState<any[]>([]);
  const [isEditingInstitute, setIsEditingInstitute] = useState(false);
  const [selectedInstituteId, setSelectedInstituteId] = useState<string>('none');
  const [savingInstitute, setSavingInstitute] = useState(false);

  // Course Details Modal State
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [detailsTab, setDetailsTab] = useState<'sessions' | 'materials'>('sessions');
  const [sessions, setSessions] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [loadingAllSessions, setLoadingAllSessions] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Fetch enrollments from backend when session is ready
  const fetchEnrollments = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/courses/my-enrollments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data);
      }
    } catch (error) {
      console.error('Failed to fetch student enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/active-institutes');
        if (res.ok) setActiveInstitutes(await res.json());
      } catch (err) {
        console.error("Failed to fetch institutes:", err);
      }
    };
    fetchInstitutes();
  }, []);

  const fetchUpcomingSessions = async () => {
    if (!session?.token) return;
    setLoadingUpcoming(true);
    try {
      const res = await fetch('http://localhost:5000/api/courses/upcoming-sessions', {
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
      const res = await fetch('http://localhost:5000/api/courses/all-sessions', {
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

  useEffect(() => {
    const token = session?.token;
    if (token) {
      fetchEnrollments(token);
      fetchUpcomingSessions();
      setSelectedInstituteId(session.instituteId || 'none');
      setEditName(session.name || '');
    } else {
      setLoading(false);
    }
  }, [session?.token, session]);

  // Sync active tab with `?tab=` query param (sidebar navigation)
  useEffect(() => {
    const tabParam = searchParams?.get('tab') || 'overview';
    setActiveTab(tabParam);
  }, [searchParams?.toString()]);

  // Fetch all sessions when calendar tab opens (lazy)
  useEffect(() => {
    if (activeTab === 'calendar' && session?.token && allSessions.length === 0) {
      fetchAllSessions();
    }
  }, [activeTab, session?.token]);


  const handleJoinCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode || joinCode.trim().length < 3) {
      setJoinError('Please enter a valid course code or join code.');
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

      const res = await fetch('http://localhost:5000/api/courses/join', {
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
        setJoinSuccess(data.message || 'Enrollment request submitted! Waiting for teacher approval.');
        setJoinCode('');
        await fetchEnrollments(token);
      }
    } catch (error) {
      setJoinError('Network error. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleUpdateInstitute = async () => {
    if (!session?.token) return;
    setSavingInstitute(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/update-institute', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({ instituteId: selectedInstituteId })
      });
      if (res.ok) {
        const data = await res.json();
        const updatedUser = { 
          ...session, 
          instituteId: data.instituteId, 
          status: data.status 
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
          authData.user.status = data.status;
          localStorage.setItem('auth', JSON.stringify(authData));
        }

        window.location.reload();
      } else {
        alert("Failed to update institute affiliation.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingInstitute(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) return;
    setSavingProfile(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ name: editName, phoneNumber: editPhone, address: editAddress })
      });
      if (res.ok) {
        const data = await res.json();
        const updatedUser = { 
          ...session, 
          name: data.user.name 
        };
        
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser)
        });

        const authDataStr = localStorage.getItem('auth');
        if (authDataStr) {
          const authData = JSON.parse(authDataStr);
          authData.user.name = data.user.name;
          localStorage.setItem('auth', JSON.stringify(authData));
        }
        
        window.location.reload();
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchCourseMaterials = async (courseId: string, token: string) => {
    setLoadingMaterials(true);
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/materials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMaterials(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch materials:", error);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const openCourseDetails = async (course: any) => {
    router.push(`/dashboard/courses/${course._id}`);
  };

  if (!session) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const approvedEnrollments = enrollments.filter(e => e.status === 'Approved' && e.courseId);
  const pendingEnrollments = enrollments.filter(e => e.status === 'Pending' && e.courseId);

  return (
    <div className="space-y-8 font-sans antialiased text-foreground">
      {/* Dynamic Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            Student Desktop Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Welcome back, {session.name}. Track your enrolled courses, schedules, and active classrooms.</p>
        </div>
        <div className="rounded-md bg-secondary border border-border px-3 py-1.5 text-xs text-muted-foreground font-medium self-start md:self-auto flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Role: Student
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
          My Courses ({approvedEnrollments.length})
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
          onClick={() => setActiveTab('profile')} 
          className={`pb-2.5 font-medium transition-colors border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'profile' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Profile
        </button>
      </div>

      {/* Render Dynamic Tab views */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Status Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Enrolled Courses</span>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold text-foreground mt-2 leading-none">{approvedEnrollments.length}</p>
              <p className="text-[10px] text-muted-foreground mt-2">Active syllabus enrollments</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Active Institution</span>
                <School className="h-4 w-4 text-muted-foreground" />
              </div>
              
              {isEditingInstitute ? (
                <div className="mt-2 flex gap-2">
                  <select
                    value={selectedInstituteId}
                    onChange={(e) => setSelectedInstituteId(e.target.value)}
                    className="flex-1 rounded border border-input bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="none">Unaffiliated (Independent)</option>
                    {activeInstitutes.map((inst: any) => (
                      <option key={inst._id} value={inst._id}>{inst.name}</option>
                    ))}
                  </select>
                  <button onClick={handleUpdateInstitute} disabled={savingInstitute} className="rounded bg-primary hover:bg-primary/90 px-2.5 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50 cursor-pointer">Save</button>
                  <button onClick={() => setIsEditingInstitute(false)} className="rounded border border-border hover:bg-secondary px-2.5 py-1 text-xs font-medium text-foreground cursor-pointer">Cancel</button>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-semibold text-foreground mt-2 leading-none truncate">
                    {session.instituteId ? (activeInstitutes.find(i => i._id === session.instituteId)?.name || 'Linked Tenant') : 'Independent Learner'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-muted-foreground font-sans">Educational tenant affiliation</p>
                    <button onClick={() => setIsEditingInstitute(true)} className="text-[10px] font-medium text-primary hover:underline cursor-pointer">Change</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6 h-fit">
              {/* Join Course Card */}
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Compass className="h-4.5 w-4.5 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground text-sm">Enroll in a New Course</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Enter the unique 6-character Student Join Code provided by your instructor to instantly enroll.</p>

                <form onSubmit={handleJoinCourse} className="space-y-3">
                  <div>
                    <input 
                      type="text" 
                      maxLength={6} 
                      value={joinCode} 
                      onChange={(e) => setJoinCode(e.target.value)} 
                      placeholder="e.g. STU8Y1" 
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
                    {joining ? 'Enrolling...' : 'Submit Join Code'}
                  </button>
                </form>
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
                            .filter(s => {
                              const d = new Date(s.startTime);
                              return d.getMonth() === m && d.getFullYear() === y;
                            })
                            .map(s => new Date(s.startTime).getDate())
                        );
                        const cells = [];
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

            {/* Courses list preview */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Enrolled Courses List</h3>

                {loading ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : approvedEnrollments.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-8 text-center text-xs text-muted-foreground">
                    You are not enrolled in any courses yet. Use the Enroll card to join your first course!
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {approvedEnrollments.map((enrollment: any) => {
                      const course = enrollment.courseId;
                      return (
                        <div 
                          key={enrollment._id} 
                          onClick={() => openCourseDetails(course)}
                          className="bg-card border border-border rounded-lg p-5 transition-colors hover:bg-secondary/20 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[9px] font-medium text-primary font-mono">{course.studentCode}</span>
                              <span className="text-[10px] text-muted-foreground">Active Syllabus</span>
                            </div>
                            <h4 className="font-semibold text-foreground text-sm mt-2">{course.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{course.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {pendingEnrollments.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending Requests</h3>
                  <div className="grid gap-3">
                    {pendingEnrollments.map((enrollment: any) => {
                      const course = enrollment.courseId;
                      return (
                        <div 
                          key={enrollment._id} 
                          className="bg-card border border-border border-dashed rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 opacity-80"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[9px] font-medium text-amber-600 font-mono">Pending</span>
                              <span className="text-[10px] text-muted-foreground">Awaiting Faculty Approval</span>
                            </div>
                            <h4 className="font-semibold text-foreground text-xs mt-2">{course?.name}</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{course?.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
              <h3 className="text-sm font-bold text-foreground">My Session Schedule</h3>
              <p className="text-xs text-muted-foreground mt-0.5">All scheduled lectures across your enrolled courses — navigate months to explore.</p>
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
          {loading ? (
            <div className="flex h-[30vh] items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : approvedEnrollments.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-10 text-center">
              <p className="text-xs text-muted-foreground">No courses found. Join a course from the Overview tab.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {approvedEnrollments.map((enrollment: any) => {
                const course = enrollment.courseId;
                return (
                  <div key={enrollment._id} className="bg-card border border-border rounded-lg overflow-hidden flex flex-col justify-between">
                    <div className="p-6">
                      <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary font-mono">{course.studentCode}</span>
                      <h3 className="mt-4 text-base font-semibold text-foreground leading-tight">{course.name}</h3>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{course.description}</p>
                    </div>
                    <div className="border-t border-border bg-secondary/10 px-6 py-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Verified Course</span>
                      <button 
                        onClick={() => openCourseDetails(course)}
                        className="rounded border border-border hover:bg-secondary bg-card px-3 py-1.5 text-xs font-medium text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <PlayCircle className="h-4 w-4 text-primary" /> View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="max-w-md">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-6">Personal Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1.5 rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Update phone number"
                  className="w-full mt-1.5 rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Physical Address</label>
                <textarea
                  rows={3}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Update physical address"
                  className="w-full mt-1.5 rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={savingProfile} 
                className="w-full mt-4 rounded-md bg-primary hover:bg-primary/90 py-2.5 text-xs font-medium text-primary-foreground transition-colors disabled:opacity-50 cursor-pointer"
              >
                {savingProfile ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
