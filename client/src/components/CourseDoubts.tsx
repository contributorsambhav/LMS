import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useUser } from "../lib/session";
import { Plus, Send, CheckCircle2, MessageSquare, Info } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface DoubtThread {
  _id: string;
  courseId: string;
  studentId: User;
  facultyId?: User;
  assignedTo?: User;
  status: "open" | "resolved";
  resolvedByName?: string;
  subject: string;
  updatedAt: string;
  createdAt: string;
}

interface Message {
  _id: string;
  threadId: string;
  senderId: User;
  text: string;
  createdAt: string;
}

// Use Next.js proxy to avoid mixed content errors
const DOUBT_SERVICE_URL = "/doubt-proxy";

export default function CourseDoubts({ courseId }: { courseId: string }) {
  const session = useUser();
  const [threads, setThreads] = useState<DoubtThread[]>([]);
  const [activeThread, setActiveThread] = useState<DoubtThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [socket, setSocket] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStudent = session?.role === "student";

  // Fetch all threads
  const fetchThreads = async () => {
    if (!session?.token) return;
    try {
      const res = await fetch(`${DOUBT_SERVICE_URL}/api/doubts/course/${courseId}`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (res.ok) {
        setThreads(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch messages for active thread
  const fetchMessages = async (threadId: string) => {
    if (!session?.token) return;
    try {
      const res = await fetch(`${DOUBT_SERVICE_URL}/api/doubts/${threadId}/messages`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [courseId, session]);

  // Setup Socket.io
  useEffect(() => {
    if (!session?.token) return;

    const newSocket = io(window.location.origin, {
      path: "/doubt-proxy/socket.io",
      auth: { token: session.token }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [session]);

  // Handle joining room and socket events when active thread changes
  useEffect(() => {
    if (!socket || !activeThread) return;

    socket.emit("joinThread", activeThread._id);

    const messageHandler = (newMessage: Message) => {
      if (newMessage.threadId === activeThread._id) {
        setMessages((prev) => [...prev, newMessage]);
        fetchThreads(); // to update 'updatedAt' sorting
      }
    };

    const assignmentHandler = (updatedThread: DoubtThread) => {
      if (updatedThread._id === activeThread._id) {
        setActiveThread(updatedThread);
        setThreads((prev) => prev.map((t) => (t._id === updatedThread._id ? updatedThread : t)));
      }
    };

    socket.on("newMessage", messageHandler);
    socket.on("doubtAssigned", assignmentHandler);

    return () => {
      socket.emit("leaveThread", activeThread._id);
      socket.off("newMessage", messageHandler);
      socket.off("doubtAssigned", assignmentHandler);
    };
  }, [socket, activeThread]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token || !newSubject.trim()) return;

    try {
      const res = await fetch(`${DOUBT_SERVICE_URL}/api/doubts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({ courseId, subject: newSubject })
      });
      if (res.ok) {
        const thread = await res.json();
        setThreads([thread, ...threads]);
        setShowNewThread(false);
        setNewSubject("");
        setActiveThread(thread);
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token || !activeThread || !inputText.trim()) return;

    const textToSend = inputText;
    setInputText("");

    try {
      const res = await fetch(`${DOUBT_SERVICE_URL}/api/doubts/${activeThread._id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({ text: textToSend })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignThread = async () => {
    if (!session?.token || !activeThread) return;

    try {
      const res = await fetch(`${DOUBT_SERVICE_URL}/api/doubts/${activeThread._id}/assign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`
        }
      });
      if (res.ok) {
        const updated = await res.json();
        setThreads(threads.map(t => t._id === updated._id ? updated : t));
        setActiveThread(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveThread = async () => {
    if (!session?.token || !activeThread) return;

    try {
      const res = await fetch(`${DOUBT_SERVICE_URL}/api/doubts/${activeThread._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({ status: "resolved", resolvedByName: session.name })
      });
      if (res.ok) {
        const updated = await res.json();
        setThreads(threads.map(t => t._id === updated._id ? updated : t));
        setActiveThread(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-[600px] border border-border rounded-xl bg-card overflow-hidden">
      {/* LEFT SIDEBAR: Threads */}
      <div className="w-1/3 border-r border-border flex flex-col bg-secondary/5">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-foreground">Doubt Threads</h3>
          {isStudent && (
            <button
              onClick={() => setShowNewThread(true)}
              className="p-1.5 bg-primary/10 text-primary rounded hover:bg-primary/20 transition"
              title="New Doubt"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {threads.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center p-4">No doubts raised yet.</p>
          ) : (
            threads.map((thread) => (
              <div
                key={thread._id}
                onClick={() => {
                  setActiveThread(thread);
                  setShowNewThread(false);
                  fetchMessages(thread._id);
                }}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  activeThread?._id === thread._id ? 'bg-primary/10 border-primary border' : 'bg-card border border-border hover:bg-secondary/10'
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h4 className="text-xs font-bold text-foreground line-clamp-1">{thread.subject}</h4>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    thread.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {thread.status}
                  </span>
                </div>
                {!isStudent && (
                  <p className="text-[10px] text-muted-foreground">From: {thread.studentId?.name}</p>
                )}
                <p className="text-[9px] text-muted-foreground mt-1 text-right">
                  {thread.status === 'resolved' && thread.resolvedByName && (
                    <span className="text-emerald-500/70 mr-1">Resolved by {thread.resolvedByName} • </span>
                  )}
                  {new Date(thread.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Chat Area */}
      <div className="w-2/3 flex flex-col bg-background relative">
        {showNewThread ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-200">
            <MessageSquare className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">Raise a New Doubt</h2>
            <p className="text-xs text-muted-foreground mb-6">Ask your instructor a question regarding this course material.</p>
            <form onSubmit={handleCreateThread} className="w-full max-w-sm space-y-4">
              <input
                type="text"
                placeholder="What is your doubt about?"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full border border-border rounded bg-secondary/10 px-4 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewThread(false)}
                  className="px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary/10 rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/95 transition shadow-sm"
                >
                  Create Thread
                </button>
              </div>
            </form>
          </div>
        ) : activeThread ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card flex justify-between items-center z-10 shadow-sm">
              <div>
                <h3 className="font-bold text-foreground text-sm">{activeThread.subject}</h3>
                <p className="text-[10px] text-muted-foreground">
                  {isStudent ? (activeThread.assignedTo ? `Assigned to: ${activeThread.assignedTo.name}` : 'Awaiting Faculty Assignment') : `Student: ${activeThread.studentId?.name}`}
                </p>
                {!isStudent && activeThread.assignedTo && (
                  <p className="text-[10px] text-primary font-semibold">Assigned to: {activeThread.assignedTo.name}</p>
                )}
              </div>
              <div className="flex gap-2">
                {activeThread.status === 'open' && !isStudent && !activeThread.assignedTo && (
                  <button
                    onClick={handleAssignThread}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-semibold rounded transition"
                  >
                    Assign to Me
                  </button>
                )}
                {activeThread.status === 'open' && (activeThread.assignedTo || !isStudent) && (
                  <button
                    onClick={handleResolveThread}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-muted-foreground text-[10px] font-semibold rounded transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                  </button>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/5">
              {messages.map((msg) => {
                const isMe = msg.senderId._id === session?.id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
                      isMe 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-card border border-border text-foreground rounded-tl-sm'
                    }`}>
                      {!isMe && (
                        <p className="text-[9px] font-bold opacity-70 mb-1">{msg.senderId.name} ({msg.senderId.role})</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      <p className={`text-[9px] text-right mt-1 opacity-70`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            {activeThread.status === 'open' ? (
              <div className="p-4 bg-card border-t border-border">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-secondary/10 border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-4 bg-secondary/10 border-t border-border text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Info className="w-4 h-4" /> This doubt thread was resolved {activeThread.resolvedByName ? `by ${activeThread.resolvedByName}` : 'and closed'}.
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h4 className="text-sm font-semibold text-foreground">No Thread Selected</h4>
            <p className="text-xs text-muted-foreground">Select a doubt thread from the sidebar or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
