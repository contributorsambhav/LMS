import React from 'react';
import { X, UploadCloud, FileUp, Sparkles, AlertCircle, Clock, CheckCircle2, ChevronRight, FileText, CheckCircle, Video, Plus, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../../../../../lib/api';

export default function CourseModals(props: any) {
  const {
    loading,
    setLoading,
    error,
    setError,
    courseData,
    setCourseData,
    sessions,
    setSessions,
    materials,
    setMaterials,
    students,
    setStudents,
    courseFaculty,
    setCourseFaculty,
    pendingRequests,
    setPendingRequests,
    instituteStudents,
    setInstituteStudents,
    instituteFaculty,
    setInstituteFaculty,
    studentCourseProgress,
    setStudentCourseProgress,
    activeTab,
    setActiveTab,
    sessionView,
    setSessionView,
    isCopied,
    setIsCopied,
    showEditModal,
    setShowEditModal,
    showAddSessionModal,
    setShowAddSessionModal,
    showAddMaterialModal,
    setShowAddMaterialModal,
    showAddStudentModal,
    setShowAddStudentModal,
    showAssignFacultyModal,
    setShowAssignFacultyModal,
    lessons,
    setLessons,
    selectedLesson,
    setSelectedLesson,
    showAddLessonModal,
    setShowAddLessonModal,
    lessonTitle,
    setLessonTitle,
    lessonDesc,
    setLessonDesc,
    lessonDuration,
    setLessonDuration,
    lessonFile,
    setLessonFile,
    lessonCreateError,
    setLessonCreateError,
    lessonCreateSuccess,
    setLessonCreateSuccess,
    lessonCreateSubmitting,
    setLessonCreateSubmitting,
    quizzes,
    setQuizzes,
    quizAttempts,
    setQuizAttempts,
    selectedQuiz,
    setSelectedQuiz,
    quizAnswers,
    setQuizAnswers,
    showAddQuizModal,
    setShowAddQuizModal,
    showTakeQuizModal,
    setShowTakeQuizModal,
    showViewAttemptsModal,
    setShowViewAttemptsModal,
    showGradeAttemptModal,
    setShowGradeAttemptModal,
    selectedAttempt,
    setSelectedAttempt,
    gradeQuizScore,
    setGradeQuizScore,
    gradeQuizFeedback,
    setGradeQuizFeedback,
    subjectiveGrades,
    setSubjectiveGrades,
    quizTitle,
    setQuizTitle,
    quizDesc,
    setQuizDesc,
    quizTestType,
    setQuizTestType,
    quizDeadlineOption,
    setQuizDeadlineOption,
    quizCustomDeadline,
    setQuizCustomDeadline,
    quizTimeLimit,
    setQuizTimeLimit,
    quizShuffleQuestions,
    setQuizShuffleQuestions,
    quizShuffleOptions,
    setQuizShuffleOptions,
    quizHideAnswersUntilDeadline,
    setQuizHideAnswersUntilDeadline,
    quizMaxAttempts,
    setQuizMaxAttempts,
    quizScoringPolicy,
    setQuizScoringPolicy,
    quizQuestions,
    setQuizQuestions,
    quizError,
    setQuizError,
    quizSuccess,
    setQuizSuccess,
    quizSubmitting,
    setQuizSubmitting,
    quizTimeRemaining,
    setQuizTimeRemaining,
    quizAttemptsLoading,
    setQuizAttemptsLoading,
    quizAttemptsError,
    setQuizAttemptsError,
    gradeAttemptSubmitting,
    setGradeAttemptSubmitting,
    assignments,
    setAssignments,
    submissions,
    setSubmissions,
    selectedAssignment,
    setSelectedAssignment,
    selectedSubmissionsAssignment,
    setSelectedSubmissionsAssignment,
    showAddAssignmentModal,
    setShowAddAssignmentModal,
    showSubmitAssignmentModal,
    setShowSubmitAssignmentModal,
    showViewSubmissionsModal,
    setShowViewSubmissionsModal,
    showGradeSubmissionModal,
    setShowGradeSubmissionModal,
    selectedSubmission,
    setSelectedSubmission,
    gradeSubmissionScore,
    setGradeSubmissionScore,
    gradeSubmissionFeedback,
    setGradeSubmissionFeedback,
    assignmentTitle,
    setAssignmentTitle,
    assignmentDesc,
    setAssignmentDesc,
    assignmentDeadline,
    setAssignmentDeadline,
    assignmentTotalMarks,
    setAssignmentTotalMarks,
    assignmentAttachmentUrl,
    setAssignmentAttachmentUrl,
    assignmentError,
    setAssignmentError,
    assignmentSuccess,
    setAssignmentSuccess,
    assignmentSubmitting,
    setAssignmentSubmitting,
    assignmentFile,
    setAssignmentFile,
    assignmentSubmittingFile,
    setAssignmentSubmittingFile,
    submissionsLoading,
    setSubmissionsLoading,
    gradeSubmissionSubmitting,
    setGradeSubmissionSubmitting,
    pendingGrading,
    setPendingGrading,
    loadingGrading,
    setLoadingGrading,
    editName,
    setEditName,
    editDesc,
    setEditDesc,
    editCode,
    setEditCode,
    editError,
    setEditError,
    editSuccess,
    setEditSuccess,
    sessionTitle,
    setSessionTitle,
    sessionDesc,
    setSessionDesc,
    sessionStart,
    setSessionStart,
    sessionEnd,
    setSessionEnd,
    sessionLiveLink,
    setSessionLiveLink,
    sessionVideo,
    setSessionVideo,
    sessionFaculty,
    setSessionFaculty,
    sessionFiles,
    setSessionFiles,
    sessionError,
    setSessionError,
    sessionSuccess,
    setSessionSuccess,
    sessionSubmitting,
    setSessionSubmitting,
    autoGenerateZoom,
    setAutoGenerateZoom,
    isZoomActive,
    setIsZoomActive,
    materialTitle,
    setMaterialTitle,
    materialFile,
    setMaterialFile,
    materialError,
    setMaterialError,
    materialSuccess,
    setMaterialSuccess,
    materialSubmitting,
    setMaterialSubmitting,
    selectedStudentIds,
    setSelectedStudentIds,
    enrollError,
    setEnrollError,
    enrollSuccess,
    setEnrollSuccess,
    enrollSubmitting,
    setEnrollSubmitting,
    selectedFacultyIds,
    setSelectedFacultyIds,
    assignError,
    setAssignError,
    assignSuccess,
    setAssignSuccess,
    assignSubmitting,
    setAssignSubmitting,
    editingQuizId,
    setEditingQuizId,
    editingAttemptAnswers,
    setEditingAttemptAnswers,
    courseId,
    session,
    isAdmin,
    isFaculty,
    isStudent,
    router,
    handleUpdateCourse,
    handleAddSession,
    handleAddMaterial,
    handleEnrollStudents,
    handleAssignFaculty,
    handleAddLesson,
    handleAddQuiz,
    handleStartQuizAttempt,
    handleSubmitQuizAttempt,
    handleGradeQuizAttempt,
    handleAddAssignment,
    handleSubmitAssignment,
    handleGradeSubmission,
    copyToClipboard,
  } = props;

  return (
    <>
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
                  {courseFaculty.map((f: any) => (
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
                        <span className="truncate max-w-[200px]">{(file as any).name}</span>
                        <span>({Math.round((file as any).size / 1024)} KB)</span>
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
                  instituteStudents.map((stud: any) => {
                    const isEnrolled = students.some((s: any) => s._id === stud._id);
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
                              setSelectedStudentIds(selectedStudentIds.filter((id: any) => id !== stud._id));
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
                  instituteFaculty.map((fac: any) => {
                    const isAssigned = courseFaculty.some((f: any) => f._id === fac._id);
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
                              setSelectedFacultyIds(selectedFacultyIds.filter((id: any) => id !== fac._id));
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
                      setQuizTestType('Autograded');
                    }}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      quizTestType === 'Autograded'
                        ? 'border-emerald-500 bg-emerald-500/10 text-foreground font-bold'
                        : 'border-border bg-background text-muted-foreground hover:bg-secondary/20'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      Autograded
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
                  {quizQuestions.map((q: any, idx: number) => (
                    <div key={idx} className="border border-border rounded-lg p-4 bg-secondary/10 space-y-3 relative">
                      <button
                        type="button"
                        onClick={() => {
                          if (quizQuestions.length === 1) return;
                          setQuizQuestions(quizQuestions.filter((_: any, qIdx: number) => qIdx !== idx));
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
                const studentAnswer = quizAnswers.find((a: any) => a.questionId === q._id);
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
                                  quizAnswers.map((ans: any) => 
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
                                    quizAnswers.map((ans: any) =>
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
                            quizAnswers.map((ans: any) => 
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
                                setSubjectiveGrades((prev: any) => ({ ...prev, [question._id]: val }));
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

    </>
  );
}
