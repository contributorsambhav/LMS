import React from 'react';
import { Users, UserCheck, UserMinus, Plus, Mail, Trash2, Sparkles } from 'lucide-react';

interface RosterTabProps {
  isAdmin: any;
  isFaculty: any;
  course: any;
  setShowAddStudentModal: any;
  handleRemoveStudent: any;
  setShowAssignFacultyModal: any;
  pendingEnrollments: any;
  handleResolveEnrollment: any;
  courseFaculty: any;
  handleUnassignFaculty: any;
  students: any;

}

export default function RosterTab(props: RosterTabProps) {
  const {
    isAdmin,
    isFaculty,
    course,
    setShowAddStudentModal,
    handleRemoveStudent,
    setShowAssignFacultyModal,
    pendingEnrollments,
    handleResolveEnrollment,
    courseFaculty,
    handleUnassignFaculty,
    students,

  } = props;

  return (
        <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Enrollment Approvals Section (Admins/Faculty) */}
            {(isAdmin || isFaculty) && pendingEnrollments.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Pending Approval Requests ({pendingEnrollments.length})
                </h4>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl overflow-hidden divide-y divide-border">
                  {pendingEnrollments.map((req: any) => (
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
                  {courseFaculty.map((fac: any) => (
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
                  {students.map((student: any) => (
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
        
  );
}
