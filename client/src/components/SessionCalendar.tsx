'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Clock, Video, Calendar } from 'lucide-react';

interface Session {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  liveLink?: string;
  zoomPassword?: string;
  recordedVideo?: string;
  courseId?: { _id: string; name: string } | string;
  facultyId?: { name: string; email: string } | null;
}

interface SessionCalendarProps {
  sessions: Session[];
  /** If true show a "Join" button; if false show "Watch Recording" for past */
  showJoinButton?: boolean;
  title?: string;
  subtitle?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function SessionCalendar({ sessions, showJoinButton = true, title = 'Session Calendar', subtitle = 'Click on a highlighted day to see scheduled sessions' }: SessionCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0-6
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    while (days.length < totalCells) days.push(null);
    return days;
  }, [year, month, firstDayOfMonth, daysInMonth, totalCells]);

  // Map sessions to dates
  const sessionsByDate = useMemo(() => {
    const map: Record<string, Session[]> = {};
    sessions.forEach((s) => {
      const d = new Date(s.startTime);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [sessions]);

  function getDaySessions(day: Date): Session[] {
    const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
    return sessionsByDate[key] || [];
  }

  const selectedSessions = selectedDay ? getDaySessions(selectedDay) : [];

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  }

  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  }

  function goToToday() {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(today);
  }

  // Count sessions this month
  const sessionsThisMonth = sessions.filter((s) => {
    const d = new Date(s.startTime);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const upcomingSessions = sessions
    .filter(s => new Date(s.startTime) >= today)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Calendar Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              {MONTHS[month]} {year}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {sessionsThisMonth.length} session{sessionsThisMonth.length !== 1 ? 's' : ''} scheduled this month
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={goToToday}
              className="rounded-md border border-border bg-card px-2.5 py-1 text-[10px] font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer mr-1"
            >
              Today
            </button>
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-md hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-md hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="h-12 border-b border-r border-border/40 last:border-r-0" />;
            }

            const daySessions = getDaySessions(day);
            const hasSession = daySessions.length > 0;
            const isToday = isSameDay(day, today);
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
            const hasUpcoming = daySessions.some(s => new Date(s.startTime) >= today);
            const isPast = day < today && !isToday;

            return (
              <button
                key={idx}
                onClick={() => {
                  if (hasSession) setSelectedDay(isSelected ? null : day);
                }}
                className={`relative h-12 border-b border-r border-border/40 last:border-r-0 flex flex-col items-center justify-center gap-0.5 transition-all
                  ${hasSession ? 'cursor-pointer hover:bg-primary/5' : 'cursor-default'}
                  ${isSelected ? 'bg-primary/10 ring-1 ring-inset ring-primary/40' : ''}
                  ${isToday && !isSelected ? 'bg-primary/5' : ''}
                  ${isPast ? 'opacity-50' : ''}
                `}
              >
                <span className={`text-xs font-semibold leading-none transition-colors
                  ${isToday ? 'text-primary' : 'text-foreground'}
                  ${isSelected ? 'text-primary' : ''}
                `}>
                  {day.getDate()}
                </span>
                {hasSession && (
                  <div className="flex gap-0.5">
                    {daySessions.slice(0, 3).map((_, i) => (
                      <span
                        key={i}
                        className={`h-1 w-1 rounded-full ${hasUpcoming ? 'bg-emerald-500' : 'bg-muted-foreground'}`}
                      />
                    ))}
                  </div>
                )}
                {isToday && (
                  <span className="absolute top-1 right-1 h-1 w-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="px-5 py-2 border-t border-border/50 flex items-center gap-4 bg-secondary/5">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Upcoming
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Past
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Today
          </div>
        </div>
      </div>

      {/* Selected day sessions */}
      {selectedDay && (
        <div className="bg-card border border-primary/30 rounded-xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="px-5 py-3 border-b border-border bg-primary/5">
            <h4 className="text-xs font-bold text-foreground">
              Sessions on {selectedDay.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">{selectedSessions.length} session(s)</p>
          </div>
          <div className="divide-y divide-border">
            {selectedSessions.map((sess) => {
              const start = new Date(sess.startTime);
              const end = new Date(sess.endTime);
              const isUpcoming = end > today;
              const courseName = typeof sess.courseId === 'object' && sess.courseId?.name
                ? sess.courseId.name : null;

              return (
                <div key={sess._id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isUpcoming ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" /> Live Soon
                        </span>
                      ) : (
                        <span className="bg-secondary border border-border text-muted-foreground rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                          Concluded
                        </span>
                      )}
                      {courseName && (
                        <span className="text-[10px] text-primary font-medium">{courseName}</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-foreground">{sess.title}</p>
                    {sess.description && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{sess.description}</p>
                    )}
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(start)} – {formatTime(end)}
                    </div>
                    {sess.facultyId && typeof sess.facultyId === 'object' && (
                      <p className="text-[10px] text-muted-foreground">
                        By: <span className="font-semibold text-foreground">{sess.facultyId.name}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {isUpcoming ? (
                      sess.liveLink ? (
                      <a
                        href={sess.liveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Join Live <ExternalLink className="h-3 w-3" />
                      </a>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">No link</span>
                      )
                    ) : sess.recordedVideo ? (
                      <a
                        href={sess.recordedVideo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                      >
                        <Video className="h-3.5 w-3.5 text-muted-foreground" /> Watch Recording
                      </a>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">No recording</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No sessions this month nudge */}
      {sessionsThisMonth.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <Calendar className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs font-semibold text-foreground">No Sessions This Month</p>
          <p className="text-[10px] text-muted-foreground mt-1">Navigate to other months to see scheduled sessions.</p>
        </div>
      )}

      {/* Upcoming 3 sessions sidebar */}
      {upcomingSessions.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Next {upcomingSessions.length} Upcoming Session{upcomingSessions.length !== 1 ? 's' : ''}
            </h4>
          </div>
          <div className="divide-y divide-border">
            {upcomingSessions.map((sess) => {
              const start = new Date(sess.startTime);
              const courseName = typeof sess.courseId === 'object' && sess.courseId?.name
                ? sess.courseId.name : null;
              return (
                <div key={sess._id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-foreground truncate">{sess.title}</p>
                    {courseName && <p className="text-[9px] text-primary truncate">{courseName}</p>}
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {formatTime(start)}
                    </p>
                  </div>
                  <a
                    href={sess.liveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 rounded bg-primary/10 border border-primary/20 px-2 py-1 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors"
                  >
                    Join <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
