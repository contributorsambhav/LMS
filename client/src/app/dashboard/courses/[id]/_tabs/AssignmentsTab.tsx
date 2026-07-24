import React from 'react';
import { Plus, FileQuestion, Clock, FileText, Trash2, ExternalLink, Eye, FileUp } from 'lucide-react';
import { API_BASE_URL } from '../../../../../lib/api';

interface AssignmentsTabProps {
  assignments: any;
  isAdmin: any;
  isFaculty: any;
  isStudent: any;
  selectedAssignment: any;
  setSelectedAssignment: any;
  setShowAddAssignmentModal: any;
  handleDeleteAssignment: any;
  studentCourseProgress: any;
  setShowSubmitAssignmentModal: any;
  setSelectedSubmission: any;
  setAssignmentTitle: any;
  setAssignmentDesc: any;
  setAssignmentDeadline: any;
  setAssignmentTotalMarks: any;
  fetchSubmissions: any;
  submissionsLoading: any;
  submissions: any;
  setSelectedSubmissionsAssignment: any;
  setGradeSubmissionScore: any;
  setGradeSubmissionFeedback: any;
  setShowGradeSubmissionModal: any;

}

export default function AssignmentsTab(props: AssignmentsTabProps) {
  const {
    assignments,
    isAdmin,
    isFaculty,
    isStudent,
    selectedAssignment,
    setSelectedAssignment,
    setShowAddAssignmentModal,
    handleDeleteAssignment,
    studentCourseProgress,
    setShowSubmitAssignmentModal,
    setSelectedSubmission,
    setAssignmentTitle,
    setAssignmentDesc,
    setAssignmentDeadline,
    setAssignmentTotalMarks,
    fetchSubmissions,
    submissionsLoading,
    submissions,
    setSelectedSubmissionsAssignment,
    setGradeSubmissionScore,
    setGradeSubmissionFeedback,
    setShowGradeSubmissionModal,

  } = props;

  return (
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
                  {assignments.map((assignment: any) => {
                    const isSelected = selectedAssignment?._id === assignment._id;
                    const isOverdue = new Date(assignment.deadline) < new Date();
                    
                    let studentStatusBadge = null;
                    if (isStudent && studentCourseProgress?.submissions) {
                      const submission = studentCourseProgress.submissions.find((s: any) => 
                        (s.assignmentId?._id || s.assignmentId)?.toString() === assignment._id.toString()
                      );
                      if (submission) {
                        if (submission.graded) {
                          studentStatusBadge = (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              Graded: {submission.grade}/{assignment.totalMarks}
                            </span>
                          );
                        } else {
                          studentStatusBadge = (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 whitespace-nowrap">
                              Pending Grading
                            </span>
                          );
                        }
                      } else {
                        studentStatusBadge = (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 whitespace-nowrap">
                            Not Submitted
                          </span>
                        );
                      }
                    }

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
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4 className="text-xs font-bold text-foreground line-clamp-1">{assignment.title}</h4>
                          <div className="flex items-center gap-1">
                            {studentStatusBadge}
                            {(isAdmin || isFaculty) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteAssignment(assignment._id);
                                }}
                                className="p-1 rounded text-destructive hover:bg-destructive/15 transition-colors cursor-pointer relative z-10"
                                title="Delete Assignment"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
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
                              {submissions[0].gradedBy && (
                                <p className="text-[10px] text-muted-foreground mt-1 mb-2">
                                  <strong className="text-foreground">Graded by:</strong> {submissions[0].gradedBy.name}
                                </p>
                              )}
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
                        <div className="space-y-6">
                          {/* Assignment Analytics (Faculty View) */}
                          <div className="space-y-3 mt-2">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assignment Analytics</h5>
                            <div className="grid grid-cols-3 gap-4 border border-border rounded-lg bg-card p-4">
                              <div className="text-center">
                                <p className="text-xl font-bold text-foreground">{submissions.length}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Submissions</p>
                              </div>
                              <div className="text-center border-l border-border pl-4">
                                <p className="text-xl font-bold text-foreground">
                                  {(() => {
                                    const graded = submissions.filter((s: any) => s.graded);
                                    return graded.length > 0 ? (graded.reduce((acc: any, sub: any) => acc + (sub.grade || 0), 0) / graded.length).toFixed(1) : 0;
                                  })()}
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Average Grade</p>
                              </div>
                              <div className="text-center border-l border-border pl-4">
                                <p className="text-xl font-bold text-foreground">
                                  {(() => {
                                    const graded = submissions.filter((s: any) => s.graded);
                                    return graded.length > 0 ? Math.max(...graded.map((sub: any) => sub.grade || 0)) : 0;
                                  })()}
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Highest Grade</p>
                              </div>
                            </div>
                          </div>

                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Student Submissions</h5>
                          {submissionsLoading ? (
                            <p className="text-xs text-muted-foreground font-sans">Loading submissions...</p>
                          ) : submissions.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic font-sans">No student has submitted this assignment yet.</p>
                          ) : (
                            <div className="border border-border rounded-lg overflow-hidden divide-y divide-border bg-card">
                              {submissions.map((sub: any) => (
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
                                    {sub.graded && sub.gradedBy && (
                                      <span className="text-[9px] text-muted-foreground text-right w-16">
                                        by {sub.gradedBy.name}
                                      </span>
                                    )}
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
        
  );
}
