'use client';

import { toast } from 'react-toastify';
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
import StudentProgress from '../../../../components/StudentProgress';
import FacultyProgress from '../../../../components/FacultyProgress';
import LessonsTab from './_tabs/LessonsTab';
import SessionsTab from './_tabs/SessionsTab';
import MaterialsTab from './_tabs/MaterialsTab';
import QuizzesTab from './_tabs/QuizzesTab';
import AssignmentsTab from './_tabs/AssignmentsTab';
import RosterTab from './_tabs/RosterTab';
import TasksTab from './_tabs/TasksTab';
import GradingTab from './_tabs/GradingTab';
import CourseDoubts from '../../../../components/CourseDoubts';
import CourseModals from './_modals/CourseModals';

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

  // Student specific global state
  const [studentCourseProgress, setStudentCourseProgress] = useState<any>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<'lessons' | 'sessions' | 'materials' | 'quizzes' | 'assignments' | 'roster' | 'progress' | 'doubts' | 'tasks' | 'grading'>('lessons');
  const [sessionView, setSessionView] = useState<'list' | 'calendar'>('list');
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
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
  const [quizTestType, setQuizTestType] = useState<'Autograded' | 'Handgraded'>('Autograded');
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

  // Pending Grading state for Faculty
  const [pendingGrading, setPendingGrading] = useState<{ submissions: any[], attempts: any[] }>({ submissions: [], attempts: [] });
  const [loadingGrading, setLoadingGrading] = useState(false);

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

  const forceRefresh = () => {
    fetchCourseData();
    router.refresh();
  };

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

      // 11. Fetch Student Progress
      if (isStudent) {
        const progressRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/progress`, {
          headers: { Authorization: `Bearer ${session.token}` }
        });
        if (progressRes.ok) setStudentCourseProgress(await progressRes.json());
      }

      // 12. Fetch Lessons
      const lessonsRes = await fetch(`${API_BASE_URL}/api/lessons/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (lessonsRes.ok) setLessons(await lessonsRes.json());

      // 13. Fetch Pending Grading for Faculty
      if (!isStudent) {
        const gradRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/pending-grading`, {
          headers: { Authorization: `Bearer ${session.token}` }
        });
        if (gradRes.ok) {
           const gradData = await gradRes.json();
           setPendingGrading({ submissions: gradData.pendingSubmissions || [], attempts: gradData.pendingQuizAttempts || [] });
        }
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
      toast.error('Course Name and Course Code are required.');
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
        toast.error(data.message || 'Failed to update course details.');
      } else {
        toast.success('Course updated successfully!');
        setCourseData(data.course);
        setTimeout(() => setShowEditModal(false), 1200);
      }
    } catch (err) {
      toast.error('Network error updating course.');
    }
  };

  // Form - Delete Course
  
  const handleDeleteCourse = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Course',
      message: 'Are you sure you want to delete this course entirely? This action cannot be undone.',
      onConfirm: () => actual_handleDeleteCourse()
    });
  };
  
  const actual_handleDeleteCourse = async () => {
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
        toast.error(data.message || 'Failed to delete course.');
      }
    } catch (err) {
      toast.error('Network error deleting course.');
    }
  };

  // Form - Add Session
  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) return;
    if (!sessionTitle || !sessionStart || !sessionEnd) {
      toast.error('Please fill in all mandatory fields.');
      return;
    }
    if (!autoGenerateZoom && !sessionLiveLink) {
      toast.error('Please provide a Live Link or enable Zoom auto-generation.');
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
        toast.error(data.message || 'Failed to schedule session.');
      } else {
        toast.success(data.message || 'Lecture session scheduled successfully!');
        // Reset form
        setSessionTitle('');
        setSessionDesc('');
        setSessionLiveLink('');
        setSessionVideo('');
        setSessionFaculty('');
        setSessionFiles(null);
        setAutoGenerateZoom(true);
        // Refresh
        forceRefresh();
        setTimeout(() => setShowAddSessionModal(false), 1200);
      }
    } catch (err) {
      toast.error('Network error scheduling session.');
    } finally {
      setSessionSubmitting(false);
    }
  };

  // Form - Upload Material (Independent)
  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) return;
    if (!materialFile) {
      toast.error('Please select a PDF file.');
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
        toast.error(data.message || 'Failed to upload material.');
      } else {
        toast.success('Material uploaded successfully!');
        setMaterialTitle('');
        setMaterialFile(null);
        forceRefresh();
        setTimeout(() => setShowAddMaterialModal(false), 1200);
      }
    } catch (err) {
      toast.error('Network error uploading material.');
    } finally {
      setMaterialSubmitting(false);
    }
  };

  
  const handleDeleteMaterial = (materialId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Material',
      message: 'Are you sure you want to delete this material?',
      onConfirm: () => actual_handleDeleteMaterial(materialId)
    });
  };
  
  const actual_handleDeleteMaterial = async (materialId: string) => {
    if (!session?.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/materials/${materialId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || 'Failed to delete material.');
      }
      forceRefresh();
    } catch (err: any) {
      toast.error(err?.message || 'Network error deleting material.');
      forceRefresh();
    }
  };

  // Form - Enroll Students
  const handleEnrollStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) return;
    if (selectedStudentIds.length === 0) {
      toast.error('Please select at least one student.');
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
        toast.error(data.message || 'Failed to enroll students.');
      } else {
        toast.success(`Successfully enrolled ${selectedStudentIds.length} students.`);
        setSelectedStudentIds([]);
        forceRefresh();
        setTimeout(() => setShowAddStudentModal(false), 1200);
      }
    } catch (err) {
      toast.error('Network error enrolling students.');
    } finally {
      setEnrollSubmitting(false);
    }
  };

  // Form - Assign Faculty
  const handleAssignFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) return;
    if (selectedFacultyIds.length === 0) {
      toast.error('Please select at least one faculty member.');
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
        toast.error(data.message || 'Failed to assign faculty.');
      } else {
        toast.success(`Successfully assigned ${selectedFacultyIds.length} faculty.`);
        setSelectedFacultyIds([]);
        forceRefresh();
        setTimeout(() => setShowAssignFacultyModal(false), 1200);
      }
    } catch (err) {
      toast.error('Network error assigning faculty.');
    } finally {
      setAssignSubmitting(false);
    }
  };

  // Action - Unassign Faculty
  
  const handleUnassignFaculty = (facultyId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Unassign Faculty',
      message: 'Are you sure you want to unassign this faculty member?',
      onConfirm: () => actual_handleUnassignFaculty(facultyId)
    });
  };
  
  const actual_handleUnassignFaculty = async (facultyId: string) => {
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
        forceRefresh();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to unassign faculty.');
      }
    } catch (err) {
      toast.error('Network error unassigning faculty.');
    }
  };

  // Action - Remove Student
  
  const handleRemoveStudent = (studentId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Student',
      message: 'Are you sure you want to remove this student from the course?',
      onConfirm: () => actual_handleRemoveStudent(studentId)
    });
  };
  
  const actual_handleRemoveStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student from this course?')) return;
    if (!session?.token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/students/${studentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (res.ok) {
        forceRefresh();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to remove student.');
      }
    } catch (err) {
      toast.error('Network error removing student.');
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
        forceRefresh();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to update request.');
      }
    } catch (err) {
      toast.error('Network error resolving request.');
    }
  };

  // ========================================================
  // LESSON SYSTEM HANDLERS
  // ========================================================

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) return;
    if (!lessonTitle) {
      toast.error('Lesson Title is required.');
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
        toast.error(data.message || 'Failed to create lesson.');
      } else {
        toast.success('Lesson created successfully!');
        setLessonTitle('');
        setLessonDesc('');
        setLessonDuration(0);
        setLessonFile(null);
        forceRefresh();
        setTimeout(() => {
          setShowAddLessonModal(false);
          setLessonCreateSuccess('');
        }, 1500);
      }
    } catch (err) {
      toast.error('Network error occurred.');
    } finally {
      setLessonCreateSubmitting(false);
    }
  };

  
  const handleDeleteLesson = (lessonId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Lesson',
      message: 'Are you sure you want to delete this recorded lesson?',
      onConfirm: () => actual_handleDeleteLesson(lessonId)
    });
  };
  
  const actual_handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    if (!session?.token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (res.ok) {
        forceRefresh();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to delete lesson.');
      }
    } catch (err) {
      toast.error('Network error deleting lesson.');
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
    setQuizTestType(quiz.testType || 'Autograded');
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
      toast.error('Quiz Title is required.');
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
        toast.error(data.message || (editingQuizId ? 'Failed to update quiz.' : 'Failed to create quiz.'));
      } else {
        toast.success(editingQuizId ? 'Quiz updated successfully!' : 'Quiz created successfully!');
        setQuizTitle('');
        setQuizDesc('');
        setQuizTestType('Autograded');
        setQuizDeadlineOption('none');
        setQuizCustomDeadline('');
        setQuizTimeLimit(0);
        setQuizQuestions([{ questionText: '', type: 'MCQ', options: ['', ''], correctAnswer: '0', correctAnswers: ['0'], points: 1, negativePoints: 0 }]);
        setEditingQuizId(null);
        forceRefresh();
        setTimeout(() => {
          setShowAddQuizModal(false);
          setQuizSuccess('');
        }, 1500);
      }
    } catch (err) {
      toast.error('Network error occurred.');
    } finally {
      setQuizSubmitting(false);
    }
  };

  
  const handleDeleteQuiz = (quizParam: any) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Quiz',
      message: 'Are you sure you want to delete this quiz and all its attempts?',
      onConfirm: () => actual_handleDeleteQuiz(quizParam)
    });
  };
  
  const actual_handleDeleteQuiz = async (quizParam: any) => {
    const quizId = typeof quizParam === 'string' ? quizParam : (quizParam?._id || quizParam?.id);
    if (!quizId) return;

    // Bypassing window.confirm as some embedded browsers suppress it causing silent failures
    // if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to delete this quiz?')) return;

    const token = session?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : '');
    if (!token) {
      toast.error('Session token unavailable. Please re-login.');
      return;
    }

    // Optimistic removal
    setQuizzes((prev: any[]) => prev.filter(q => (q._id || q.id) !== quizId));
    if ((selectedQuiz?._id || selectedQuiz?.id) === quizId) setSelectedQuiz(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || 'Failed to delete quiz.');
      }
      forceRefresh(); // Force refresh to ensure sync
    } catch (err: any) {
      toast.error(err?.message || 'Network error deleting quiz.');
      forceRefresh();
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
        toast.error(data.message || 'Failed to start quiz attempt.');
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
      toast.error('Network error starting quiz.');
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
        toast.error(data.message || 'Quiz submitted successfully!');
        setShowTakeQuizModal(false);
        setSelectedQuiz(null);
        setQuizAnswers([]);
        forceRefresh();
      } else {
        toast.error(data.message || 'Failed to submit quiz attempt.');
      }
    } catch (err) {
      toast.error('Network error submitting quiz.');
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
        toast.error('Failed to load attempts.');
      }
    } catch (err) {
      toast.error('Network error loading attempts.');
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
        toast.success('Attempt graded successfully.');
        setShowGradeAttemptModal(false);
        setSelectedAttempt(null);
        if (selectedQuiz) fetchQuizAttempts(selectedQuiz._id);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to grade attempt.');
      }
    } catch (err) {
      toast.error('Network error grading attempt.');
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
      toast.error('All required fields must be filled.');
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
        toast.error(data.message || 'Failed to create assignment.');
      } else {
        toast.success('Assignment created successfully!');
        setAssignmentTitle('');
        setAssignmentDesc('');
        setAssignmentDeadline('');
        setAssignmentAttachmentUrl('');
        setAssignmentTotalMarks(100);
        forceRefresh();
        setTimeout(() => {
          setShowAddAssignmentModal(false);
          setAssignmentSuccess('');
        }, 1500);
      }
    } catch (err) {
      toast.error('Network error.');
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  
  const handleDeleteAssignment = (assignmentParam: any) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Assignment',
      message: 'Are you sure you want to delete this assignment and all its submissions?',
      onConfirm: () => actual_handleDeleteAssignment(assignmentParam)
    });
  };
  
  const actual_handleDeleteAssignment = async (assignmentParam: any) => {
    const assignmentId = typeof assignmentParam === 'string' ? assignmentParam : (assignmentParam?._id || assignmentParam?.id);
    if (!assignmentId) return;

    // Bypassing window.confirm as some embedded browsers suppress it causing silent failures
    // if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to delete this assignment?')) return;

    const token = session?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : '');
    if (!token) {
      toast.error('Session token unavailable. Please re-login.');
      return;
    }

    // Optimistic removal
    setAssignments((prev: any[]) => prev.filter(a => (a._id || a.id) !== assignmentId));
    if ((selectedAssignment?._id || selectedAssignment?.id) === assignmentId) setSelectedAssignment(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || 'Failed to delete assignment.');
      }
      forceRefresh(); // Force refresh to ensure sync
    } catch (err: any) {
      toast.error(err?.message || 'Network error deleting assignment.');
      forceRefresh();
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token || !selectedAssignment || !assignmentFile) {
      toast.error('Please select a PDF file to upload.');
      return;
    }

    setAssignmentSubmittingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', assignmentFile);

      const res = await fetch(`${API_BASE_URL}/api/assignments/${selectedAssignment._id}/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Assignment submitted successfully!');
        setShowSubmitAssignmentModal(false);
        setSelectedAssignment(null);
        setAssignmentFile(null);
        forceRefresh();
      } else {
        toast.error(data.message || 'Failed to submit assignment.');
      }
    } catch (err) {
      toast.error('Network error uploading assignment.');
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
        toast.success('Submission graded successfully.');
        setShowGradeSubmissionModal(false);
        setSelectedSubmission(null);
        if (selectedSubmissionsAssignment) fetchSubmissions(selectedSubmissionsAssignment._id);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to grade submission.');
      }
    } catch (err) {
      toast.error('Network error grading submission.');
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
      <div className="flex border-b border-border space-x-1 shrink-0 overflow-x-auto scrollbar-violet">
        {(['lessons', 'sessions', 'materials', 'quizzes', 'assignments', 'roster', 'progress', 'doubts', ...(isStudent ? ['tasks'] : []), ...(!isStudent ? ['grading'] : [])] as any[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 cursor-pointer capitalize transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'lessons' ? 'Recorded Lessons' : tab === 'sessions' ? 'Live Sessions' : tab === 'materials' ? `Materials (${materials.length})` : tab === 'quizzes' ? `Quizzes (${quizzes.length})` : tab === 'assignments' ? `Assignments (${assignments.length})` : tab === 'progress' ? (isStudent ? 'My Progress' : 'Course Analytics') : tab === 'tasks' ? 'Pending Tasks' : tab === 'grading' ? 'Pending Grading' : tab === 'doubts' ? 'Doubt Portal' : `Class Roster (${students.length + courseFaculty.length})`}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">

        {/* 0. RECORDED LESSONS TAB */}
        {activeTab === 'lessons' && (
          <LessonsTab
            lessons={lessons}
            isAdmin={isAdmin}
            isFaculty={isFaculty}
            isStudent={isStudent}
            setShowAddLessonModal={setShowAddLessonModal}
            handleDeleteLesson={handleDeleteLesson}
            handleUpdateProgress={handleUpdateProgress}
          />
        )}

        {/* 1. SESSIONS TAB */}
        {activeTab === 'sessions' && (
          <SessionsTab
            sessions={sessions}
            isAdmin={isAdmin}
            isFaculty={isFaculty}
            setShowAddSessionModal={setShowAddSessionModal}
            setSessionStart={setSessionStart}
            setSessionEnd={setSessionEnd}
          />
        )}

        {/* 2. MATERIALS TAB */}
        {activeTab === 'materials' && (
          <MaterialsTab
            materials={materials}
            isAdmin={isAdmin}
            isFaculty={isFaculty}
            setShowAddMaterialModal={setShowAddMaterialModal}
            handleDeleteMaterial={handleDeleteMaterial}
          />
        )}

        {/* QUIZZES TAB */}
        {activeTab === 'quizzes' && (
          <QuizzesTab
            quizzes={quizzes}
            isAdmin={isAdmin}
            isFaculty={isFaculty}
            isStudent={isStudent}
            selectedQuiz={selectedQuiz}
            setSelectedQuiz={setSelectedQuiz}
            quizAttempts={quizAttempts}
            quizAttemptsLoading={quizAttemptsLoading}
            quizAttemptsError={quizAttemptsError}
            fetchQuizAttempts={fetchQuizAttempts}
            studentCourseProgress={studentCourseProgress}
            setShowAddQuizModal={setShowAddQuizModal}
            setQuizQuestions={setQuizQuestions}
            setQuizTitle={setQuizTitle}
            setQuizDesc={setQuizDesc}
            setQuizTimeLimit={setQuizTimeLimit}
            handleOpenEditQuiz={handleOpenEditQuiz}
            handleDeleteQuiz={handleDeleteQuiz}
            setShowTakeQuizModal={setShowTakeQuizModal}
            setShowViewAttemptsModal={setShowViewAttemptsModal}
            setShowGradeAttemptModal={setShowGradeAttemptModal}
            setSelectedAttempt={setSelectedAttempt}
            handleStartQuizAttempt={handleStartQuizAttempt}
            setQuizAnswers={setQuizAnswers}
            setQuizTimeRemaining={setQuizTimeRemaining}
            setGradeQuizScore={setGradeQuizScore}
            setGradeQuizFeedback={setGradeQuizFeedback}
            setSubjectiveGrades={setSubjectiveGrades}
            handleSubmitQuizAttempt={handleSubmitQuizAttempt}
          />
        )}

        {/* ASSIGNMENTS TAB */}
        {activeTab === 'assignments' && (
          <AssignmentsTab
            assignments={assignments}
            isAdmin={isAdmin}
            isFaculty={isFaculty}
            isStudent={isStudent}
            selectedAssignment={selectedAssignment}
            setSelectedAssignment={setSelectedAssignment}
            setShowAddAssignmentModal={setShowAddAssignmentModal}
            handleDeleteAssignment={handleDeleteAssignment}
            studentCourseProgress={studentCourseProgress}
            setShowSubmitAssignmentModal={setShowSubmitAssignmentModal}
            submissions={submissions}
            submissionsLoading={submissionsLoading}
            fetchSubmissions={fetchSubmissions}
            setShowGradeSubmissionModal={setShowGradeSubmissionModal}
            setSelectedSubmission={setSelectedSubmission}
            setAssignmentTitle={setAssignmentTitle}
            setAssignmentDesc={setAssignmentDesc}
            setAssignmentDeadline={setAssignmentDeadline}
            setAssignmentTotalMarks={setAssignmentTotalMarks}
            setSelectedSubmissionsAssignment={setSelectedSubmissionsAssignment}
            setGradeSubmissionScore={setGradeSubmissionScore}
            setGradeSubmissionFeedback={setGradeSubmissionFeedback}
          />
        )}

        {/* 3. ROSTER TAB */}
        {activeTab === 'roster' && (
          <RosterTab
            students={students}
            isAdmin={isAdmin}
            isFaculty={isFaculty}
            course={courseData}
            setShowAddStudentModal={setShowAddStudentModal}
            handleRemoveStudent={handleRemoveStudent}
            setShowAssignFacultyModal={setShowAssignFacultyModal}
            pendingEnrollments={pendingRequests}
            handleResolveEnrollment={handleResolveEnrollment}
            courseFaculty={courseFaculty}
            handleUnassignFaculty={handleUnassignFaculty}
          />
        )}

        {/* TASKS TAB (STUDENTS) */}
        {activeTab === 'tasks' && (
          <TasksTab studentCourseProgress={studentCourseProgress} />
        )}

        {/* GRADING TAB (FACULTY/ADMIN) */}
        {activeTab === 'grading' && (
          <GradingTab pendingGrading={pendingGrading} courseId={courseId as string} />
        )}

        {/* 4. PROGRESS / ANALYTICS TAB */}
        {activeTab === 'progress' && (
          isStudent ? (
            <StudentProgress courseId={courseId} />
          ) : (
            <FacultyProgress courseId={courseId} />
          )
        )}
        
        {/* 5. DOUBT PORTAL TAB */}
        {activeTab === 'doubts' && (
          <CourseDoubts courseId={courseId} />
        )}
      </div>

      {/* MODALS */}{/* ======================================================== */}
      {/* 4. MODALS & FORMS (PORTALS)                              */}
      {/* ======================================================== */}

      {/* MODAL: EDIT COURSE */}
          <CourseModals
            loading={loading}
            setLoading={setLoading}
            error={error}
            setError={setError}
            courseData={courseData}
            setCourseData={setCourseData}
            sessions={sessions}
            setSessions={setSessions}
            materials={materials}
            setMaterials={setMaterials}
            students={students}
            setStudents={setStudents}
            courseFaculty={courseFaculty}
            setCourseFaculty={setCourseFaculty}
            pendingRequests={pendingRequests}
            setPendingRequests={setPendingRequests}
            instituteStudents={instituteStudents}
            setInstituteStudents={setInstituteStudents}
            instituteFaculty={instituteFaculty}
            setInstituteFaculty={setInstituteFaculty}
            studentCourseProgress={studentCourseProgress}
            setStudentCourseProgress={setStudentCourseProgress}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sessionView={sessionView}
            setSessionView={setSessionView}
            isCopied={isCopied}
            setIsCopied={setIsCopied}
            showEditModal={showEditModal}
            setShowEditModal={setShowEditModal}
            showAddSessionModal={showAddSessionModal}
            setShowAddSessionModal={setShowAddSessionModal}
            showAddMaterialModal={showAddMaterialModal}
            setShowAddMaterialModal={setShowAddMaterialModal}
            showAddStudentModal={showAddStudentModal}
            setShowAddStudentModal={setShowAddStudentModal}
            showAssignFacultyModal={showAssignFacultyModal}
            setShowAssignFacultyModal={setShowAssignFacultyModal}
            lessons={lessons}
            setLessons={setLessons}
            selectedLesson={selectedLesson}
            setSelectedLesson={setSelectedLesson}
            showAddLessonModal={showAddLessonModal}
            setShowAddLessonModal={setShowAddLessonModal}
            lessonTitle={lessonTitle}
            setLessonTitle={setLessonTitle}
            lessonDesc={lessonDesc}
            setLessonDesc={setLessonDesc}
            lessonDuration={lessonDuration}
            setLessonDuration={setLessonDuration}
            lessonFile={lessonFile}
            setLessonFile={setLessonFile}
            lessonCreateError={lessonCreateError}
            setLessonCreateError={setLessonCreateError}
            lessonCreateSuccess={lessonCreateSuccess}
            setLessonCreateSuccess={setLessonCreateSuccess}
            lessonCreateSubmitting={lessonCreateSubmitting}
            setLessonCreateSubmitting={setLessonCreateSubmitting}
            quizzes={quizzes}
            setQuizzes={setQuizzes}
            quizAttempts={quizAttempts}
            setQuizAttempts={setQuizAttempts}
            selectedQuiz={selectedQuiz}
            setSelectedQuiz={setSelectedQuiz}
            quizAnswers={quizAnswers}
            setQuizAnswers={setQuizAnswers}
            showAddQuizModal={showAddQuizModal}
            setShowAddQuizModal={setShowAddQuizModal}
            showTakeQuizModal={showTakeQuizModal}
            setShowTakeQuizModal={setShowTakeQuizModal}
            showViewAttemptsModal={showViewAttemptsModal}
            setShowViewAttemptsModal={setShowViewAttemptsModal}
            showGradeAttemptModal={showGradeAttemptModal}
            setShowGradeAttemptModal={setShowGradeAttemptModal}
            selectedAttempt={selectedAttempt}
            setSelectedAttempt={setSelectedAttempt}
            gradeQuizScore={gradeQuizScore}
            setGradeQuizScore={setGradeQuizScore}
            gradeQuizFeedback={gradeQuizFeedback}
            setGradeQuizFeedback={setGradeQuizFeedback}
            subjectiveGrades={subjectiveGrades}
            setSubjectiveGrades={setSubjectiveGrades}
            quizTitle={quizTitle}
            setQuizTitle={setQuizTitle}
            quizDesc={quizDesc}
            setQuizDesc={setQuizDesc}
            quizTestType={quizTestType}
            setQuizTestType={setQuizTestType}
            quizDeadlineOption={quizDeadlineOption}
            setQuizDeadlineOption={setQuizDeadlineOption}
            quizCustomDeadline={quizCustomDeadline}
            setQuizCustomDeadline={setQuizCustomDeadline}
            quizTimeLimit={quizTimeLimit}
            setQuizTimeLimit={setQuizTimeLimit}
            quizShuffleQuestions={quizShuffleQuestions}
            setQuizShuffleQuestions={setQuizShuffleQuestions}
            quizShuffleOptions={quizShuffleOptions}
            setQuizShuffleOptions={setQuizShuffleOptions}
            quizHideAnswersUntilDeadline={quizHideAnswersUntilDeadline}
            setQuizHideAnswersUntilDeadline={setQuizHideAnswersUntilDeadline}
            quizMaxAttempts={quizMaxAttempts}
            setQuizMaxAttempts={setQuizMaxAttempts}
            quizScoringPolicy={quizScoringPolicy}
            setQuizScoringPolicy={setQuizScoringPolicy}
            quizQuestions={quizQuestions}
            setQuizQuestions={setQuizQuestions}
            quizError={quizError}
            setQuizError={setQuizError}
            quizSuccess={quizSuccess}
            setQuizSuccess={setQuizSuccess}
            quizSubmitting={quizSubmitting}
            setQuizSubmitting={setQuizSubmitting}
            quizTimeRemaining={quizTimeRemaining}
            setQuizTimeRemaining={setQuizTimeRemaining}
            quizAttemptsLoading={quizAttemptsLoading}
            setQuizAttemptsLoading={setQuizAttemptsLoading}
            quizAttemptsError={quizAttemptsError}
            setQuizAttemptsError={setQuizAttemptsError}
            gradeAttemptSubmitting={gradeAttemptSubmitting}
            setGradeAttemptSubmitting={setGradeAttemptSubmitting}
            assignments={assignments}
            setAssignments={setAssignments}
            submissions={submissions}
            setSubmissions={setSubmissions}
            selectedAssignment={selectedAssignment}
            setSelectedAssignment={setSelectedAssignment}
            selectedSubmissionsAssignment={selectedSubmissionsAssignment}
            setSelectedSubmissionsAssignment={setSelectedSubmissionsAssignment}
            showAddAssignmentModal={showAddAssignmentModal}
            setShowAddAssignmentModal={setShowAddAssignmentModal}
            showSubmitAssignmentModal={showSubmitAssignmentModal}
            setShowSubmitAssignmentModal={setShowSubmitAssignmentModal}
            showViewSubmissionsModal={showViewSubmissionsModal}
            setShowViewSubmissionsModal={setShowViewSubmissionsModal}
            showGradeSubmissionModal={showGradeSubmissionModal}
            setShowGradeSubmissionModal={setShowGradeSubmissionModal}
            selectedSubmission={selectedSubmission}
            setSelectedSubmission={setSelectedSubmission}
            gradeSubmissionScore={gradeSubmissionScore}
            setGradeSubmissionScore={setGradeSubmissionScore}
            gradeSubmissionFeedback={gradeSubmissionFeedback}
            setGradeSubmissionFeedback={setGradeSubmissionFeedback}
            assignmentTitle={assignmentTitle}
            setAssignmentTitle={setAssignmentTitle}
            assignmentDesc={assignmentDesc}
            setAssignmentDesc={setAssignmentDesc}
            assignmentDeadline={assignmentDeadline}
            setAssignmentDeadline={setAssignmentDeadline}
            assignmentTotalMarks={assignmentTotalMarks}
            setAssignmentTotalMarks={setAssignmentTotalMarks}
            assignmentAttachmentUrl={assignmentAttachmentUrl}
            setAssignmentAttachmentUrl={setAssignmentAttachmentUrl}
            assignmentError={assignmentError}
            setAssignmentError={setAssignmentError}
            assignmentSuccess={assignmentSuccess}
            setAssignmentSuccess={setAssignmentSuccess}
            assignmentSubmitting={assignmentSubmitting}
            setAssignmentSubmitting={setAssignmentSubmitting}
            assignmentFile={assignmentFile}
            setAssignmentFile={setAssignmentFile}
            assignmentSubmittingFile={assignmentSubmittingFile}
            setAssignmentSubmittingFile={setAssignmentSubmittingFile}
            submissionsLoading={submissionsLoading}
            setSubmissionsLoading={setSubmissionsLoading}
            gradeSubmissionSubmitting={gradeSubmissionSubmitting}
            setGradeSubmissionSubmitting={setGradeSubmissionSubmitting}
            pendingGrading={pendingGrading}
            setPendingGrading={setPendingGrading}
            loadingGrading={loadingGrading}
            setLoadingGrading={setLoadingGrading}
            editName={editName}
            setEditName={setEditName}
            editDesc={editDesc}
            setEditDesc={setEditDesc}
            editCode={editCode}
            setEditCode={setEditCode}
            editError={editError}
            setEditError={setEditError}
            editSuccess={editSuccess}
            setEditSuccess={setEditSuccess}
            sessionTitle={sessionTitle}
            setSessionTitle={setSessionTitle}
            sessionDesc={sessionDesc}
            setSessionDesc={setSessionDesc}
            sessionStart={sessionStart}
            setSessionStart={setSessionStart}
            sessionEnd={sessionEnd}
            setSessionEnd={setSessionEnd}
            sessionLiveLink={sessionLiveLink}
            setSessionLiveLink={setSessionLiveLink}
            sessionVideo={sessionVideo}
            setSessionVideo={setSessionVideo}
            sessionFaculty={sessionFaculty}
            setSessionFaculty={setSessionFaculty}
            sessionFiles={sessionFiles}
            setSessionFiles={setSessionFiles}
            sessionError={sessionError}
            setSessionError={setSessionError}
            sessionSuccess={sessionSuccess}
            setSessionSuccess={setSessionSuccess}
            sessionSubmitting={sessionSubmitting}
            setSessionSubmitting={setSessionSubmitting}
            autoGenerateZoom={autoGenerateZoom}
            setAutoGenerateZoom={setAutoGenerateZoom}
            isZoomActive={isZoomActive}
            setIsZoomActive={setIsZoomActive}
            materialTitle={materialTitle}
            setMaterialTitle={setMaterialTitle}
            materialFile={materialFile}
            setMaterialFile={setMaterialFile}
            materialError={materialError}
            setMaterialError={setMaterialError}
            materialSuccess={materialSuccess}
            setMaterialSuccess={setMaterialSuccess}
            materialSubmitting={materialSubmitting}
            setMaterialSubmitting={setMaterialSubmitting}
            selectedStudentIds={selectedStudentIds}
            setSelectedStudentIds={setSelectedStudentIds}
            enrollError={enrollError}
            setEnrollError={setEnrollError}
            enrollSuccess={enrollSuccess}
            setEnrollSuccess={setEnrollSuccess}
            enrollSubmitting={enrollSubmitting}
            setEnrollSubmitting={setEnrollSubmitting}
            selectedFacultyIds={selectedFacultyIds}
            setSelectedFacultyIds={setSelectedFacultyIds}
            assignError={assignError}
            setAssignError={setAssignError}
            assignSuccess={assignSuccess}
            setAssignSuccess={setAssignSuccess}
            assignSubmitting={assignSubmitting}
            setAssignSubmitting={setAssignSubmitting}
            editingQuizId={editingQuizId}
            setEditingQuizId={setEditingQuizId}
            editingAttemptAnswers={editingAttemptAnswers}
            setEditingAttemptAnswers={setEditingAttemptAnswers}
            courseId={courseId}
            session={session}
            isAdmin={isAdmin}
            isFaculty={isFaculty}
            isStudent={isStudent}
            router={router}
            handleUpdateCourse={handleUpdateCourse}
            handleAddSession={handleAddSession}
            handleAddMaterial={handleAddMaterial}
            handleEnrollStudents={handleEnrollStudents}
            handleAssignFaculty={handleAssignFaculty}
            handleAddLesson={handleAddLesson}
            handleAddQuiz={handleAddQuiz}
            handleStartQuizAttempt={handleStartQuizAttempt}
            handleSubmitQuizAttempt={handleSubmitQuizAttempt}
            handleGradeQuizAttempt={handleGradeQuizAttempt}
            handleAddAssignment={handleAddAssignment}
            handleSubmitAssignment={handleSubmitAssignment}
            handleGradeSubmission={handleGradeSubmission}
            copyToClipboard={copyToClipboard}
          />

    </div>
  );
}
