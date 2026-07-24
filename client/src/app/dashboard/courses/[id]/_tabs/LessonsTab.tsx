import React, { useState } from 'react';
import { Play, Plus, Video, Trash2, Clock } from 'lucide-react';
import VideoPlayer from '../../../../../components/VideoPlayer';
import { API_BASE_URL } from '../../../../../lib/api';

interface LessonsTabProps {
  lessons: any[];
  isAdmin: boolean;
  isFaculty: boolean;
  isStudent: boolean;
  setShowAddLessonModal: (show: boolean) => void;
  handleDeleteLesson: (lessonId: string) => void;
  handleUpdateProgress: (lessonId: string, currentTime: number, percentage: number) => void;
}

export default function LessonsTab({
  lessons,
  isAdmin,
  isFaculty,
  isStudent,
  setShowAddLessonModal,
  handleDeleteLesson,
  handleUpdateProgress
}: LessonsTabProps) {
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Recorded Lessons & Lectures</h3>
          <p className="text-xs text-muted-foreground">Self-paced video materials and watch history.</p>
        </div>
        {(isAdmin || isFaculty) && (
          <button
            onClick={() => setShowAddLessonModal(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Lesson
          </button>
        )}
      </div>

      {lessons.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Video className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
          <h4 className="text-xs font-semibold text-foreground mb-1">No Recorded Lessons</h4>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            {isAdmin || isFaculty 
              ? "Add recorded video lectures here to start structured student learning." 
              : "No recorded video lectures are currently available for this course."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side: Playlist / Lesson list */}
          <div className="lg:col-span-1 space-y-3">
            <div className="border border-border rounded-xl bg-card overflow-hidden">
              <div className="border-b border-border p-4 bg-secondary/25">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Course Syllabus</h4>
              </div>
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {lessons.map((lesson, index) => {
                  const isSelected = selectedLesson?._id === lesson._id;
                  const hasProgress = lesson.progress;
                  const pct = hasProgress ? Math.round(lesson.progress.watchPercentage) : 0;
                  const isCompleted = hasProgress ? lesson.progress.completed : false;

                  return (
                    <div
                      key={lesson._id}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`p-4 flex flex-col gap-2 cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-secondary/15'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-muted-foreground font-mono">#{index + 1}</span>
                        <div className="flex-1">
                          <h5 className="text-xs font-semibold text-foreground line-clamp-1">{lesson.title}</h5>
                          <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{lesson.description || 'No description provided.'}</p>
                        </div>
                        {(isAdmin || isFaculty) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLesson(lesson._id);
                            }}
                            className="p-1 hover:bg-secondary rounded text-destructive transition-colors cursor-pointer"
                            title="Delete Lesson"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {lesson.duration || 0} mins
                        </span>
                        {isStudent && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            isCompleted 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                              : pct > 0 
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                                : 'bg-secondary text-muted-foreground'
                          }`}>
                            {isCompleted ? 'Completed' : pct > 0 ? `${pct}% watched` : 'Not watched'}
                          </span>
                        )}
                      </div>
                      {isStudent && pct > 0 && !isCompleted && (
                        <div className="w-full bg-secondary h-1 rounded-full overflow-hidden mt-1">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side: Video Player & Details */}
          <div className="lg:col-span-2 space-y-4">
            {selectedLesson ? (
              <div className="border border-border rounded-xl bg-card p-6 space-y-4">
                <div>
                  <h4 className="text-base font-bold text-foreground">{selectedLesson.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{selectedLesson.description}</p>
                </div>

                {selectedLesson.videoUrl ? (
                  <div className="mt-4">
                    <VideoPlayer
                      src={`${API_BASE_URL}${selectedLesson.videoUrl}`}
                      lessonId={selectedLesson._id}
                      initialTime={selectedLesson.progress?.lastWatchedTimestamp || 0}
                      onProgressUpdate={(lessonId: string, currentTime: number, percentage: number) => handleUpdateProgress(lessonId, currentTime, percentage)}
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-secondary/20 p-12 text-center">
                    <Video className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <h4 className="text-xs font-semibold text-foreground">No Video Attached</h4>
                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">This lesson has no lecture video uploaded.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-border border-dashed rounded-xl bg-secondary/5 p-16 text-center flex flex-col justify-center items-center h-full min-h-[300px]">
                <Play className="h-10 w-10 text-muted-foreground/45 mb-4 stroke-1 animate-pulse" />
                <h4 className="text-xs font-bold text-foreground">Select a lesson to start learning</h4>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">Choose a recorded lecture from the course syllabus on the left.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
