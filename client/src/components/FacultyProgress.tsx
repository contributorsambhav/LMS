import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../lib/api';
import { useUser } from '../lib/session';
import { CheckCircle2, Clock, XCircle, FileText, HelpCircle, TrendingUp, Users } from 'lucide-react';

interface FacultyProgressProps {
  courseId: string;
}

export default function FacultyProgress({ courseId }: FacultyProgressProps) {
  const session = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!session?.token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/analytics`, {
          headers: { Authorization: `Bearer ${session.token}` }
        });
        if (!res.ok) {
          throw new Error('Failed to fetch course analytics');
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Error fetching analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [courseId, session]);

  if (loading) {
    return <div className="text-center py-12 text-sm text-muted-foreground animate-pulse">Loading course analytics...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-sm text-destructive">{error}</div>;
  }

  if (!data) return null;

  const { students = [], assignments = [], quizzes = [], submissions = [], attempts = [] } = data;

  const ScoreBar = ({ score, max }: { score: number, max: number }) => {
    const pct = max > 0 ? (score / max) * 100 : 0;
    let gradient = 'from-red-500 to-red-400';
    if (pct >= 80) gradient = 'from-emerald-500 to-emerald-400';
    else if (pct >= 50) gradient = 'from-amber-500 to-amber-400';
    
    return (
      <div className="w-full h-1.5 bg-secondary rounded-full mt-2 overflow-hidden flex">
        <div className={`h-full bg-gradient-to-r ${gradient} rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    );
  };

  let globalScoreEarned = 0;
  let globalScoreMax = 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="border-b border-border bg-secondary/30 p-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Student Aggregate Progress
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/20 text-muted-foreground uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 font-semibold border-b border-border">Student</th>
                <th className="px-4 py-3 font-semibold border-b border-border text-center">Avg Quiz Score</th>
                <th className="px-4 py-3 font-semibold border-b border-border text-center">Avg Assignment Score</th>
                <th className="px-4 py-3 font-semibold border-b border-border text-right">Aggregate Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground italic">No students enrolled yet.</td>
                </tr>
              ) : (
                students.map((student: any) => {
                  let studentPoints = 0;
                  let studentMax = 0;

                  // Quizzes
                  let qEarned = 0;
                  let qMax = 0;
                  quizzes.forEach((quiz: any) => {
                    const quizMaxScore = quiz.questions?.reduce((acc: number, q: any) => acc + (q.points || 1), 0) || 0;
                    const studentAttempts = attempts.filter((a: any) => 
                      (a.userId?._id || a.userId)?.toString() === student._id.toString() && 
                      (a.quizId?._id || a.quizId)?.toString() === quiz._id.toString()
                    );
                    
                    if (studentAttempts.length > 0) {
                      let effectiveScore = 0;
                      if (quiz.scoringPolicy === 'best') {
                        effectiveScore = Math.max(...studentAttempts.map((a: any) => a.score));
                      } else if (quiz.scoringPolicy === 'average') {
                        effectiveScore = studentAttempts.reduce((acc: number, a: any) => acc + a.score, 0) / studentAttempts.length;
                      } else {
                        effectiveScore = studentAttempts[studentAttempts.length - 1].score;
                      }

                      // Only count if graded
                      if (studentAttempts.some((a: any) => a.graded)) {
                        qEarned += effectiveScore;
                        qMax += quizMaxScore;
                      }
                    }
                  });

                  // Assignments
                  let aEarned = 0;
                  let aMax = 0;
                  assignments.forEach((assignment: any) => {
                    const submission = submissions.find((s: any) => 
                      (s.studentId?._id || s.studentId)?.toString() === student._id.toString() && 
                      (s.assignmentId?._id || s.assignmentId)?.toString() === assignment._id.toString()
                    );
                    if (submission && submission.graded) {
                      aEarned += (submission.grade || 0);
                      aMax += assignment.totalMarks;
                    }
                  });

                  studentPoints = qEarned + aEarned;
                  studentMax = qMax + aMax;
                  globalScoreEarned += studentPoints;
                  globalScoreMax += studentMax;

                  return (
                    <tr key={student._id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{student.name}</p>
                        <p className="text-[10px] text-muted-foreground">{student.email}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono font-medium">{qMax > 0 ? `${qEarned.toFixed(1)}/${qMax}` : '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono font-medium">{aMax > 0 ? `${aEarned.toFixed(1)}/${aMax}` : '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-bold text-foreground font-mono">{studentMax > 0 ? `${studentPoints.toFixed(1)} / ${studentMax}` : 'N/A'}</p>
                        {studentMax > 0 && <ScoreBar score={studentPoints} max={studentMax} />}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aggregate Score Panel */}
      {students.length > 0 && (
        <div className="border border-border rounded-xl bg-secondary/10 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Class Overall Performance
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Average points earned across all students.</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              {students.length > 0 ? (globalScoreEarned / students.length).toFixed(1) : 0} 
              <span className="text-sm text-muted-foreground font-medium"> / {students.length > 0 ? (globalScoreMax / students.length).toFixed(1) : 0}</span>
            </p>
            <div className="w-32 ml-auto">
              <ScoreBar score={globalScoreEarned} max={globalScoreMax} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
