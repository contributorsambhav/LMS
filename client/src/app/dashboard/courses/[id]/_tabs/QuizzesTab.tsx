import React from 'react';
import { Plus, FileQuestion, Clock, FileText, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';

interface QuizzesTabProps {
  quizzes: any;
  isAdmin: any;
  isFaculty: any;
  isStudent: any;
  selectedQuiz: any;
  setSelectedQuiz: any;
  quizAttempts: any;
  quizAttemptsLoading: any;
  quizAttemptsError: any;
  fetchQuizAttempts: any;
  studentCourseProgress: any;
  setShowAddQuizModal: any;
  setQuizQuestions: any;
  setQuizTitle: any;
  setQuizDesc: any;
  setQuizTimeLimit: any;
  handleOpenEditQuiz: any;
  handleDeleteQuiz: any;
  setShowTakeQuizModal: any;
  setShowViewAttemptsModal: any;
  setShowGradeAttemptModal: any;
  setSelectedAttempt: any;
  handleStartQuizAttempt: any;
  setQuizAnswers: any;
  setQuizTimeRemaining: any;
  setGradeQuizScore: any;
  setGradeQuizFeedback: any;
  setSubjectiveGrades: any;
  handleSubmitQuizAttempt: any;
}

export default function QuizzesTab(props: QuizzesTabProps) {
  const {
    quizzes,
    isAdmin,
    isFaculty,
    isStudent,
    selectedQuiz,
    setSelectedQuiz,
    quizAttempts,
    quizAttemptsLoading,
    quizAttemptsError,
    fetchQuizAttempts,
    studentCourseProgress,
    setShowAddQuizModal,
    setQuizQuestions,
    setQuizTitle,
    setQuizDesc,
    setQuizTimeLimit,
    handleOpenEditQuiz,
    handleDeleteQuiz,
    setShowTakeQuizModal,
    setShowViewAttemptsModal,
    setShowGradeAttemptModal,
    setSelectedAttempt,
    handleStartQuizAttempt,
    setQuizAnswers,
    setQuizTimeRemaining,
    setGradeQuizScore,
    setGradeQuizFeedback,
    setSubjectiveGrades,
    handleSubmitQuizAttempt,
  } = props;

  return (
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
                  {quizzes.map((quiz: any) => {
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
                        
                        {isStudent && (
                          <div className="mt-2 pt-2 border-t border-border/50 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              Policy: {quiz.scoringPolicy === 'best' ? 'Best Attempt' : quiz.scoringPolicy === 'average' ? 'Average' : 'Latest'}
                            </span>
                            {(() => {
                              if (!studentCourseProgress?.attempts) return null;
                              const quizAttemptsList = studentCourseProgress.attempts.filter((a: any) => 
                                (a.quizId?._id || a.quizId)?.toString() === quiz._id.toString()
                              );
                              if (!quizAttemptsList.length) {
                                return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-muted-foreground">Not Attempted</span>;
                              }
                              
                              let effectiveAttempt = null;
                              let effectiveScore = 0;
                              if (quiz.scoringPolicy === 'best') {
                                effectiveAttempt = quizAttemptsList.reduce((prev: any, curr: any) => (prev.score > curr.score) ? prev : curr, quizAttemptsList[0]);
                                effectiveScore = effectiveAttempt.score;
                              } else if (quiz.scoringPolicy === 'average') {
                                effectiveAttempt = quizAttemptsList[quizAttemptsList.length - 1];
                                effectiveScore = parseFloat((quizAttemptsList.reduce((acc: number, curr: any) => acc + curr.score, 0) / quizAttemptsList.length).toFixed(1));
                              } else {
                                effectiveAttempt = quizAttemptsList[quizAttemptsList.length - 1];
                                effectiveScore = effectiveAttempt.score;
                              }
                              
                              const quizMaxScore = quiz.questions?.reduce((acc: number, q: any) => acc + (q.points || 1), 0) || 0;
                              return (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  effectiveAttempt.graded ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                }`}>
                                  {effectiveAttempt.graded ? `Score: ${effectiveScore} / ${quizMaxScore}` : 'Pending Grade'}
                                </span>
                              );
                            })()}
                          </div>
                        )}
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
                              {quizAttempts.length > 0 && quizAttempts.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).map((attempt: any, attemptIndex: number) => {
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

                                    {attempt.gradedBy && (
                                      <p className="text-[10px] text-muted-foreground">
                                        <strong className="text-foreground">Graded by:</strong> {attempt.gradedBy.name}
                                      </p>
                                    )}
                                    {attempt.feedback && (
                                      <div className="text-[11px] text-muted-foreground bg-card border border-border rounded p-2.5 mt-2">
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

                          {/* Quiz Analytics (Faculty View) */}
                          <div className="space-y-3 mt-6">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quiz Analytics</h5>
                            <div className="grid grid-cols-3 gap-4 border border-border rounded-lg bg-card p-4">
                              <div className="text-center">
                                <p className="text-xl font-bold text-foreground">{quizAttempts.length}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Attempts</p>
                              </div>
                              <div className="text-center border-l border-border pl-4">
                                <p className="text-xl font-bold text-foreground">
                                  {quizAttempts.length > 0 ? (quizAttempts.reduce((acc: any, att: any) => acc + att.score, 0) / quizAttempts.length).toFixed(1) : 0}
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Average Score</p>
                              </div>
                              <div className="text-center border-l border-border pl-4">
                                <p className="text-xl font-bold text-foreground">
                                  {quizAttempts.length > 0 ? Math.max(...quizAttempts.map((att: any) => att.score)) : 0}
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Highest Score</p>
                              </div>
                            </div>
                          </div>

                          {/* Student Attempts */}
                          <div className="space-y-3 mt-6">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Student Submissions</h5>
                            {quizAttemptsLoading ? (
                              <p className="text-xs text-muted-foreground">Loading attempts...</p>
                            ) : quizAttempts.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic">No student has attempted this quiz yet.</p>
                            ) : (
                              <div className="border border-border rounded-lg overflow-hidden divide-y divide-border bg-card">
                                {quizAttempts.map((attempt: any) => {
                                  const quizMaxScore = selectedQuiz.questions?.reduce((acc: number, q: any) => acc + (q.points || 1), 0) || 0;
                                  return (
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
                                          {attempt.graded ? `Score: ${attempt.score} / ${quizMaxScore}` : 'Pending Grading'}
                                        </span>
                                        {attempt.graded && attempt.gradedBy && (
                                          <span className="text-[9px] text-muted-foreground text-right w-16">
                                            by {attempt.gradedBy.name}
                                          </span>
                                        )}
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
                                  );
                                })}
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
        
  );
}
