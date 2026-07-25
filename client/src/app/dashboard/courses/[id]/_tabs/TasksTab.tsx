import React from 'react';
import { ClipboardList, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../../../../../lib/api';

export default function TasksTab({ studentCourseProgress }: { studentCourseProgress: any }) {
  if (!studentCourseProgress) return <div className="p-4 text-center text-sm text-muted-foreground">Loading pending tasks...</div>;

  const { assignments, quizzes, submissions, attempts } = studentCourseProgress;

  // Filter pending assignments (no submission yet)
  const pendingAssignments = assignments.filter((a: any) => 
    !submissions.some((s: any) => s.assignmentId._id === a._id)
  );

  // Filter pending quizzes (no attempts yet)
  const pendingQuizzes = quizzes.filter((q: any) => 
    !attempts.some((att: any) => att.quizId._id === q._id)
  );

  const hasTasks = pendingAssignments.length > 0 || pendingQuizzes.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Pending Tasks</h3>
          <p className="text-xs text-muted-foreground">Assignments and Quizzes you have not yet completed.</p>
        </div>
      </div>

      {!hasTasks ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
          <h4 className="text-xs font-semibold text-foreground mb-1">All Caught Up!</h4>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            You have no pending assignments or quizzes at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingAssignments.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assignments Due</h4>
              <div className="space-y-2">
                {pendingAssignments.map((a: any) => (
                  <div key={a._id} className="flex justify-between items-center bg-secondary/10 p-3 rounded-lg border border-border/50">
                    <div>
                      <h5 className="text-sm font-bold text-foreground">{a.title}</h5>
                      <p className="text-xs text-muted-foreground">Due: {new Date(a.deadline).toLocaleDateString()}</p>
                    </div>
                    <span className="text-[10px] font-semibold bg-destructive/10 text-destructive border border-destructive/20 px-2 py-1 rounded">Pending Submission</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingQuizzes.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quizzes Due</h4>
              <div className="space-y-2">
                {pendingQuizzes.map((q: any) => (
                  <div key={q._id} className="flex justify-between items-center bg-secondary/10 p-3 rounded-lg border border-border/50">
                    <div>
                      <h5 className="text-sm font-bold text-foreground">{q.title}</h5>
                      <p className="text-xs text-muted-foreground">
                        {q.deadlineOption === 'Custom' ? `Due: ${new Date(q.customDeadline).toLocaleDateString()}` : 'No Deadline'}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-2 py-1 rounded">Not Attempted</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
