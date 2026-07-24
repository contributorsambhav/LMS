import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../lib/api';
import { useUser } from '../lib/session';
import { CheckCircle2, Clock, XCircle, FileText, HelpCircle, TrendingUp } from 'lucide-react';

interface StudentProgressProps {
  courseId: string;
}

export default function StudentProgress({ courseId }: StudentProgressProps) {
  const session = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!session?.token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/progress`, {
          headers: { Authorization: `Bearer ${session.token}` }
        });
        if (!res.ok) {
          throw new Error('Failed to fetch progress');
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Error fetching progress');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [courseId, session]);

  if (loading) {
    return <div className="text-center py-12 text-sm text-muted-foreground animate-pulse">Loading your progress...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-sm text-destructive">{error}</div>;
  }

  if (!data) return null;

  const { assignments = [], quizzes = [], submissions = [], attempts = [] } = data;

  // Helper to render score bars
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

  let totalScoreEarned = 0;
  let totalScoreMax = 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assignments Progress */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="border-b border-border bg-secondary/30 p-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Assignment Submissions
            </h3>
          </div>
          <div className="divide-y divide-border">
            {assignments.length === 0 ? (
              <p className="p-6 text-xs text-center text-muted-foreground italic">No assignments available in this course.</p>
            ) : (
              assignments.map((assignment: any) => {
                const submission = submissions.find((s: any) => 
                  (s.assignmentId?._id || s.assignmentId)?.toString() === assignment._id.toString()
                );
                if (submission && submission.graded) {
                  totalScoreEarned += (submission.grade || 0);
                  totalScoreMax += assignment.totalMarks;
                }
                
                return (
                  <div key={assignment._id} className="p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-foreground line-clamp-1">{assignment.title}</p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">Max: {assignment.totalMarks} pts</span>
                    </div>
                    {submission ? (
                      <div className="flex flex-col mt-1">
                        <div className="flex items-center justify-between">
                          {submission.graded ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" /> Graded: {submission.grade}/{assignment.totalMarks}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              <Clock className="h-3 w-3" /> Submitted (Pending)
                            </span>
                          )}
                          <span className="text-[9px] text-muted-foreground ml-auto">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {submission.graded && <ScoreBar score={submission.grade || 0} max={assignment.totalMarks} />}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                          <XCircle className="h-3 w-3" /> Not Submitted
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quizzes Progress */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="border-b border-border bg-secondary/30 p-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" /> Quiz Attempts
            </h3>
          </div>
          <div className="divide-y divide-border">
            {quizzes.length === 0 ? (
              <p className="p-6 text-xs text-center text-muted-foreground italic">No quizzes available in this course.</p>
            ) : (
              quizzes.map((quiz: any) => {
                const quizMaxScore = quiz.questions?.reduce((acc: number, q: any) => acc + (q.points || 1), 0) || 0;
                const quizAttemptsList = attempts.filter((a: any) => 
                  (a.quizId?._id || a.quizId)?.toString() === quiz._id.toString()
                );
                
                let effectiveAttempt = null;
                let effectiveScore = 0;

                if (quizAttemptsList.length > 0) {
                  if (quiz.scoringPolicy === 'best') {
                    effectiveAttempt = quizAttemptsList.reduce((prev: any, curr: any) => (prev.score > curr.score) ? prev : curr, quizAttemptsList[0]);
                    effectiveScore = effectiveAttempt.score;
                  } else if (quiz.scoringPolicy === 'average') {
                    effectiveAttempt = quizAttemptsList[quizAttemptsList.length - 1]; // Just for status/date
                    effectiveScore = parseFloat((quizAttemptsList.reduce((acc: number, curr: any) => acc + curr.score, 0) / quizAttemptsList.length).toFixed(1));
                  } else {
                    // Latest by default
                    effectiveAttempt = quizAttemptsList[quizAttemptsList.length - 1];
                    effectiveScore = effectiveAttempt.score;
                  }
                }

                if (effectiveAttempt && effectiveAttempt.graded) {
                  totalScoreEarned += effectiveScore;
                  totalScoreMax += quizMaxScore;
                }

                return (
                  <div key={quiz._id} className="p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-foreground line-clamp-1">{quiz.title}</p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {quizAttemptsList.length} / {quiz.maxAttempts || 1} attempts
                      </span>
                    </div>
                    {effectiveAttempt ? (
                      <div className="flex flex-col mt-1">
                        <div className="flex items-center justify-between">
                          {effectiveAttempt.graded ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" /> 
                              {quiz.scoringPolicy === 'best' ? 'Best' : quiz.scoringPolicy === 'average' ? 'Avg' : 'Latest'} Score: {effectiveScore}/{quizMaxScore}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              <Clock className="h-3 w-3" /> Pending Grade
                            </span>
                          )}
                          <span className="text-[9px] text-muted-foreground ml-auto">
                            {new Date(effectiveAttempt.submittedAt || effectiveAttempt.startedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {effectiveAttempt.graded && <ScoreBar score={effectiveScore} max={quizMaxScore} />}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                          <XCircle className="h-3 w-3" /> Not Attempted
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Aggregate Score Panel */}
      <div className="border border-border rounded-xl bg-secondary/10 p-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Aggregate Course Performance
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Total points earned across all graded assignments and quizzes.</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{totalScoreEarned} <span className="text-sm text-muted-foreground font-medium">/ {totalScoreMax}</span></p>
          <div className="w-32 ml-auto">
            <ScoreBar score={totalScoreEarned} max={totalScoreMax} />
          </div>
        </div>
      </div>

    </div>
  );
}
