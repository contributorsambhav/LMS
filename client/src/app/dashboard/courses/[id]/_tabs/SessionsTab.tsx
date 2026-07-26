import React, { useState } from 'react';
import { LayoutList, Calendar, Plus, Clock, FileText, ExternalLink, Video } from 'lucide-react';
import SessionCalendar from '../../../../../components/SessionCalendar';
import { API_BASE_URL } from '../../../../../lib/api';

interface SessionsTabProps {
  sessions: any[];
  isAdmin: boolean;
  isFaculty: boolean;
  setShowAddSessionModal: (show: boolean) => void;
  setSessionStart: (start: string) => void;
  setSessionEnd: (end: string) => void;
}

export default function SessionsTab({
  sessions,
  isAdmin,
  isFaculty,
  setShowAddSessionModal,
  setSessionStart,
  setSessionEnd
}: SessionsTabProps) {
  const [sessionView, setSessionView] = useState<'list' | 'calendar'>('list');

  return (
    <div className="space-y-6">
      
      {/* Header + Add button */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Lecture Calendar</h3>
          <p className="text-xs text-muted-foreground">List of upcoming and past classroom lectures.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-secondary/30 border border-border rounded-md p-0.5">
            <button
              onClick={() => setSessionView('list')}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-[10px] font-semibold transition-colors cursor-pointer ${
                sessionView === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutList className="h-3 w-3" /> List
            </button>
            <button
              onClick={() => setSessionView('calendar')}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-[10px] font-semibold transition-colors cursor-pointer ${
                sessionView === 'calendar' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calendar className="h-3 w-3" /> Calendar
            </button>
          </div>
          {(isAdmin || isFaculty) && (
            <button 
              onClick={() => {
                const now = new Date();
                setSessionStart(now.toISOString().slice(0, 16));
                setSessionEnd(new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16));
                setShowAddSessionModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Schedule Session
            </button>
          )}
        </div>
      </div>

      {/* Sessions view */}
      {sessionView === 'calendar' ? (
        <SessionCalendar sessions={sessions} showJoinButton={true} />
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h4 className="text-xs font-semibold text-foreground mb-1">No Lectures Scheduled</h4>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            {isAdmin || isFaculty 
              ? "Schedule your first interactive classroom lecture to share attachments, zoom links, and materials." 
              : "No lectures have been scheduled for this curriculum yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((sess) => {
            const start = new Date(sess.startTime);
            const end = new Date(sess.endTime);
            const isUpcoming = end > new Date();
            
            return (
              <div key={sess._id} className={`bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row justify-between gap-6 hover:shadow-sm transition-all ${isUpcoming ? 'ring-1 ring-primary/20 border-primary/30' : 'opacity-85'}`}>
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isUpcoming ? (
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Upcoming
                      </span>
                    ) : (
                      <span className="bg-secondary border border-border text-muted-foreground rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        Concluded
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-foreground">{sess.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{sess.description}</p>
                  </div>

                  {/* Faculty assigned display */}
                  {sess.facultyId && (
                    <p className="text-[10px] text-muted-foreground font-medium">
                      Conducted by: <span className="text-foreground font-semibold">{sess.facultyId.name}</span> ({sess.facultyId.email})
                    </p>
                  )}

                  {/* Attachments */}
                  {sess.attachments && sess.attachments.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Class Materials & PDF attachments:</p>
                      <div className="flex flex-wrap gap-2">
                        {sess.attachments.map((fileUrl: string, idx: number) => {
                          const filename = fileUrl.split('/').pop() || `Attachment-${idx + 1}`;
                          return (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.preventDefault();
                                const url = fileUrl.startsWith('http') ? fileUrl : `${API_BASE_URL}${fileUrl}`;
                                if (url.toLowerCase().endsWith('.pdf')) {
                                  window.open(`/pdf-viewer?url=${encodeURIComponent(url)}&title=${encodeURIComponent(filename.slice(14) || filename)}`, '_blank');
                                } else {
                                  window.open(url, '_blank', 'noopener,noreferrer');
                                }
                              }}
                              className="inline-flex items-center gap-1.5 rounded border border-border bg-secondary/20 hover:bg-secondary px-2.5 py-1 text-[11px] text-foreground transition-colors cursor-pointer"
                            >
                              <FileText className="h-3 w-3 text-red-500" />
                              <span>{filename.slice(14) || filename}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col justify-end items-end gap-3.5 border-t md:border-t-0 pt-4 md:pt-0 border-border">
                  <a
                    href={sess.liveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all w-full md:w-auto text-center justify-center"
                  >
                    Join Zoom Lecture <ExternalLink className="h-3 w-3" />
                  </a>

                  {/* Host Start URL (Faculty/Admin only) */}
                  {(isAdmin || isFaculty) && sess.zoomStartUrl && (
                    <a
                      href={sess.zoomStartUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border border-blue-500/20 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors w-full md:w-auto text-center justify-center"
                    >
                      Start as Host <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {/* Zoom Meeting Password */}
                  {sess.zoomPassword && (
                    <div className="text-[10px] text-muted-foreground font-mono">
                      Passcode: <span className="text-foreground font-semibold">{sess.zoomPassword}</span>
                    </div>
                  )}
                  
                  {sess.recordedVideo && (
                    <a
                      href={sess.recordedVideo}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors w-full md:w-auto text-center justify-center"
                    >
                      <Video className="h-3.5 w-3.5 text-muted-foreground" /> Watch Recording
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
