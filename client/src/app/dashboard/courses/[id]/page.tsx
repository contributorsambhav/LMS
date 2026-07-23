'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '../../../../lib/session';
import { API_BASE_URL } from '../../../../lib/api';
import { 
  ArrowLeft, BookOpen, Calendar, LayoutList, Users, FileText, Plus, Trash2, Edit, 
  Copy, Check, ExternalLink, Video, Clock, UserCheck, UserMinus, 
  AlertCircle, CheckCircle2, FileUp, Sparkles, ShieldAlert,
  Play, Eye, Download, FileQuestion, GraduationCap
} from 'lucide-react';
import SessionCalendar from '../../../../components/SessionCalendar';
import VideoPlayer from '../../../../components/VideoPlayer';

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
  const [activeTab, setActiveTab] = useState<'lessons' | 'sessions' | 'materials' | 'quizzes' | 'assignments' | 'roster'>('lessons');
  const [sessionView, setSessionView] = useState<'list' | 'calendar'>('list');
  const [isCopied, setIsCopied] = useState<Record<string, boolean>>({});
  
  // Modal / Form toggle states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAssignFacultyModal, setShowAssignFacultyModal] = useState(false);

  // Lesson states
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonDuration, setLessonDuration] = useState(0);
  const [lessonFile, setLessonFile] = useState<File | null>(null);
  const [lessonCreateError, setLessonCreateError] = useState('');
  const [lessonCreateSuccess, setLessonCreateSuccess] = useState('');
  const [lessonCreateSubmitting, setLessonCreateSubmitting] = useState(false);

  // Quiz states
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ questionId: string; answerText?: string; selectedOptions?: string[] }[]>([]);
  const quizAnswersRef = useRef(quizAnswers);
  useEffect(() => {
    quizAnswersRef.current = quizAnswers;
  }, [quizAnswers]);
  const [showAddQuizModal, setShowAddQuizModal] = useState(false);
  const [showTakeQuizModal, setShowTakeQuizModal] = useState(false);
  const [showViewAttemptsModal, setShowViewAttemptsModal] = useState(false);
  const [showGradeAttemptModal, setShowGradeAttemptModal] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [gradeQuizScore, setGradeQuizScore] = useState<number>(0);
  const [gradeQuizFeedback, setGradeQuizFeedback] = useState('');
  const [subjectiveGrades, setSubjectiveGrades] = useState<{ [questionId: string]: number }>({});
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [quizTestType, setQuizTestType] = useState<'Autogradable' | 'Handgraded'>('Autogradable');
  const [quizDeadlineOption, setQuizDeadlineOption] = useState<'none' | '1day' | '3days' | '1week' | '2weeks' | 'custom'>('none');
  const [quizCustomDeadline, setQuizCustomDeadline] = useState('');
  const [quizTimeLimit, setQuizTimeLimit] = useState<number>(0);
  const [quizShuffleQuestions, setQuizShuffleQuestions] = useState(false);
  const [quizShuffleOptions, setQuizShuffleOptions] = useState(false);
  const [quizHideAnswersUntilDeadline, setQuizHideAnswersUntilDeadline] = useState(false);
  const [quizMaxAttempts, setQuizMaxAttempts] = useState(1);
  const [quizScoringPolicy, setQuizScoringPolicy] = useState<'best' | 'latest' | 'average'>('latest');
  const [quizQuestions, setQuizQuestions] = useState<any[]>([
    { questionText: '', type: 'MCQ', options: ['', '', '', ''], correctAnswer: '0', correctAnswers: ['0'], points: 1 }
  ]);
  const [quizError, setQuizError] = useState('');
  const [quizSuccess, setQuizSuccess] = useState('');
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizTimeRemaining, setQuizTimeRemaining] = useState<number | null>(null);
  const [quizAttemptsLoading, setQuizAttemptsLoading] = useState(false);
  const [quizAttemptsError, setQuizAttemptsError] = useState('');
  const [gradeAttemptSubmitting, setGradeAttemptSubmitting] = useState(false);

  // Assignment states
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [selectedSubmissionsAssignment, setSelectedSubmissionsAssignment] = useState<any>(null);
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [showSubmitAssignmentModal, setShowSubmitAssignmentModal] = useState(false);
  const [showViewSubmissionsModal, setShowViewSubmissionsModal] = useState(false);
  const [showGradeSubmissionModal, setShowGradeSubmissionModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradeSubmissionScore, setGradeSubmissionScore] = useState<number>(0);
  const [gradeSubmissionFeedback, setGradeSubmissionFeedback] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDesc, setAssignmentDesc] = useState('');
  const [assignmentDeadline, setAssignmentDeadline] = useState('');
  const [assignmentTotalMarks, setAssignmentTotalMarks] = useState<number>(100);
  const [assignmentAttachmentUrl, setAssignmentAttachmentUrl] = useState('');
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState('');
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [assignmentSubmittingFile, setAssignmentSubmittingFile] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [gradeSubmissionSubmitting, setGradeSubmissionSubmitting] = useState(false);

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
      const courseRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
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
      const sessionsRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/sessions`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (sessionsRes.ok) setSessions(await sessionsRes.json());

      // 3. Fetch Materials
      const materialsRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/materials`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (materialsRes.ok) setMaterials(await materialsRes.json());

      // 4. Fetch Students
      const studentsRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/students`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (studentsRes.ok) setStudents(await studentsRes.json());

      // 5. Fetch assigned Faculty
      const facultyRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/faculty`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (facultyRes.ok) setCourseFaculty(await facultyRes.json());

      // 6. Fetch pending enrollment approvals (Admins / Faculty)
      if (isAdmin || isFaculty) {
        const pendingRes = await fetch(`${API_BASE_URL}/api/courses/pending-enrollments`, {
          headers: { Authorization: `Bearer ${session.token}` }
        });
        if (pendingRes.ok) {
          const allPending = await pendingRes.json();
          // Filter to only match current courseId
          const coursePending = allPending.filter((e: any) => e.courseId?._id === courseId);
          setPendingRequests(coursePending);
        }

        // Fetch roster students registry
        const registryRes = await fetch(`${API_BASE_URL}/api/courses/students`, {
          headers: { Authorization: `Bearer ${session.token}` }
        });
        if (registryRes.ok) setInstituteStudents(await registryRes.json());
      }

      // 7. Fetch all institute faculty (Admins only)
      if (isAdmin) {
        const instituteFacultyRes = await fetch(`${API_BASE_URL}/api/courses/institute-faculty`, {
          headers: { Authorization: `Bearer ${session.token}` }
        });
        if (instituteFacultyRes.ok) setInstituteFaculty(await instituteFacultyRes.json());
      }

      // 8. Fetch user profile / check Zoom configuration status
      const profileRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setIsZoomActive(!!profile.isZoomConfigured);
        setAutoGenerateZoom(!!profile.isZoomConfigured);
      }

      // 9. Fetch Quizzes
      const quizzesRes = await fetch(`${API_BASE_URL}/api/quizzes/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (quizzesRes.ok) setQuizzes(await quizzesRes.json());

      // 10. Fetch Assignments
      const assignmentsRes = await fetch(`${API_BASE_URL}/api/assignments/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (assignmentsRes.ok) setAssignments(await assignmentsRes.json());

      // 11. Fetch Lessons
      const lessonsRes = await fetch(`${API_BASE_URL}/api/lessons/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (lessonsRes.ok) setLessons(await lessonsRes.json());

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

  // Quiz Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showTakeQuizModal && selectedQuiz?.timeLimit > 0 && quizTimeRemaining !== null) {
      if (quizTimeRemaining > 0) {
        interval = setInterval(() => {
          setQuizTimeRemaining(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
      } else if (quizTimeRemaining === 0) {
        // Auto-submit when time is up
        setQuizTimeRemaining(null);
        handleSubmitQuizAttempt(undefined, selectedQuiz._id, quizAnswersRef.current); // Programmatic submit
      }
    }
    return () => clearInterval(interval);
  }, [showTakeQuizModal, quizTimeRemaining, selectedQuiz]);
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
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
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
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
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
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/sessions`, {
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
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/materials`, {
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
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/students`, {
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
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/assign-faculty`, {
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
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/unassign-faculty`, {
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
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/students/${studentId}`, {
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
      const res = await fetch(`${API_BASE_URL}/api/courses/enrollments/${requestId}/status`, {
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

  // ========================================================
  // LESSON SYSTEM HANDLERS
  // ========================================================

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) return;
    if (!lessonTitle) {
      setLessonCreateError('Lesson Title is required.');
      return;
    }

    setLessonCreateSubmitting(true);
    setLessonCreateError('');
    setLessonCreateSuccess('');

    try {
      const formData = new FormData();
      formData.append('title', lessonTitle);
      formData.append('description', lessonDesc);
      formData.append('duration', String(lessonDuration));
      if (lessonFile) {
        formData.append('video', lessonFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/lessons/courses/${courseId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        setLessonCreateError(data.message || 'Failed to create lesson.');
      } else {
        setLessonCreateSuccess('Lesson created successfully!');
        setLessonTitle('');
        setLessonDesc('');
        setLessonDuration(0);
        setLessonFile(null);
        fetchCourseData();
        setTimeout(() => {
          setShowAddLessonModal(false);
          setLessonCreateSuccess('');
        }, 1500);
      }
    } catch (err) {
      setLessonCreateError('Network error occurred.');
    } finally {
      setLessonCreateSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    if (!session?.token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (res.ok) {
        fetchCourseData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete lesson.');
      }
    } catch (err) {
      alert('Network error deleting lesson.');
    }
  };

  const handleUpdateProgress = async (lessonId: string, currentTime: number, percentage: number) => {
    if (!session?.token || session?.role !== 'student') return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({
          lastWatchedTimestamp: currentTime,
          watchPercentage: percentage
        })
      });

      if (res.ok) {
        // Silently update locally or refetch
        const lessonsRes = await fetch(`${API_BASE_URL}/api/lessons/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${session.token}` }
        });
        if (lessonsRes.ok) setLessons(await lessonsRes.json());
      }
    } catch (err) {
      console.error('Error updating watch progress:', err);
    }
  };

  // ========================================================
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [editingAttemptAnswers, setEditingAttemptAnswers] = useState<any[]>([]);

  // QUIZ SYSTEM HANDLERS
  // ========================================================

  const handleOpenEditQuiz = (quiz: any) => {
    setEditingQuizId(quiz._id);
    setQuizTitle(quiz.title || '');
    setQuizDesc(quiz.description || '');
    setQuizTestType(quiz.testType || 'Autogradable');
    setQuizTimeLimit(quiz.timeLimit || 0);
    setQuizShuffleQuestions(quiz.shuffleQuestions || false);
    setQuizShuffleOptions(quiz.shuffleOptions || false);
    setQuizHideAnswersUntilDeadline(quiz.hideAnswersUntilDeadline || false);
    setQuizMaxAttempts(quiz.maxAttempts || 1);
    setQuizScoringPolicy(quiz.scoringPolicy || 'latest');
    if (quiz.deadline) {
      setQuizDeadlineOption('custom');
      setQuizCustomDeadline(new Date(quiz.deadline).toISOString().slice(0, 16));
    } else {
      setQuizDeadlineOption('none');
      setQuizCustomDeadline('');
    }
    if (quiz.questions && quiz.questions.length > 0) {
      setQuizQuestions(quiz.questions.map((q: any) => ({
        _id: q._id,
        questionText: q.questionText || '',
        type: q.type || 'MCQ',
        options: q.options && q.options.length ? [...q.options] : ['', ''],
        correctAnswer: q.correctAnswer || '0',
        correctAnswers: q.correctAnswers || ['0'],
        points: q.points || 1,
        negativePoints: q.negativePoints || 0,
        attachmentUrl: q.attachmentUrl || ''
      })));
    } else {
      setQuizQuestions([{ questionText: '', type: 'MCQ', options: ['', ''], correctAnswer: '0', correctAnswers: ['0'], points: 1, negativePoints: 0, attachmentUrl: '' }]);
    }
    setShowAddQuizModal(true);
  };

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) return;
    if (!quizTitle) {
      setQuizError('Quiz Title is required.');
      return;
    }

    // Calculate deadline Date
    let calculatedDeadline: string | undefined = undefined;
    if (quizDeadlineOption === '1day') {
      calculatedDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    } else if (quizDeadlineOption === '3days') {
      calculatedDeadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    } else if (quizDeadlineOption === '1week') {
      calculatedDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (quizDeadlineOption === '2weeks') {
      calculatedDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    } else if (quizDeadlineOption === 'custom' && quizCustomDeadline) {
      calculatedDeadline = new Date(quizCustomDeadline).toISOString();
    }

    setQuizSubmitting(true);
    setQuizError('');
    setQuizSuccess('');

    try {
      const url = editingQuizId ? `${API_BASE_URL}/api/quizzes/${editingQuizId}` : `${API_BASE_URL}/api/quizzes/courses/${courseId}`;
      const method = editingQuizId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({
          courseId,
          title: quizTitle,
          description: quizDesc,
          testType: quizTestType,
          timeLimit: quizTimeLimit,
          deadline: calculatedDeadline,
          shuffleQuestions: quizShuffleQuestions,
          shuffleOptions: quizShuffleOptions,
          hideAnswersUntilDeadline: quizHideAnswersUntilDeadline,
          maxAttempts: quizMaxAttempts,
          scoringPolicy: quizScoringPolicy,
          questions: quizQuestions
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setQuizError(data.message || (editingQuizId ? 'Failed to update quiz.' : 'Failed to create quiz.'));
      } else {
        setQuizSuccess(editingQuizId ? 'Quiz updated successfully!' : 'Quiz created successfully!');
        setQuizTitle('');
        setQuizDesc('');
        setQuizTestType('Autogradable');
        setQuizDeadlineOption('none');
        setQuizCustomDeadline('');
        setQuizTimeLimit(0);
        setQuizQuestions([{ questionText: '', type: 'MCQ', options: ['', ''], correctAnswer: '0', correctAnswers: ['0'], points: 1, negativePoints: 0 }]);
        setEditingQuizId(null);
        fetchCourseData();
        setTimeout(() => {
          setShowAddQuizModal(false);
          setQuizSuccess('');
        }, 1500);
      }
    } catch (err) {
      setQuizError('Network error occurred.');
    } finally {
      setQuizSubmitting(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    if (!session?.token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (res.ok) {
        fetchCourseData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete quiz.');
      }
    } catch (err) {
      alert('Network error deleting quiz.');
    }
  };

  const handleStartQuizAttempt = async (quizToStart: any) => {
    if (!session?.token) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/quizzes/${quizToStart._id}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to start quiz attempt.');
        return null;
      }
      
      const { attempt } = data;
      let remaining = null;
      if (quizToStart.timeLimit > 0) {
        const startedAtMs = new Date(attempt.startedAt).getTime();
        const nowMs = Date.now();
        const elapsedSecs = Math.floor((nowMs - startedAtMs) / 1000);
        remaining = Math.max(0, (quizToStart.timeLimit * 60) - elapsedSecs);
      }
      return { remaining, attemptAnswers: attempt.answers || [] };
    } catch (err) {
      alert('Network error starting quiz.');
      return null;
    }
  };

  const handleSubmitQuizAttempt = async (e?: React.FormEvent, explicitQuizId?: string, explicitAnswers?: any[]) => {
    if (e) e.preventDefault();
    
    const targetQuizId = explicitQuizId || selectedQuiz?._id;
    const targetAnswers = explicitAnswers || quizAnswers;
    
    if (!session?.token || !targetQuizId) return;

    setQuizSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/quizzes/${targetQuizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({ answers: targetAnswers })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Quiz submitted successfully!');
        setShowTakeQuizModal(false);
        setSelectedQuiz(null);
        setQuizAnswers([]);
        fetchCourseData();
      } else {
        alert(data.message || 'Failed to submit quiz attempt.');
      }
    } catch (err) {
      alert('Network error submitting quiz.');
    } finally {
      setQuizSubmitting(false);
    }
  };

  const fetchQuizAttempts = async (quizId: string) => {
    if (!session?.token) return;
    setQuizAttemptsLoading(true);
    setQuizAttemptsError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/quizzes/${quizId}/attempts`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (res.ok) {
        setQuizAttempts(await res.json());
      } else {
        setQuizAttemptsError('Failed to load attempts.');
      }
    } catch (err) {
      setQuizAttemptsError('Network error loading attempts.');
    } finally {
      setQuizAttemptsLoading(false);
    }
  };

  const handleGradeQuizAttempt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token || !selectedAttempt) return;

    setGradeAttemptSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/quizzes/attempts/${selectedAttempt._id}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({
          subjectiveGrades,
          feedback: gradeQuizFeedback
        })
      });

      if (res.ok) {
        alert('Attempt graded successfully.');
        setShowGradeAttemptModal(false);
        setSelectedAttempt(null);
        if (selectedQuiz) fetchQuizAttempts(selectedQuiz._id);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to grade attempt.');
      }
    } catch (err) {
      alert('Network error grading attempt.');
    } finally {
      setGradeAttemptSubmitting(false);
    }
  };

  // ========================================================
  // ASSIGNMENT SYSTEM HANDLERS
  // ========================================================

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) return;
    if (!assignmentTitle || !assignmentDesc || !assignmentDeadline) {
      setAssignmentError('All required fields must be filled.');
      return;
    }

    setAssignmentSubmitting(true);
    setAssignmentError('');
    setAssignmentSuccess('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/assignments/courses/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({
          courseId,
          title: assignmentTitle,
          description: assignmentDesc,
          deadline: assignmentDeadline,
          totalMarks: assignmentTotalMarks,
          attachmentUrl: assignmentAttachmentUrl
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setAssignmentError(data.message || 'Failed to create assignment.');
      } else {
        setAssignmentSuccess('Assignment created successfully!');
        setAssignmentTitle('');
        setAssignmentDesc('');
        setAssignmentDeadline('');
        setAssignmentAttachmentUrl('');
        setAssignmentTotalMarks(100);
        fetchCourseData();
        setTimeout(() => {
          setShowAddAssignmentModal(false);
          setAssignmentSuccess('');
        }, 1500);
      }
    } catch (err) {
      setAssignmentError('Network error.');
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    if (!session?.token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (res.ok) {
        fetchCourseData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete assignment.');
      }
    } catch (err) {
      alert('Network error deleting assignment.');
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token || !selectedAssignment || !assignmentFile) {
      alert('Please select a PDF file to upload.');
      return;
    }

    setAssignmentSubmittingFile(true);
    try {
      const formData = new FormData();
      formData.append('pdf', assignmentFile);

      const res = await fetch(`${API_BASE_URL}/api/assignments/${selectedAssignment._id}/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        alert('Assignment submitted successfully!');
        setShowSubmitAssignmentModal(false);
        setSelectedAssignment(null);
        setAssignmentFile(null);
        fetchCourseData();
      } else {
        alert(data.message || 'Failed to submit assignment.');
      }
    } catch (err) {
      alert('Network error uploading assignment.');
    } finally {
      setAssignmentSubmittingFile(false);
    }
  };

  const fetchSubmissions = async (assignmentId: string) => {
    if (!session?.token) return;
    setSubmissionsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}/submissions`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (res.ok) {
        setSubmissions(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token || !selectedSubmission) return;

    setGradeSubmissionSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/assignments/submissions/${selectedSubmission._id}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({ grade: gradeSubmissionScore, feedback: gradeSubmissionFeedback })
      });

      if (res.ok) {
        alert('Submission graded successfully.');
        setShowGradeSubmissionModal(false);
        setSelectedSubmission(null);
        if (selectedSubmissionsAssignment) fetchSubmissions(selectedSubmissionsAssignment._id);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to grade submission.');
      }
    } catch (err) {
      alert('Network error grading submission.');
    } finally {
      setGradeSubmissionSubmitting(false);
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
      <div className="flex border-b border-border space-x-1 shrink-0 overflow-x-auto">
        {(['lessons', 'sessions', 'materials', 'quizzes', 'assignments', 'roster'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 cursor-pointer capitalize transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'lessons' ? 'Recorded Lessons' : tab === 'sessions' ? 'Live Sessions' : tab === 'materials' ? `Materials (${materials.length})` : tab === 'quizzes' ? `Quizzes (${quizzes.length})` : tab === 'assignments' ? `Assignments (${assignments.length})` : `Class Roster (${students.length + courseFaculty.length})`}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">

        {/* 0. RECORDED LESSONS TAB */}
        {activeTab === 'lessons' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Recorded Lessons & Lectures</h3>
                <p className="text-xs text-muted-foreground">Self-paced video materials and watch history.</p>
              </div>
              {(isAdmin || isFaculty) && (
                <button
                  onClick={() => setShowAddLessonModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Lesson
                </button>
              )}
            </div>

            {lessons.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <Video className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
                <h4 className="text-xs font-semibold text-foreground mb-1">No Recorded Lessons</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  {isAdmin || isFaculty 
                    ? "Add recorded video lectures here to start structured student learning." 
                    : "No recorded video lectures are currently available for this course."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Playlist / Lesson list */}
                <div className="lg:col-span-1 space-y-3">
                  <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <div className="border-b border-border p-4 bg-secondary/25">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Course Syllabus</h4>
                    </div>
                    <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                      {lessons.map((lesson, index) => {
                        const isSelected = selectedLesson?._id === lesson._id;
                        const hasProgress = lesson.progress;
                        const pct = hasProgress ? Math.round(lesson.progress.watchPercentage) : 0;
                        const isCompleted = hasProgress ? lesson.progress.completed : false;

                        return (
                          <div
                            key={lesson._id}
                            onClick={() => setSelectedLesson(lesson)}
                            className={`p-4 flex flex-col gap-2 cursor-pointer transition-colors ${
                              isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-secondary/15'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-xs font-bold text-muted-foreground font-mono">#{index + 1}</span>
                              <div className="flex-1">
                                <h5 className="text-xs font-semibold text-foreground line-clamp-1">{lesson.title}</h5>
                                <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{lesson.description || 'No description provided.'}</p>
                              </div>
                              {(isAdmin || isFaculty) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteLesson(lesson._id);
                                  }}
                                  className="p-1 hover:bg-secondary rounded text-destructive transition-colors cursor-pointer"
                                  title="Delete Lesson"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {lesson.duration || 0} mins
                              </span>
                              {isStudent && (
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  isCompleted 
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                    : pct > 0 
                                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                                      : 'bg-secondary text-muted-foreground'
                                }`}>
                                  {isCompleted ? 'Completed' : pct > 0 ? `${pct}% watched` : 'Not watched'}
                                </span>
                              )}
                            </div>
                            {isStudent && pct > 0 && !isCompleted && (
                              <div className="w-full bg-secondary h-1 rounded-full overflow-hidden mt-1">
                                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Side: Video Player & Details */}
                <div className="lg:col-span-2 space-y-4">
                  {selectedLesson ? (
                    <div className="border border-border rounded-xl bg-card p-6 space-y-4">
                      <div>
                        <h4 className="text-base font-bold text-foreground">{selectedLesson.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{selectedLesson.description}</p>
                      </div>

                      {selectedLesson.videoUrl ? (
                        <div className="mt-4">
                          <VideoPlayer
                            src={`${API_BASE_URL}${selectedLesson.videoUrl}`}
                            lessonId={selectedLesson._id}
                            initialTime={selectedLesson.progress?.lastWatchedTimestamp || 0}
                            onProgressUpdate={(lessonId, currentTime, percentage) => handleUpdateProgress(lessonId, currentTime, percentage)}
                          />
                        </div>
                      ) : (
                        <div className="rounded-xl border border-border bg-secondary/20 p-12 text-center">
                          <Video className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                          <h4 className="text-xs font-semibold text-foreground">No Video Attached</h4>
                          <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">This lesson has no lecture video uploaded.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border border-border border-dashed rounded-xl bg-secondary/5 p-16 text-center flex flex-col justify-center items-center h-full min-h-[300px]">
                      <Play className="h-10 w-10 text-muted-foreground/45 mb-4 stroke-1 animate-pulse" />
                      <h4 className="text-xs font-bold text-foreground">Select a lesson to start learning</h4>
                      <p className="text-xs text-muted-foreground max-w-xs mt-1">Choose a recorded lecture from the course syllabus on the left.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
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
                                    href={`${API_BASE_URL}${fileUrl}`}
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
                              href={`${API_BASE_URL}${mat.filePath}`}
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

        {/* QUIZZES TAB */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Course Quizzes</h3>
                <p className="text-xs text-muted-foreground font-sans">View and complete course assessments.</p>
              </div>
              {(isAdmin || isFaculty) && (
                <button
                  onClick={() => {
                    setQuizQuestions([{ questionText: '', type: 'MCQ', options: ['', '', '', ''], correctAnswer: '0', points: 1 }]);
                    setQuizTitle('');
                    setQuizDesc('');
                    setQuizTimeLimit(0);
                    setShowAddQuizModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Create Quiz
                </button>
              )}
            </div>

            {quizzes.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <FileQuestion className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
                <h4 className="text-xs font-semibold text-foreground mb-1 font-sans">No Quizzes Created</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto font-sans">
                  {isAdmin || isFaculty 
                    ? "Create custom assessments with multiple choice and subjective questions." 
                    : "No quizzes have been assigned for this course yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quiz List */}
                <div className="lg:col-span-1 space-y-3">
                  {quizzes.map((quiz) => {
                    const isSelected = selectedQuiz?._id === quiz._id;
                    const isDeadlinePassed = quiz.deadline && new Date() > new Date(quiz.deadline);

                    return (
                      <div
                        key={quiz._id}
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          fetchQuizAttempts(quiz._id);
                        }}
                        className={`p-4 border rounded-xl bg-card cursor-pointer transition-all ${
                          isSelected ? 'border-primary bg-primary/[0.02]' : 'border-border hover:bg-secondary/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            quiz.testType === 'Handgraded' 
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' 
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {quiz.testType || 'Autogradable'}
                          </span>
                          {quiz.deadline && (
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                              isDeadlinePassed 
                                ? 'bg-destructive/10 text-destructive' 
                                : 'bg-secondary text-muted-foreground'
                            }`}>
                              {isDeadlinePassed ? 'Closed' : `Ends ${new Date(quiz.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-foreground line-clamp-1">{quiz.title}</h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{quiz.description}</p>
                        
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {quiz.timeLimit ? `${quiz.timeLimit} mins` : 'No limit'}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" /> {quiz.questions?.length || 0} questions
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Quiz Detail & Attempts */}
                <div className="lg:col-span-2">
                  {selectedQuiz ? (
                    <div className="border border-border rounded-xl bg-card p-6 space-y-6">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              selectedQuiz.testType === 'Handgraded' 
                                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' 
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {selectedQuiz.testType || 'Autogradable'} Test
                            </span>
                            {selectedQuiz.deadline && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                Response Deadline: <strong className="text-foreground">{new Date(selectedQuiz.deadline).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-foreground">{selectedQuiz.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{selectedQuiz.description}</p>
                        </div>
                        {(isAdmin || isFaculty) && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditQuiz(selectedQuiz)}
                              className="inline-flex items-center gap-1 rounded border border-primary/20 bg-primary/10 text-primary px-2.5 py-1 text-[10px] font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
                            >
                              Edit Quiz
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteQuiz(selectedQuiz._id);
                                setSelectedQuiz(null);
                              }}
                              className="inline-flex items-center gap-1 rounded border border-destructive/20 bg-destructive/10 text-destructive px-2 py-1 text-[10px] font-semibold hover:bg-destructive/20 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Student view */}
                      {isStudent && (
                        <div className="space-y-4">
                          {quizAttemptsLoading ? (
                            <p className="text-xs text-muted-foreground">Loading attempts...</p>
                          ) : (
                            <div className="space-y-4">
                              {quizAttempts.length > 0 && quizAttempts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).map((attempt: any, attemptIndex: number) => {
                                const hasDeadlinePassed = selectedQuiz.deadline ? new Date() > new Date(selectedQuiz.deadline) : true;
                                const shouldHideAnswers = selectedQuiz.hideAnswersUntilDeadline && !hasDeadlinePassed;
                                return (
                                  <div key={attempt._id} className="border border-border rounded-lg p-4 bg-secondary/10 space-y-4">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                        Attempt {attempt.attemptNumber || (quizAttempts.length - attemptIndex)} Submitted
                                      </span>
                                      <span className="text-xs font-bold text-foreground">
                                        {shouldHideAnswers ? 'Score hidden until deadline' : `Score: ${attempt.graded ? `${attempt.score} points` : `${attempt.score} pts (Autograded, Subjective Pending)`}`}
                                      </span>
                                    </div>

                                    {attempt.feedback && (
                                      <div className="text-[11px] text-muted-foreground bg-card border border-border rounded p-2.5">
                                        <strong>Faculty Feedback:</strong> {attempt.feedback}
                                      </div>
                                    )}

                                    {/* Student Submission Breakdown */}
                                    <div className="space-y-3 pt-2">
                                      <h6 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Your Submitted Answers</h6>
                                      <div className="divide-y divide-border border border-border rounded-lg bg-card overflow-hidden">
                                        {selectedQuiz.questions?.map((q: any, idx: number) => {
                                          const ans = attempt.answers?.find((a: any) => a.questionId === q._id);
                                          let displayAns = '';
                                    if (q.type === 'MCQ') {
                                      displayAns = (ans?.answerText !== undefined && ans?.answerText !== '') 
                                        ? (q.options?.[Number(ans.answerText)] ?? 'No selection') 
                                        : 'No selection';
                                    } else if (q.type === 'MultipleMCQ') {
                                      let selOpts: string[] = ans?.selectedOptions || [];
                                      if (!selOpts.length && ans?.answerText) {
                                        try { selOpts = JSON.parse(ans.answerText); } catch { selOpts = ans.answerText.split(','); }
                                      }
                                      displayAns = selOpts.length > 0 ? selOpts.map(i => q.options?.[Number(i)] || i).join(', ') : 'No selections';
                                    } else {
                                      displayAns = (ans?.answerText && ans.answerText.trim() !== '') ? ans.answerText : 'No subjective response submitted';
                                    }

                                    return (
                                      <div key={q._id || idx} className="p-3 text-xs space-y-1.5">
                                        <div className="flex items-center justify-between">
                                          <p className="font-semibold text-foreground">
                                            Q{idx + 1}: {q.questionText} ({q.points} pts)
                                          </p>
                                          <span className="text-[9px] uppercase font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                                            {q.type}
                                          </span>
                                        </div>
                                        <div className="bg-secondary/20 p-2 rounded text-[11px] text-foreground font-sans">
                                          <strong>Your Answer:</strong> {displayAns}
                                        </div>
                                          {ans?.marksAwarded !== undefined && !shouldHideAnswers && (
                                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                              Marks Awarded: {ans.marksAwarded} / {q.points} pts
                                            </p>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          
                          {/* Retake / Take Quiz Button */}
                          {(!quizAttempts.length || (quizAttempts.length < (selectedQuiz.maxAttempts || 1))) ? (
                            <div className="text-center py-6 space-y-3">
                              {selectedQuiz.deadline && new Date() > new Date(selectedQuiz.deadline) ? (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-md text-xs font-semibold">
                                  Response Window Closed. Submissions are no longer accepted.
                                </div>
                              ) : (
                                <button
                                  onClick={async () => {
                                    let activeQuestions = [...selectedQuiz.questions];
                                    if (selectedQuiz.shuffleQuestions) {
                                      activeQuestions = activeQuestions.sort(() => Math.random() - 0.5);
                                    }
                                    if (selectedQuiz.shuffleOptions) {
                                      activeQuestions = activeQuestions.map(q => {
                                        if (q.type === 'MCQ' || q.type === 'MultipleMCQ') {
                                          const shuffled = (q.options || []).map((text: string, idx: number) => ({ text, originalIndex: idx })).sort(() => Math.random() - 0.5);
                                          return { ...q, displayOptions: shuffled };
                                        }
                                        return q;
                                      });
                                    } else {
                                      activeQuestions = activeQuestions.map(q => {
                                        if (q.type === 'MCQ' || q.type === 'MultipleMCQ') {
                                          return { ...q, displayOptions: (q.options || []).map((text: string, idx: number) => ({ text, originalIndex: idx })) };
                                        }
                                        return q;
                                      });
                                    }
                                    const modifiedQuiz = { ...selectedQuiz, questions: activeQuestions };
                                    setSelectedQuiz(modifiedQuiz);

                                    const startData = await handleStartQuizAttempt(selectedQuiz);
                                    if (!startData) return;

                                    const initialAnswers = activeQuestions.map((q: any) => {
                                      const existingAns = startData.attemptAnswers.find((a: any) => a.questionId === q._id);
                                      return {
                                        questionId: q._id,
                                        answerText: existingAns?.answerText || '',
                                        selectedOptions: existingAns?.selectedOptions || []
                                      };
                                    });
                                    setQuizAnswers(initialAnswers);
                                    
                                    if (startData.remaining === 0) {
                                      alert("Your time for this attempt has already expired!");
                                      handleSubmitQuizAttempt(undefined, selectedQuiz._id, initialAnswers);
                                      return;
                                    }

                                    setQuizTimeRemaining(startData.remaining !== null ? startData.remaining : (selectedQuiz.timeLimit > 0 ? selectedQuiz.timeLimit * 60 : null));
                                    setShowTakeQuizModal(true);
                                  }}
                                  className="inline-flex items-center gap-2 rounded bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
                                >
                                  {quizAttempts.length > 0 ? `Retake Quiz (Attempt ${quizAttempts.length + 1} of ${selectedQuiz.maxAttempts || 1})` : 'Start Quiz Assessment'}
                                </button>
                              )}
                            </div>
                          ) : null}
                        </div>
                          )}
                        </div>
                      )}

                      {/* Faculty / Admin view */}
                      {(isAdmin || isFaculty) && (
                        <div className="space-y-6">
                          {/* Questions summary */}
                          <div className="space-y-3">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quiz Questions & Answers</h5>
                            <div className="divide-y divide-border border border-border rounded-lg bg-secondary/10 overflow-hidden">
                              {selectedQuiz.questions?.map((q: any, idx: number) => (
                                <div key={q._id} className="p-3 text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <p className="font-semibold text-foreground">
                                      Q{idx + 1}: {q.questionText} ({q.points} pts{q.negativePoints ? `, -${q.negativePoints} neg` : ''})
                                    </p>
                                    <span className="text-[9px] uppercase font-bold text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
                                      {q.type === 'MultipleMCQ' ? 'Multiple Correct MCQ' : q.type === 'MCQ' ? 'Single Choice MCQ' : 'Subjective'}
                                    </span>
                                  </div>

                                  {q.type === 'MCQ' ? (
                                    <div className="pl-3 space-y-0.5 pt-1">
                                      {q.options?.map((opt: string, optIdx: number) => (
                                        <div key={optIdx} className={`text-[11px] ${String(optIdx) === q.correctAnswer ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-muted-foreground'}`}>
                                          • {opt} {String(optIdx) === q.correctAnswer && '(Correct Answer)'}
                                        </div>
                                      ))}
                                    </div>
                                  ) : q.type === 'MultipleMCQ' ? (
                                    <div className="pl-3 space-y-0.5 pt-1">
                                      {q.options?.map((opt: string, optIdx: number) => {
                                        const isCorrect = q.correctAnswers?.includes(String(optIdx));
                                        return (
                                          <div key={optIdx} className={`text-[11px] ${isCorrect ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-muted-foreground'}`}>
                                            [ ] {opt} {isCorrect && '✓ (Correct)'}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="pl-3 text-[11px] text-muted-foreground pt-1">
                                      <p className="italic">Subjective Essay Type</p>
                                      {q.correctAnswer && (
                                        <p className="text-foreground font-medium mt-0.5">Sample Answer Key: <span className="text-muted-foreground">{q.correctAnswer}</span></p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Student Attempts */}
                          <div className="space-y-3">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Student Submissions</h5>
                            {quizAttemptsLoading ? (
                              <p className="text-xs text-muted-foreground">Loading attempts...</p>
                            ) : quizAttempts.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic">No student has attempted this quiz yet.</p>
                            ) : (
                              <div className="border border-border rounded-lg overflow-hidden divide-y divide-border bg-card">
                                {quizAttempts.map((attempt) => (
                                  <div key={attempt._id} className="p-3 flex justify-between items-center gap-4 text-xs">
                                    <div>
                                      <p className="font-semibold text-foreground">{attempt.userId?.name || 'Unknown student'}</p>
                                      <p className="text-[10px] text-muted-foreground">{attempt.userId?.email}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        attempt.graded 
                                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                      }`}>
                                        {attempt.graded ? `Score: ${attempt.score}` : 'Pending Grading'}
                                      </span>
                                      <button
                                        onClick={() => {
                                          setSelectedAttempt(attempt);
                                          setGradeQuizScore(attempt.score);
                                          setGradeQuizFeedback(attempt.feedback || '');
                                          const initialSubjectiveGrades: { [qId: string]: number } = {};
                                          attempt.answers?.forEach((ans: any) => {
                                            if (ans.marksAwarded !== undefined) {
                                              initialSubjectiveGrades[ans.questionId] = ans.marksAwarded;
                                            }
                                          });
                                          setSubjectiveGrades(initialSubjectiveGrades);
                                          setShowGradeAttemptModal(true);
                                        }}
                                        className="inline-flex items-center gap-1 rounded bg-secondary hover:bg-secondary/85 px-2 py-1 text-[10px] font-semibold transition-colors cursor-pointer"
                                      >
                                        Grade
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border border-border border-dashed rounded-xl bg-secondary/5 p-16 text-center flex flex-col justify-center items-center h-full min-h-[300px]">
                      <FileQuestion className="h-10 w-10 text-muted-foreground/45 mb-4 stroke-1 animate-pulse" />
                      <h4 className="text-xs font-bold text-foreground">Select a quiz to view</h4>
                      <p className="text-xs text-muted-foreground max-w-xs mt-1">Choose a quiz assessment from the left pane to view submissions or start taking it.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ASSIGNMENTS TAB */}
        {activeTab === 'assignments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Course Assignments</h3>
                <p className="text-xs text-muted-foreground font-sans">View syllabus deadlines and submit your PDF assignments.</p>
              </div>
              {(isAdmin || isFaculty) && (
                <button
                  onClick={() => {
                    setAssignmentTitle('');
                    setAssignmentDesc('');
                    setAssignmentDeadline('');
                    setAssignmentTotalMarks(100);
                    setShowAddAssignmentModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Create Assignment
                </button>
              )}
            </div>

            {assignments.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <FileText className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
                <h4 className="text-xs font-semibold text-foreground mb-1 font-sans">No Assignments Created</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto font-sans">
                  {isAdmin || isFaculty 
                    ? "Publish assignments with total marks and submission deadlines." 
                    : "No homework assignments are currently listed for this course."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assignment List */}
                <div className="lg:col-span-1 space-y-3">
                  {assignments.map((assignment) => {
                    const isSelected = selectedAssignment?._id === assignment._id;
                    const isOverdue = new Date(assignment.deadline) < new Date();
                    return (
                      <div
                        key={assignment._id}
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          fetchSubmissions(assignment._id);
                        }}
                        className={`p-4 border rounded-xl bg-card cursor-pointer transition-all ${
                          isSelected ? 'border-primary bg-primary/[0.02]' : 'border-border hover:bg-secondary/10'
                        }`}
                      >
                        <h4 className="text-xs font-bold text-foreground line-clamp-1">{assignment.title}</h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{assignment.description}</p>
                        
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50 text-[10px]">
                          <span className={`flex items-center gap-1 ${isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                            <Clock className="h-3 w-3" /> Due: {new Date(assignment.deadline).toLocaleDateString()}
                          </span>
                          <span className="text-muted-foreground">
                            Max Marks: {assignment.totalMarks}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Assignment Detail & Submissions */}
                <div className="lg:col-span-2">
                  {selectedAssignment ? (
                    <div className="border border-border rounded-xl bg-card p-6 space-y-6">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{selectedAssignment.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{selectedAssignment.description}</p>
                          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                            <span><strong>Deadline:</strong> {new Date(selectedAssignment.deadline).toLocaleString()}</span>
                            <span><strong>Total Marks:</strong> {selectedAssignment.totalMarks}</span>
                          </div>
                          {selectedAssignment.attachmentUrl && (
                            <div className="mt-3">
                              <a 
                                href={selectedAssignment.attachmentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline bg-primary/10 px-2 py-1 rounded"
                              >
                                <FileText className="h-3 w-3" /> View Attachment
                              </a>
                            </div>
                          )}
                        </div>
                        {(isAdmin || isFaculty) && (
                          <button
                            onClick={() => {
                              handleDeleteAssignment(selectedAssignment._id);
                              setSelectedAssignment(null);
                            }}
                            className="inline-flex items-center gap-1 rounded border border-destructive/20 bg-destructive/10 text-destructive px-2 py-1 text-[10px] font-semibold hover:bg-destructive/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        )}
                      </div>

                      {/* Student view */}
                      {isStudent && (
                        <div className="space-y-4">
                          {submissionsLoading ? (
                            <p className="text-xs text-muted-foreground">Loading submissions...</p>
                          ) : submissions.length > 0 ? (
                            <div className="border border-border rounded-lg p-4 bg-secondary/10 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Assignment Submitted</span>
                                <span className="text-xs font-bold text-foreground">
                                  Grade: {submissions[0].graded ? `${submissions[0].grade} / ${selectedAssignment.totalMarks}` : 'Pending Grading'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[11px] text-muted-foreground bg-card border border-border rounded p-2.5">
                                <span className="truncate max-w-[200px] font-mono">{submissions[0].fileName}</span>
                                <a
                                  href={`${API_BASE_URL}${submissions[0].filePath}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                  <Eye className="h-3.5 w-3.5" /> View Upload
                                </a>
                              </div>
                              {submissions[0].feedback && (
                                <div className="text-[11px] text-muted-foreground bg-card border border-border rounded p-2.5">
                                  <strong>Feedback:</strong> {submissions[0].feedback}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="border border-border border-dashed rounded-lg p-6 bg-secondary/5 text-center">
                              <FileUp className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                              <h5 className="text-xs font-semibold text-foreground">Submit PDF Assignment</h5>
                              <p className="text-[10px] text-muted-foreground mb-4">Please upload a single PDF file containing your homework solution.</p>
                              <button
                                onClick={() => setShowSubmitAssignmentModal(true)}
                                className="inline-flex items-center gap-2 rounded bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
                              >
                                Upload Submission
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Faculty / Admin view */}
                      {(isAdmin || isFaculty) && (
                        <div className="space-y-4">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Student Submissions</h5>
                          {submissionsLoading ? (
                            <p className="text-xs text-muted-foreground font-sans">Loading submissions...</p>
                          ) : submissions.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic font-sans">No student has submitted this assignment yet.</p>
                          ) : (
                            <div className="border border-border rounded-lg overflow-hidden divide-y divide-border bg-card">
                              {submissions.map((sub) => (
                                <div key={sub._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                                  <div>
                                    <p className="font-semibold text-foreground">{sub.studentId?.name || 'Unknown student'}</p>
                                    <p className="text-[10px] text-muted-foreground">{sub.studentId?.email}</p>
                                    <p className="text-[9px] text-muted-foreground mt-1">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3">
                                    <a
                                      href={`${API_BASE_URL}${sub.filePath}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded border border-border bg-secondary hover:bg-secondary/80 px-2.5 py-1 text-[10px] font-semibold transition-colors cursor-pointer"
                                    >
                                      <Eye className="h-3.5 w-3.5" /> View PDF
                                    </a>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                      sub.graded 
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                    }`}>
                                      {sub.graded ? `Grade: ${sub.grade} / ${selectedAssignment.totalMarks}` : 'Pending Grading'}
                                    </span>
                                    <button
                                      onClick={() => {
                                        setSelectedSubmission(sub);
                                        setSelectedSubmissionsAssignment(selectedAssignment);
                                        setGradeSubmissionScore(sub.grade || 0);
                                        setGradeSubmissionFeedback(sub.feedback || '');
                                        setShowGradeSubmissionModal(true);
                                      }}
                                      className="inline-flex items-center gap-1 rounded bg-primary text-primary-foreground hover:bg-primary/95 px-2.5 py-1 text-[10px] font-semibold transition-colors cursor-pointer"
                                    >
                                      Grade
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border border-border border-dashed rounded-xl bg-secondary/5 p-16 text-center flex flex-col justify-center items-center h-full min-h-[300px]">
                      <FileText className="h-10 w-10 text-muted-foreground/45 mb-4 stroke-1 animate-pulse" />
                      <h4 className="text-xs font-bold text-foreground">Select an assignment to view</h4>
                      <p className="text-xs text-muted-foreground max-w-xs mt-1">Choose a homework assignment from the left pane to view submissions or upload your solution.</p>
                    </div>
                  )}
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

      {/* MODAL: ADD RECORDED LESSON */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="border-b border-border p-6 flex justify-between items-center">
              <h3 className="text-sm font-bold text-foreground">Add Recorded Lesson</h3>
              <button 
                onClick={() => setShowAddLessonModal(false)}
                className="rounded-md border border-border p-1.5 hover:bg-secondary transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4 rotate-45 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleAddLesson} className="p-6 space-y-4">
              {lessonCreateError && (
                <div className="flex gap-2 rounded-md border border-destructive/20 bg-destructive/15 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{lessonCreateError}</span>
                </div>
              )}
              {lessonCreateSuccess && (
                <div className="flex gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{lessonCreateSuccess}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lesson Title *</label>
                <input 
                  type="text" 
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  placeholder="e.g. Lesson 1: Introduction"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                <textarea 
                  value={lessonDesc}
                  onChange={(e) => setLessonDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  placeholder="Syllabus detail/topics covered..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Duration (Minutes)</label>
                <input 
                  type="number" 
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(Number(e.target.value))}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  placeholder="e.g. 45"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Video File (MP4/WebM, Max 200MB)</label>
                <input 
                  type="file" 
                  accept="video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setLessonFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
              </div>

              <button 
                type="submit"
                disabled={lessonCreateSubmitting}
                className="w-full rounded-md bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all mt-4 cursor-pointer disabled:opacity-50"
              >
                {lessonCreateSubmitting ? 'Uploading...' : 'Save Lesson'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT QUIZ */}
      {showAddQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="border-b border-border p-6 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold text-foreground">
                {editingQuizId ? 'Edit Quiz Assessment' : 'Create Quiz Assessment'}
              </h3>
              <button 
                onClick={() => {
                  setShowAddQuizModal(false);
                  setEditingQuizId(null);
                }}
                className="rounded-md border border-border p-1.5 hover:bg-secondary transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4 rotate-45 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {quizError && (
                <div className="flex gap-2 rounded-md border border-destructive/20 bg-destructive/15 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{quizError}</span>
                </div>
              )}
              {quizSuccess && (
                <div className="flex gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{quizSuccess}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quiz Title *</label>
                <input 
                  type="text" 
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  placeholder="e.g. Midterm Assessment"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                <textarea 
                  value={quizDesc}
                  onChange={(e) => setQuizDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  placeholder="Instructions for students..."
                />
              </div>

              {/* Test Type Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Test Grading Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setQuizTestType('Autogradable');
                    }}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      quizTestType === 'Autogradable'
                        ? 'border-emerald-500 bg-emerald-500/10 text-foreground font-bold'
                        : 'border-border bg-background text-muted-foreground hover:bg-secondary/20'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      Autogradable
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-normal">
                      Single & Multiple Correct MCQs. Autograded instantly upon submission.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuizTestType('Handgraded')}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      quizTestType === 'Handgraded'
                        ? 'border-purple-500 bg-purple-500/10 text-foreground font-bold'
                        : 'border-border bg-background text-muted-foreground hover:bg-secondary/20'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                      Handgraded / Subjective
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-normal">
                      Includes Subjective questions. MCQs autograded, Subjective graded by teacher.
                    </p>
                  </button>
                </div>
              </div>

              {/* Response Window / Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Response Deadline / Window</label>
                  <select
                    value={quizDeadlineOption}
                    onChange={(e) => setQuizDeadlineOption(e.target.value as any)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="none">No Deadline (Always Open)</option>
                    <option value="1day">1 Day Window</option>
                    <option value="3days">3 Days Window</option>
                    <option value="1week">1 Week Window</option>
                    <option value="2weeks">2 Weeks Window</option>
                    <option value="custom">Custom Date & Time</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Time Limit (Minutes, 0 = No Limit)</label>
                  <input 
                    type="number" 
                    value={quizTimeLimit}
                    onChange={(e) => setQuizTimeLimit(Number(e.target.value))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                    placeholder="e.g. 30"
                  />
                </div>
              </div>

              {quizDeadlineOption === 'custom' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Custom Deadline Date & Time</label>
                  <input
                    type="datetime-local"
                    value={quizCustomDeadline}
                    onChange={(e) => setQuizCustomDeadline(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                    required
                  />
                </div>
              )}

              {/* Anti-Cheating & Integrity Features */}
              <div className="border border-border rounded-lg bg-secondary/10 p-4 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground">Anti-Cheating & Attempt Configuration</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <input 
                      type="checkbox"
                      checked={quizShuffleQuestions}
                      onChange={(e) => setQuizShuffleQuestions(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    Shuffle Questions
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <input 
                      type="checkbox"
                      checked={quizShuffleOptions}
                      onChange={(e) => setQuizShuffleOptions(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    Shuffle Options (MCQ)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <input 
                      type="checkbox"
                      checked={quizHideAnswersUntilDeadline}
                      onChange={(e) => setQuizHideAnswersUntilDeadline(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    Hide Correct Answers Until Deadline
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Max Allowed Attempts</label>
                    <input 
                      type="number" 
                      min="1"
                      value={quizMaxAttempts}
                      onChange={(e) => setQuizMaxAttempts(Number(e.target.value))}
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Scoring Policy</label>
                    <select
                      value={quizScoringPolicy}
                      onChange={(e) => setQuizScoringPolicy(e.target.value as any)}
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none cursor-pointer"
                    >
                      <option value="latest">Latest Score</option>
                      <option value="best">Highest Score</option>
                      <option value="average">Average Score</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dynamic Questions Builder */}
              <div className="space-y-3 pt-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Questions list ({quizQuestions.length})</h4>
                  <button
                    onClick={() => {
                      setQuizQuestions([
                        ...quizQuestions,
                        { questionText: '', type: 'MCQ', options: ['', ''], correctAnswer: '0', correctAnswers: ['0'], points: 1, negativePoints: 0 }
                      ]);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Question
                  </button>
                </div>

                <div className="space-y-4">
                  {quizQuestions.map((q, idx) => (
                    <div key={idx} className="border border-border rounded-lg p-4 bg-secondary/10 space-y-3 relative">
                      <button
                        type="button"
                        onClick={() => {
                          if (quizQuestions.length === 1) return;
                          setQuizQuestions(quizQuestions.filter((_, qIdx) => qIdx !== idx));
                        }}
                        className="absolute top-3 right-3 text-destructive hover:bg-destructive/10 p-1 rounded transition-colors cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <div className="text-xs font-bold text-foreground">Question {idx + 1}</div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Question Prompt</label>
                        <input
                          type="text"
                          value={q.questionText}
                          onChange={(e) => {
                            const newQ = [...quizQuestions];
                            newQ[idx].questionText = e.target.value;
                            setQuizQuestions(newQ);
                          }}
                          className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
                          placeholder="Type question prompt..."
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Attachment URL (Optional - Image / PDF Link)</label>
                        <input
                          type="url"
                          value={q.attachmentUrl || ''}
                          onChange={(e) => {
                            const newQ = [...quizQuestions];
                            newQ[idx].attachmentUrl = e.target.value;
                            setQuizQuestions(newQ);
                          }}
                          className="w-full rounded border border-border bg-background px-2 py-1 text-[10px] text-foreground focus:outline-none"
                          placeholder="https://example.com/image.png"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Question Type</label>
                          <select
                            value={q.type}
                            onChange={(e) => {
                              const newType = e.target.value as 'MCQ' | 'MultipleMCQ' | 'Subjective';
                              const newQ = [...quizQuestions];
                              newQ[idx].type = newType;
                              if (!newQ[idx].options || newQ[idx].options.length === 0) {
                                newQ[idx].options = ['', ''];
                              }
                              if (newType === 'Subjective') {
                                setQuizTestType('Handgraded');
                              }
                              setQuizQuestions(newQ);
                            }}
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none cursor-pointer"
                          >
                            <option value="MCQ">Single Choice MCQ</option>
                            <option value="MultipleMCQ">Multiple Choice MCQ</option>
                            <option value="Subjective">Subjective / Essay</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Points (Positive)</label>
                          <input
                            type="number"
                            value={q.points}
                            onChange={(e) => {
                              const newQ = [...quizQuestions];
                              newQ[idx].points = Number(e.target.value);
                              setQuizQuestions(newQ);
                            }}
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
                            min={1}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider text-destructive font-semibold">Negative Marking (Deduction)</label>
                          <input
                            type="number"
                            step="0.25"
                            value={q.negativePoints || 0}
                            onChange={(e) => {
                              const newQ = [...quizQuestions];
                              newQ[idx].negativePoints = Number(e.target.value);
                              setQuizQuestions(newQ);
                            }}
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
                            min={0}
                            placeholder="e.g. 0.25"
                          />
                        </div>
                      </div>

                      {/* Single Choice MCQ Options */}
                      {q.type === 'MCQ' && (
                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Options (Select Radio Button for Correct Option)</label>
                            <button
                              type="button"
                              onClick={() => {
                                const newQ = [...quizQuestions];
                                newQ[idx].options.push('');
                                setQuizQuestions(newQ);
                              }}
                              className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                            >
                              + Add Option
                            </button>
                          </div>

                          <div className="space-y-2">
                            {q.options?.map((opt: string, oIdx: number) => (
                              <div key={oIdx} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${idx}`}
                                  checked={q.correctAnswer === String(oIdx)}
                                  onChange={() => {
                                    const newQ = [...quizQuestions];
                                    newQ[idx].correctAnswer = String(oIdx);
                                    setQuizQuestions(newQ);
                                  }}
                                  className="cursor-pointer text-emerald-600 focus:ring-emerald-500"
                                />
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const newQ = [...quizQuestions];
                                    if (newQ[idx].options) {
                                      newQ[idx].options[oIdx] = e.target.value;
                                    }
                                    setQuizQuestions(newQ);
                                  }}
                                  className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
                                  placeholder={`Option ${oIdx + 1}`}
                                  required
                                />
                                {q.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newQ = [...quizQuestions];
                                      newQ[idx].options.splice(oIdx, 1);
                                      if (Number(newQ[idx].correctAnswer) >= newQ[idx].options.length) {
                                        newQ[idx].correctAnswer = '0';
                                      }
                                      setQuizQuestions(newQ);
                                    }}
                                    className="text-destructive hover:bg-destructive/10 p-1 rounded"
                                    title="Remove option"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Multiple Choice MCQ Options */}
                      {q.type === 'MultipleMCQ' && (
                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold">Options (Tick Checkboxes for ALL Correct Options)</label>
                            <button
                              type="button"
                              onClick={() => {
                                const newQ = [...quizQuestions];
                                newQ[idx].options.push('');
                                setQuizQuestions(newQ);
                              }}
                              className="text-[10px] text-purple-600 dark:text-purple-400 font-bold hover:underline"
                            >
                              + Add Option
                            </button>
                          </div>

                          <div className="space-y-2">
                            {q.options?.map((opt: string, oIdx: number) => {
                              const isChecked = q.correctAnswers?.includes(String(oIdx));
                              return (
                                <div key={oIdx} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const newQ = [...quizQuestions];
                                      let currentCorrects = newQ[idx].correctAnswers || [];
                                      if (e.target.checked) {
                                        if (!currentCorrects.includes(String(oIdx))) {
                                          currentCorrects.push(String(oIdx));
                                        }
                                      } else {
                                        currentCorrects = currentCorrects.filter((c: string) => c !== String(oIdx));
                                      }
                                      newQ[idx].correctAnswers = currentCorrects;
                                      setQuizQuestions(newQ);
                                    }}
                                    className="cursor-pointer text-purple-600 focus:ring-purple-500 rounded"
                                  />
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const newQ = [...quizQuestions];
                                      if (newQ[idx].options) {
                                        newQ[idx].options[oIdx] = e.target.value;
                                      }
                                      setQuizQuestions(newQ);
                                    }}
                                    className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
                                    placeholder={`Option ${oIdx + 1}`}
                                    required
                                  />
                                  {q.options.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newQ = [...quizQuestions];
                                        newQ[idx].options.splice(oIdx, 1);
                                        newQ[idx].correctAnswers = (newQ[idx].correctAnswers || [])
                                          .filter((c: string) => Number(c) !== oIdx)
                                          .map((c: string) => Number(c) > oIdx ? String(Number(c) - 1) : c);
                                        setQuizQuestions(newQ);
                                      }}
                                      className="text-destructive hover:bg-destructive/10 p-1 rounded"
                                      title="Remove option"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Subjective Key */}
                      {q.type === 'Subjective' && (
                        <div className="space-y-1.5 pt-2">
                          <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Correct Answer Key / Sample Response (Reference for Teacher Grading)</label>
                          <textarea
                            value={q.correctAnswer || ''}
                            onChange={(e) => {
                              const newQ = [...quizQuestions];
                              newQ[idx].correctAnswer = e.target.value;
                              setQuizQuestions(newQ);
                            }}
                            rows={2}
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
                            placeholder="Enter expected keywords or model response..."
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="button"
                onClick={handleAddQuiz}
                disabled={quizSubmitting}
                className="w-full rounded-md bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all mt-4 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {quizSubmitting ? 'Saving...' : editingQuizId ? 'Update & Save Quiz' : 'Save & Publish Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAKE QUIZ */}
      {showTakeQuizModal && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="border-b border-border p-6 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-sm font-bold text-foreground">Take Quiz: {selectedQuiz.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  {selectedQuiz.timeLimit > 0 && quizTimeRemaining !== null && (
                    <span className={`text-[10px] font-semibold flex items-center gap-1 ${quizTimeRemaining < 60 ? 'text-destructive animate-pulse' : 'text-amber-600 dark:text-amber-400'}`}>
                      <Clock className="h-3 w-3" /> Time Remaining: {Math.floor(quizTimeRemaining / 60)}:{(quizTimeRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                  {selectedQuiz.deadline && (
                    <span className="text-[10px] text-muted-foreground">
                      Deadline: {new Date(selectedQuiz.deadline).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowTakeQuizModal(false);
                  setSelectedQuiz(null);
                }}
                className="rounded-md border border-border p-1.5 hover:bg-secondary transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4 rotate-45 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmitQuizAttempt} className="p-6 overflow-y-auto space-y-5 flex-1">
              {selectedQuiz.questions?.map((q: any, idx: number) => {
                const studentAnswer = quizAnswers.find(a => a.questionId === q._id);
                return (
                  <div key={q._id} className="space-y-2.5 border border-border rounded-lg p-4 bg-secondary/5">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs font-bold text-foreground">Q{idx + 1}: {q.questionText} ({q.points} pts)</p>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border shrink-0">
                        {q.type === 'MultipleMCQ' ? 'Select Multiple' : q.type === 'MCQ' ? 'Select One' : 'Subjective Response'}
                      </span>
                    </div>
                    
                    {/* Single Choice MCQ */}
                    {q.type === 'MCQ' && (
                      <div className="space-y-1.5 pt-1 pl-1">
                        {(q.displayOptions || []).map((opt: any, optIdx: number) => (
                          <label key={optIdx} className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                            <input
                              type="radio"
                              name={`q-ans-${q._id}`}
                              checked={studentAnswer?.answerText === String(opt.originalIndex)}
                              onChange={() => {
                                setQuizAnswers(
                                  quizAnswers.map(ans => 
                                    ans.questionId === q._id ? { ...ans, answerText: String(opt.originalIndex) } : ans
                                  )
                                );
                              }}
                              className="cursor-pointer text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            <span>{opt.text}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Multiple Choice MCQ */}
                    {q.type === 'MultipleMCQ' && (
                      <div className="space-y-1.5 pt-1 pl-1">
                        {(q.displayOptions || []).map((opt: any, optIdx: number) => {
                          const currentSelections: string[] = studentAnswer?.selectedOptions || [];
                          const isChecked = currentSelections.includes(String(opt.originalIndex));
                          return (
                            <label key={optIdx} className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  let newSel = [...currentSelections];
                                  if (e.target.checked) {
                                    if (!newSel.includes(String(opt.originalIndex))) newSel.push(String(opt.originalIndex));
                                  } else {
                                    newSel = newSel.filter(s => s !== String(opt.originalIndex));
                                  }
                                  setQuizAnswers(
                                    quizAnswers.map(ans =>
                                      ans.questionId === q._id ? { ...ans, selectedOptions: newSel, answerText: JSON.stringify(newSel) } : ans
                                    )
                                  );
                                }}
                                className="cursor-pointer text-purple-600 focus:ring-purple-500 rounded h-3.5 w-3.5"
                              />
                              <span>{opt.text}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Subjective Essay */}
                    {q.type === 'Subjective' && (
                      <textarea
                        value={studentAnswer?.answerText || ''}
                        onChange={(e) => {
                          setQuizAnswers(
                            quizAnswers.map(ans => 
                              ans.questionId === q._id ? { ...ans, answerText: e.target.value } : ans
                            )
                          );
                        }}
                        rows={3}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                        placeholder="Write your response explanation here..."
                        required
                      />
                    )}
                  </div>
                );
              })}

              <button 
                type="submit"
                className="w-full rounded-md bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all mt-4 cursor-pointer"
              >
                Submit Assessment Answers
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GRADE QUIZ ATTEMPT */}
      {showGradeAttemptModal && selectedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="border-b border-border p-6 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-sm font-bold text-foreground">Grade Student Attempt</h3>
                <p className="text-[10px] text-muted-foreground">Review student responses and assign final score.</p>
              </div>
              <button 
                onClick={() => {
                  setShowGradeAttemptModal(false);
                  setSelectedAttempt(null);
                }}
                className="rounded-md border border-border p-1.5 hover:bg-secondary transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4 rotate-45 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleGradeQuizAttempt} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Student Header */}
              <div className="text-xs flex justify-between items-center bg-secondary/15 p-3 border border-border rounded-lg">
                <div>
                  <p><strong>Student:</strong> {selectedAttempt.userId?.name || 'Unknown'}</p>
                  <p className="text-[10px] text-muted-foreground"><strong>Email:</strong> {selectedAttempt.userId?.email}</p>
                  <p className="text-[10px] text-muted-foreground"><strong>Submitted:</strong> {new Date(selectedAttempt.submittedAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Calculated Total Score</span>
                  <span className="text-base font-extrabold text-primary">
                    {(() => {
                      let total = 0;
                      selectedQuiz?.questions?.forEach((q: any) => {
                        const ans = selectedAttempt.answers?.find((a: any) => a.questionId === q._id);
                        if (q.type === 'MCQ') {
                          if (ans?.answerText === q.correctAnswer) total += q.points;
                          else if (ans?.answerText && q.negativePoints) total -= q.negativePoints;
                        } else if (q.type === 'MultipleMCQ') {
                          let selOpts: string[] = ans?.selectedOptions || [];
                          if (!selOpts.length && ans?.answerText) {
                            try { selOpts = JSON.parse(ans.answerText); } catch { selOpts = ans.answerText.split(','); }
                          }
                          const isExact = selOpts.length === (q.correctAnswers || []).length &&
                            selOpts.every(o => (q.correctAnswers || []).includes(String(o)));
                          if (isExact) total += q.points;
                          else if (selOpts.length && q.negativePoints) total -= q.negativePoints;
                        } else if (q.type === 'Subjective') {
                          total += Math.min(q.points, Math.max(0, Number(subjectiveGrades[q._id] ?? ans?.marksAwarded ?? 0)));
                        }
                      });
                      return Math.max(0, total);
                    })()} / {selectedQuiz?.questions?.reduce((acc: number, curr: any) => acc + (curr.points || 0), 0)} pts
                  </span>
                </div>
              </div>

              {/* Read-Only Student Responses & Subjective Grading Inputs */}
              <div className="space-y-3 border border-border rounded-lg p-3 bg-card divide-y divide-border/60">
                {selectedQuiz?.questions?.map((question: any, idx: number) => {
                  const studentAns = selectedAttempt.answers?.find((a: any) => a.questionId === question._id);

                  let studentDisplay = '';
                  let isCorrectMCQ = false;
                  if (question.type === 'MCQ') {
                    const selectedIdx = studentAns?.answerText;
                    isCorrectMCQ = selectedIdx === question.correctAnswer;
                    studentDisplay = (selectedIdx !== undefined && selectedIdx !== '')
                      ? (question.options?.[Number(selectedIdx)] ?? 'No selection submitted')
                      : 'No selection submitted';
                  } else if (question.type === 'MultipleMCQ') {
                    let selOpts: string[] = studentAns?.selectedOptions || [];
                    if (!selOpts.length && studentAns?.answerText) {
                      try { selOpts = JSON.parse(studentAns.answerText); } catch { selOpts = studentAns.answerText.split(','); }
                    }
                    isCorrectMCQ = selOpts.length === (question.correctAnswers || []).length &&
                      selOpts.every(o => (question.correctAnswers || []).includes(String(o)));
                    studentDisplay = selOpts.map(i => question.options?.[Number(i)] || i).join(', ') || 'No selections submitted';
                  } else {
                    studentDisplay = studentAns?.answerText || 'No subjective response submitted';
                  }

                  return (
                    <div key={question._id || idx} className="text-[11px] space-y-2 pt-3 first:pt-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-semibold text-foreground">
                          Q{idx + 1}: {question.questionText} ({question.points} pts{question.negativePoints ? `, -${question.negativePoints} neg` : ''})
                        </p>
                        <span className="text-[9px] uppercase font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                          {question.type}
                        </span>
                      </div>

                      {/* Read-Only Student Response Display */}
                      <div className="bg-secondary/20 p-2.5 rounded-md border border-border/60">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-1">
                          Student Submitted Response (Immutable)
                        </span>
                        <p className="text-xs text-foreground font-sans whitespace-pre-wrap">{studentDisplay}</p>
                      </div>

                      {/* Autograded evaluation status for MCQs */}
                      {question.type !== 'Subjective' && (
                        <div className="flex items-center justify-between text-[10px] pt-0.5">
                          <span className="text-muted-foreground">
                            Correct Key: {question.type === 'MCQ' 
                              ? question.options?.[Number(question.correctAnswer)] || question.correctAnswer
                              : (question.correctAnswers || []).map((i: string) => question.options?.[Number(i)] || i).join(', ')
                            }
                          </span>
                          <span className={`font-bold px-1.5 py-0.5 rounded ${
                            isCorrectMCQ ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/15 text-destructive'
                          }`}>
                            {isCorrectMCQ ? `+${question.points} pts (Autograded)` : question.negativePoints ? `-${question.negativePoints} pts (Neg. Marking)` : '0 pts'}
                          </span>
                        </div>
                      )}

                      {/* Subjective Grading & Answer Key */}
                      {question.type === 'Subjective' && (
                        <div className="space-y-2 pt-1 border-t border-dashed border-border/60">
                          {question.correctAnswer && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 p-2 rounded text-[10px]">
                              <strong>Teacher Answer Key / Rubric:</strong> {question.correctAnswer}
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-3 bg-primary/5 p-2 rounded border border-primary/20">
                            <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                              Assigned Marks (Max: {question.points} pts):
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={question.points}
                              step={0.5}
                              value={subjectiveGrades[question._id] ?? studentAns?.marksAwarded ?? 0}
                              onChange={(e) => {
                                const val = Math.min(question.points, Math.max(0, Number(e.target.value)));
                                setSubjectiveGrades(prev => ({ ...prev, [question._id]: val }));
                              }}
                              className="w-20 rounded border border-border bg-background px-2 py-1 text-xs text-right font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Faculty Feedback */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Faculty Feedback</label>
                <textarea 
                  value={gradeQuizFeedback}
                  onChange={(e) => setGradeQuizFeedback(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  placeholder="Provide overall feedback or grading comments for the student..."
                />
              </div>

              <button 
                type="submit"
                disabled={gradeAttemptSubmitting}
                className="w-full rounded-md bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all mt-4 cursor-pointer disabled:opacity-50"
              >
                {gradeAttemptSubmitting ? 'Saving Grade...' : 'Save Grade & Update Score'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ASSIGNMENT */}
      {showAddAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="border-b border-border p-6 flex justify-between items-center">
              <h3 className="text-sm font-bold text-foreground">Create Assignment</h3>
              <button 
                onClick={() => setShowAddAssignmentModal(false)}
                className="rounded-md border border-border p-1.5 hover:bg-secondary transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4 rotate-45 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleAddAssignment} className="p-6 space-y-4">
              {assignmentError && (
                <div className="flex gap-2 rounded-md border border-destructive/20 bg-destructive/15 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{assignmentError}</span>
                </div>
              )}
              {assignmentSuccess && (
                <div className="flex gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{assignmentSuccess}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assignment Title *</label>
                <input 
                  type="text" 
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  placeholder="e.g. Essay: AI Revolution"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description *</label>
                <textarea 
                  value={assignmentDesc}
                  onChange={(e) => setAssignmentDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  placeholder="Requirements, syllabus references..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Attachment URL (Optional Image/PDF Link)</label>
                <input 
                  type="url" 
                  value={assignmentAttachmentUrl}
                  onChange={(e) => setAssignmentAttachmentUrl(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  placeholder="https://example.com/reference.pdf"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Deadline Date/Time *</label>
                <input 
                  type="datetime-local" 
                  value={assignmentDeadline}
                  onChange={(e) => setAssignmentDeadline(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Marks *</label>
                <input 
                  type="number" 
                  value={assignmentTotalMarks}
                  onChange={(e) => setAssignmentTotalMarks(Number(e.target.value))}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={assignmentSubmitting}
                className="w-full rounded-md bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all mt-4 cursor-pointer disabled:opacity-50"
              >
                {assignmentSubmitting ? 'Creating...' : 'Publish Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT ASSIGNMENT */}
      {showSubmitAssignmentModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="border-b border-border p-6 flex justify-between items-center">
              <h3 className="text-sm font-bold text-foreground">Upload Submission: {selectedAssignment.title}</h3>
              <button 
                onClick={() => {
                  setShowSubmitAssignmentModal(false);
                  setSelectedAssignment(null);
                  setAssignmentFile(null);
                }}
                className="rounded-md border border-border p-1.5 hover:bg-secondary transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4 rotate-45 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmitAssignment} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select PDF File *</label>
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setAssignmentFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={assignmentSubmittingFile}
                className="w-full rounded-md bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all mt-4 cursor-pointer disabled:opacity-50"
              >
                {assignmentSubmittingFile ? 'Submitting...' : 'Upload PDF'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GRADE ASSIGNMENT SUBMISSION */}
      {showGradeSubmissionModal && selectedSubmission && selectedSubmissionsAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="border-b border-border p-6 flex justify-between items-center">
              <h3 className="text-sm font-bold text-foreground">Grade Homework Submission</h3>
              <button 
                onClick={() => {
                  setShowGradeSubmissionModal(false);
                  setSelectedSubmission(null);
                }}
                className="rounded-md border border-border p-1.5 hover:bg-secondary transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4 rotate-45 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleGradeSubmission} className="p-6 space-y-4">
              <div className="text-xs space-y-1">
                <p><strong>Student:</strong> {selectedSubmission.studentId?.name}</p>
                <p><strong>Email:</strong> {selectedSubmission.studentId?.email}</p>
                <p><strong>Max Marks possible:</strong> {selectedSubmissionsAssignment.totalMarks}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Grade Score *</label>
                <input 
                  type="number" 
                  value={gradeSubmissionScore}
                  onChange={(e) => setGradeSubmissionScore(Number(e.target.value))}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  max={selectedSubmissionsAssignment.totalMarks}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Feedback</label>
                <textarea 
                  value={gradeSubmissionFeedback}
                  onChange={(e) => setGradeSubmissionFeedback(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  placeholder="Constructive feedback for student..."
                />
              </div>

              <button 
                type="submit"
                disabled={gradeSubmissionSubmitting}
                className="w-full rounded-md bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all mt-4 cursor-pointer disabled:opacity-50"
              >
                {gradeSubmissionSubmitting ? 'Grading...' : 'Save Grade'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
