'use client';

import { AlertCircle, Award, BookOpen, Calendar, CheckCircle2, ChevronRight, Clock, Compass, FileText, Mail, PlayCircle, Plus, School, Sparkles, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';
import { useUser } from '../../../lib/session';

export default function StudentDashboard() {
  const session = useUser();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<any[]>([]);
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

  // Profile Edit State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Fetch courses from backend when session is ready
  const fetchCourses = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/courses/my-courses', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Failed to fetch student courses:', error);
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

  useEffect(() => {
    const token = session?.token;
    if (token) {
      fetchCourses(token);
      setSelectedInstituteId(session.instituteId || 'none');
    } else {
      setLoading(false);
    }
  }, [session?.token, session]);

  // Sync active tab with `?tab=` query param (sidebar navigation)
  useEffect(() => {
    const tabParam = searchParams?.get('tab') || 'overview';
    setActiveTab(tabParam);
  }, [searchParams?.toString()]);

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
        setJoinSuccess(data.message || 'Successfully joined the course!');
        setJoinCode('');
        // Reload courses list
        await fetchCourses(token);
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
        // Update the secure server cookie
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

        // Also update local storage for immediate frontend access
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
        
        // Update the secure server cookie
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

  if (!session) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display flex items-center gap-2">
            Student Desktop Hub <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">Welcome back, {session.name}. Track your enrolled courses, schedules, and active classrooms.</p>
        </div>
        <div className="rounded-full bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 text-xs text-zinc-300 font-semibold self-start md:self-auto flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-purple-500 animate-ping" />
          Role: Student
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-zinc-800 gap-4 text-sm">
        <button onClick={() => setActiveTab('overview')} className={`pb-2 font-semibold transition-colors ${activeTab === 'overview' ? 'border-b-2 border-purple-500 text-white' : 'text-zinc-400 hover:text-white'}`}>
          Overview
        </button>
        <button onClick={() => setActiveTab('courses')} className={`pb-2 font-semibold transition-colors ${activeTab === 'courses' ? 'border-b-2 border-purple-500 text-white' : 'text-zinc-400 hover:text-white'}`}>
          My Courses ({courses.length})
        </button>
        <button onClick={() => setActiveTab('profile')} className={`pb-2 font-semibold transition-colors ${activeTab === 'profile' ? 'border-b-2 border-purple-500 text-white' : 'text-zinc-400 hover:text-white'}`}>
          Profile
        </button>
      </div>

      {/* Render Dynamic Tab views */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Status Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="glass border border-white/5 rounded-xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-white/5 blur-xl" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">Enrolled Courses</span>
                <BookOpen className="h-4.5 w-4.5 text-blue-400" />
              </div>
              <p className="text-xl md:text-2xl font-extrabold text-white mt-2 leading-none">{courses.length}</p>
              <p className="text-[10px] text-zinc-400 mt-2">Active syllabus enrollments</p>
            </div>

            <div className="glass border border-white/5 rounded-xl p-5 shadow-xl relative overflow-hidden group">
              <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-white/5 blur-xl group-hover:bg-purple-500/20 transition-colors" />
              <div className="flex items-center justify-between relative">
                <span className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Institution</span>
                <School className="h-4.5 w-4.5 text-purple-400" />
              </div>
              
              {isEditingInstitute ? (
                <div className="mt-2 relative z-10 flex gap-2">
                  <select
                    value={selectedInstituteId}
                    onChange={(e) => setSelectedInstituteId(e.target.value)}
                    className="flex-1 rounded border border-white/10 bg-black/40 px-2 py-1 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="none">Unaffiliated (Independent)</option>
                    {activeInstitutes.map((inst: any) => (
                      <option key={inst._id} value={inst._id}>{inst.name}</option>
                    ))}
                  </select>
                  <button onClick={handleUpdateInstitute} disabled={savingInstitute} className="rounded bg-purple-500 hover:bg-purple-400 px-2 text-xs font-bold text-white disabled:opacity-50">Save</button>
                  <button onClick={() => setIsEditingInstitute(false)} className="rounded bg-white/10 hover:bg-white/20 px-2 text-xs font-bold text-white">Cancel</button>
                </div>
              ) : (
                <div className="relative z-10">
                  <p className="text-xl md:text-2xl font-extrabold text-white mt-2 leading-none truncate">
                    {session.instituteId ? (activeInstitutes.find(i => i._id === session.instituteId)?.name || 'Linked Tenant') : 'Independent Learner'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-zinc-400">Your primary educational hub</p>
                    <button onClick={() => setIsEditingInstitute(true)} className="text-[10px] font-bold text-purple-400 hover:text-purple-300 underline">Change</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Join Course Card */}
            <div className="glass border border-white/5 rounded-xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-purple-400" />
                <h3 className="font-extrabold text-white text-base">Enroll in a New Course</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">Enter the unique 6-character Student Join Code provided by your instructor to instantly enroll.</p>

              <form onSubmit={handleJoinCourse} className="space-y-3">
                <div>
                  <input type="text" maxLength={6} value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="e.g. STU8Y1" className="w-full rounded-lg border border-white/10 bg-black/40 px-3.5 py-2 text-sm font-mono font-bold text-white uppercase placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500" />
                </div>

                {joinError && (
                  <div className="flex gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{joinError}</span>
                  </div>
                )}

                {joinSuccess && (
                  <div className="flex gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{joinSuccess}</span>
                  </div>
                )}

                <button type="submit" disabled={joining} className="w-full rounded-lg bg-purple-600 py-2 text-sm font-semibold text-white transition-all hover:bg-purple-500 disabled:opacity-50">
                  {joining ? 'Enrolling...' : 'Submit Join Code'}
                </button>
              </form>
            </div>

            {/* Courses list preview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400">Enrolled Courses List</h3>
              </div>

              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                </div>
              ) : courses.length === 0 ? (
                <div className="glass border border-white/5 rounded-xl p-8 text-center">
                  <p className="text-sm text-zinc-500">You are not enrolled in any courses yet. Use the Enroll card to join your first course!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {courses.map((course: any) => (
                    <div key={course._id} className="glass border border-white/5 hover:border-white/10 rounded-xl p-5 shadow-lg transition-all group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-300 font-mono">{course.studentCode}</span>
                            <span className="text-[10px] text-zinc-500 font-semibold">Active Syllabus</span>
                          </div>
                          <h4 className="font-bold text-white text-base mt-1.5 group-hover:text-purple-300 transition-colors">{course.name}</h4>
                          <p className="text-xs text-zinc-400 mt-1">{course.description}</p>
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

      {/* Courses Tab View */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex h-[30vh] items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            </div>
          ) : courses.length === 0 ? (
            <div className="glass border border-white/5 rounded-xl p-10 text-center">
              <p className="text-sm text-zinc-500">No courses found. Join a course from the Overview tab.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course: any) => (
                <div key={course._id} className="glass border border-white/5 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between">
                  <div className="p-6">
                    <span className="rounded bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-xs font-bold text-purple-300 font-mono">{course.studentCode}</span>
                    <h3 className="mt-4 text-xl font-bold text-white leading-tight">{course.name}</h3>
                    <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{course.description}</p>
                  </div>
                  <div className="border-t border-zinc-900/60 bg-zinc-900/20 px-6 py-4 flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-medium">LumenLMS Verified Course</span>
                    <button className="rounded-lg bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 p-2 text-xs font-bold text-white flex items-center gap-1.5 transition-colors">
                      <PlayCircle className="h-4 w-4 text-purple-400" /> Enter Classroom
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="max-w-2xl">
          <div className="glass border border-white/5 rounded-xl p-6 shadow-xl">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-purple-400 mb-6">Personal Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1.5 rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Update phone number"
                  className="w-full mt-1.5 rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400">Physical Address</label>
                <textarea
                  rows={3}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Update physical address"
                  className="w-full mt-1.5 rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-sm text-white focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={savingProfile} 
                className="w-full mt-4 rounded-xl bg-purple-500 hover:bg-purple-400 py-3 text-sm font-extrabold text-white transition-colors disabled:opacity-50"
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
