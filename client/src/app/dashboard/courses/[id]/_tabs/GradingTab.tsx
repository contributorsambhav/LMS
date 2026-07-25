import React from 'react';
import { ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../../../../lib/api';

export default function GradingTab({ pendingGrading }: { pendingGrading: any }) {
  if (!pendingGrading) return <div className="p-4 text-center text-sm text-muted-foreground">Loading pending grading...</div>;

  const { submissions, attempts } = pendingGrading;

  const hasGrading = submissions.length > 0 || attempts.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Pending Grading</h3>
          <p className="text-xs text-muted-foreground">Assignments and Quizzes that require your evaluation.</p>
        </div>
      </div>

      {!hasGrading ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
          <h4 className="text-xs font-semibold text-foreground mb-1">All Caught Up!</h4>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            You have no pending student submissions to grade.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {submissions.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assignments to Grade</h4>
              <div className="space-y-2">
                {submissions.map((s: any) => (
                  <div key={s._id} className="flex justify-between items-center bg-secondary/10 p-3 rounded-lg border border-border/50">
                    <div>
                      <h5 className="text-sm font-bold text-foreground">{s.assignmentId?.title || 'Unknown Assignment'}</h5>
                      <p className="text-xs text-muted-foreground">Student: {s.studentId?.name || 'Unknown'}</p>
                    </div>
                    <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-2 py-1 rounded">Needs Grading</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {attempts.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quizzes to Grade</h4>
              <div className="space-y-2">
                {attempts.map((att: any) => (
                  <div key={att._id} className="flex justify-between items-center bg-secondary/10 p-3 rounded-lg border border-border/50">
                    <div>
                      <h5 className="text-sm font-bold text-foreground">{att.quizId?.title || 'Unknown Quiz'}</h5>
                      <p className="text-xs text-muted-foreground">Student: {att.userId?.name || 'Unknown'}</p>
                    </div>
                    <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-2 py-1 rounded">Needs Grading</span>
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
