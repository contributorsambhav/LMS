import React, { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from '../../../../../lib/api';
import { useUser } from '../../../../../lib/session';

export default function GradingTab({ pendingGrading, courseId }: { pendingGrading: any, courseId: string }) {
  const session = useUser();
  const [assignedDoubts, setAssignedDoubts] = useState<any[]>([]);
  const [loadingDoubts, setLoadingDoubts] = useState(true);
  const DOUBT_SERVICE_URL = "/doubt-proxy";

  useEffect(() => {
    if (!session?.token || !courseId) return;
    fetch(`${DOUBT_SERVICE_URL}/api/doubts/assigned/${courseId}`, {
      headers: { Authorization: `Bearer ${session.token}` }
    })
      .then(res => res.json())
      .then(data => {
        setAssignedDoubts(Array.isArray(data) ? data : []);
        setLoadingDoubts(false);
      })
      .catch(err => {
        console.error("Failed to fetch assigned doubts", err);
        setLoadingDoubts(false);
      });
  }, [session]);

  if (!pendingGrading) return <div className="p-4 text-center text-sm text-muted-foreground">Loading pending tasks...</div>;

  const { submissions, attempts } = pendingGrading;

  const hasTasks = submissions?.length > 0 || attempts?.length > 0 || assignedDoubts.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Pending Tasks</h3>
          <p className="text-xs text-muted-foreground">Assignments, Quizzes, and Doubts that require your attention.</p>
        </div>
      </div>

      {!hasTasks && !loadingDoubts ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
          <h4 className="text-xs font-semibold text-foreground mb-1">All Caught Up!</h4>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            You have no pending tasks to address.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {assignedDoubts.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5"/> Assigned Doubts</h4>
              <div className="space-y-2">
                {assignedDoubts.map((doubt: any) => (
                  <div key={doubt._id} className="flex justify-between items-center bg-primary/5 p-3 rounded-lg border border-primary/20">
                    <div>
                      <h5 className="text-sm font-bold text-foreground line-clamp-1">{doubt.subject}</h5>
                      <p className="text-xs text-muted-foreground">Student: {doubt.studentId?.name || 'Unknown'}</p>
                    </div>
                    <span className="text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-1 rounded shadow-sm">Action Required</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {submissions?.length > 0 && (
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

          {attempts?.length > 0 && (
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
