import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { DoubtThread } from "../models/DoubtThread";
import { Message } from "../models/Message";
import { Course } from "../models/Course";
import { Enrollment } from "../models/Enrollment";

// Create a new Doubt Thread (Student only)
export const createDoubtThread = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId, subject } = req.body;
    const studentId = req.user?.id;

    if (!courseId || !subject) {
      return res.status(400).json({ message: "Course ID and Subject are required." });
    }

    const thread = new DoubtThread({
      courseId,
      studentId,
      subject,
      status: "open"
    });

    await thread.save();

    const populatedThread = await thread.populate("studentId", "name email");

    return res.status(201).json(populatedThread);
  } catch (error: any) {
    console.error("Error creating doubt thread:", error);
    return res.status(500).json({ message: "Failed to create doubt thread.", error: error.message });
  }
};

// Fetch Doubt Threads for a Course
export const getDoubtThreads = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required." });
    }

    let query: any = { courseId };

    if (role === "Student") {
      query.studentId = userId;
    }

    const threads = await DoubtThread.find(query)
      .populate("studentId", "name email")
      .populate("facultyId", "name email")
      .sort({ updatedAt: -1 });

    return res.status(200).json(threads);
  } catch (error: any) {
    console.error("Error fetching doubt threads:", error);
    return res.status(500).json({ message: "Failed to fetch doubt threads.", error: error.message });
  }
};

// Fetch Historical Messages for a Thread
export const getThreadMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { threadId } = req.params;

    if (!threadId) {
      return res.status(400).json({ message: "Thread ID is required." });
    }

    const messages = await Message.find({ threadId })
      .populate("senderId", "name email role")
      .sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ message: "Failed to fetch messages.", error: error.message });
  }
};

// Post a Message to a Thread
export const postMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { threadId } = req.params;
    const { text } = req.body;
    const senderId = req.user?.id;

    if (!text || !threadId) {
      return res.status(400).json({ message: "Thread ID and text are required." });
    }

    const thread = await DoubtThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: "Doubt thread not found." });
    }

    // Assign faculty to thread if a faculty replies to an unassigned thread
    if (req.user?.role === "Faculty" && !thread.facultyId) {
      thread.facultyId = senderId as any;
      await thread.save();
    }

    const message = new Message({
      threadId,
      senderId,
      text,
      readBy: [senderId]
    });

    await message.save();
    
    // Update thread updatedAt for sorting
    thread.updatedAt = new Date();
    await thread.save();

    const populatedMessage = await message.populate("senderId", "name email role");

    // Emit to socket room
    if ((req as any).io) {
      (req as any).io.to(`thread_${threadId}`).emit("newMessage", populatedMessage);
    }

    return res.status(201).json(populatedMessage);
  } catch (error: any) {
    console.error("Error posting message:", error);
    return res.status(500).json({ message: "Failed to post message.", error: error.message });
  }
};

// Update Thread Status (e.g. mark resolved)
export const updateThreadStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { threadId } = req.params;
    const { status } = req.body;

    if (!["open", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const thread = await DoubtThread.findByIdAndUpdate(threadId, { status }, { new: true })
      .populate("studentId", "name email")
      .populate("facultyId", "name email");

    if (!thread) {
      return res.status(404).json({ message: "Thread not found." });
    }

    return res.status(200).json(thread);
  } catch (error: any) {
    console.error("Error updating thread status:", error);
    return res.status(500).json({ message: "Failed to update status.", error: error.message });
  }
};
