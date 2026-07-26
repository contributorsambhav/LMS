import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { Lesson } from "../models/Lesson";
import { Course } from "../models/Course";
import { Enrollment } from "../models/Enrollment";
import { Progress } from "../models/Progress";

// 1. Create Lesson (Faculty & Admin only)
export const createLesson = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { title, description, duration, fileUrl, sizeInBytes } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const instituteId = req.user?.instituteId;

    if (!userId || !userRole || !instituteId) {
      return res.status(401).json({ message: "Authentication failed: Missing user details." });
    }

    if (!title) {
      return res.status(400).json({ message: "Lesson title is required." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Authorization check
    if (userRole === "InstituteAdmin") {
      if (course.instituteId.toString() !== instituteId.toString()) {
        return res.status(403).json({ message: "Access denied: Course belongs to another institute." });
      }
    } else if (userRole === "Faculty") {
      const enrollment = await Enrollment.findOne({
        userId,
        courseId,
        role: "Faculty",
        status: "Approved"
      });
      if (!enrollment) {
        return res.status(403).json({ message: "Access denied: You are not an approved Faculty in this course." });
      }
    } else {
      return res.status(403).json({ message: "Access denied: Only Faculty or Admins can add lessons." });
    }

    // Determine order number
    const totalLessons = await Lesson.countDocuments({ courseId });
    const orderNo = totalLessons + 1;

    let videoUrl = fileUrl || "";

    const lesson = new Lesson({
      courseId,
      title,
      description: description || "",
      videoUrl,
      duration: duration ? Number(duration) : 0,
      orderNo
    });

    await lesson.save();

    // Track storage usage
    if (sizeInBytes) {
      const Institute = (await import("../models/Institute")).Institute;
      await Institute.findByIdAndUpdate(instituteId, {
        $inc: { "storageUsage.videoBytes": sizeInBytes }
      });
    }

    return res.status(201).json({
      message: "Lesson added successfully!",
      lesson
    });
  } catch (error: any) {
    console.error("Create lesson error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// 2. Get Lessons (All authenticated course members)
export const getLessons = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const instituteId = req.user?.instituteId;

    if (!userId || !userRole) {
      return res.status(401).json({ message: "Authentication failed: Missing user details." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Auth check
    if (userRole === "InstituteAdmin") {
      if (!instituteId || course.instituteId.toString() !== instituteId.toString()) {
        return res.status(403).json({ message: "Access denied: Course belongs to another institute." });
      }
    } else {
      const enrollment = await Enrollment.findOne({
        userId,
        courseId,
        status: "Approved"
      });
      if (!enrollment) {
        return res.status(403).json({ message: "Access denied: You are not approved in this course." });
      }
    }

    // Fetch lessons ordered by orderNo
    const lessons = await Lesson.find({ courseId }).sort({ orderNo: 1 });

    // If student, enrich lessons with watch progress
    if (userRole === "Student") {
      const progresses = await Progress.find({ userId, courseId });
      const enrichedLessons = lessons.map(lesson => {
        const progress = progresses.find(p => p.lessonId.toString() === lesson._id.toString());
        return {
          ...lesson.toObject(),
          progress: progress ? {
            completed: progress.completed,
            lastWatchedTimestamp: progress.lastWatchedTimestamp,
            watchPercentage: progress.watchPercentage
          } : {
            completed: false,
            lastWatchedTimestamp: 0,
            watchPercentage: 0
          }
        };
      });
      return res.status(200).json(enrichedLessons);
    }

    return res.status(200).json(lessons);
  } catch (error: any) {
    console.error("Get lessons error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// 3. Update Lesson (Faculty & Admin only)
export const updateLesson = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params; // Lesson ID
    const { title, description, duration, orderNo, fileUrl, sizeInBytes } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const instituteId = req.user?.instituteId;

    if (!userId || !userRole || !instituteId) {
      return res.status(401).json({ message: "Authentication failed: Missing user details." });
    }

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found." });
    }

    const course = await Course.findById(lesson.courseId);
    if (!course) {
      return res.status(404).json({ message: "Associated course not found." });
    }

    // Authorization check
    if (userRole === "InstituteAdmin") {
      if (course.instituteId.toString() !== instituteId.toString()) {
        return res.status(403).json({ message: "Access denied." });
      }
    } else if (userRole === "Faculty") {
      const enrollment = await Enrollment.findOne({
        userId,
        courseId: lesson.courseId,
        role: "Faculty",
        status: "Approved"
      });
      if (!enrollment) {
        return res.status(403).json({ message: "Access denied." });
      }
    } else {
      return res.status(403).json({ message: "Access denied." });
    }

    if (title) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    if (duration !== undefined) lesson.duration = Number(duration);
    if (orderNo !== undefined) lesson.orderNo = Number(orderNo);

    if (fileUrl) {
      lesson.videoUrl = fileUrl;
      // Track storage usage if a new file is uploaded
      if (sizeInBytes) {
        const Institute = (await import("../models/Institute")).Institute;
        await Institute.findByIdAndUpdate(instituteId, {
          $inc: { "storageUsage.videoBytes": sizeInBytes }
        });
      }
    }

    await lesson.save();

    return res.status(200).json({
      message: "Lesson updated successfully!",
      lesson
    });
  } catch (error: any) {
    console.error("Update lesson error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// 4. Delete Lesson (Faculty & Admin only)
export const deleteLesson = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params; // Lesson ID
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const instituteId = req.user?.instituteId;

    if (!userId || !userRole || !instituteId) {
      return res.status(401).json({ message: "Authentication failed: Missing user details." });
    }

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found." });
    }

    const course = await Course.findById(lesson.courseId);
    if (!course) {
      return res.status(404).json({ message: "Associated course not found." });
    }

    // Authorization check
    if (userRole === "InstituteAdmin") {
      if (course.instituteId.toString() !== instituteId.toString()) {
        return res.status(403).json({ message: "Access denied." });
      }
    } else if (userRole === "Faculty") {
      const enrollment = await Enrollment.findOne({
        userId,
        courseId: lesson.courseId,
        role: "Faculty",
        status: "Approved"
      });
      if (!enrollment) {
        return res.status(403).json({ message: "Access denied." });
      }
    } else {
      return res.status(403).json({ message: "Access denied." });
    }

    await Lesson.deleteOne({ _id: id });
    
    // Cleanup any progress documents
    await Progress.deleteMany({ lessonId: id });

    return res.status(200).json({
      message: "Lesson deleted successfully!"
    });
  } catch (error: any) {
    console.error("Delete lesson error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// 5. Update Progress (Student only)
export const updateLessonProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { lastWatchedTimestamp, watchPercentage } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== "Student") {
      return res.status(403).json({ message: "Access denied: Only students can track watch progress." });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found." });
    }

    // Double check that the student is actually enrolled in this course
    const enrollment = await Enrollment.findOne({
      userId,
      courseId: lesson.courseId,
      role: "Student",
      status: "Approved"
    });
    if (!enrollment) {
      return res.status(403).json({ message: "Access denied: You are not enrolled in this course." });
    }

    const percentage = Number(watchPercentage) || 0;
    const completed = percentage >= 90; // mark completed if student watched 90%+

    const progress = await Progress.findOneAndUpdate(
      { userId, lessonId },
      {
        courseId: lesson.courseId,
        lastWatchedTimestamp: Number(lastWatchedTimestamp) || 0,
        watchPercentage: percentage,
        completed
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Progress updated successfully.",
      progress
    });
  } catch (error: any) {
    console.error("Update progress error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// 6. Get Course Progress Summary (Student only)
export const getCourseProgressSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== "Student") {
      return res.status(403).json({ message: "Access denied." });
    }

    const totalLessons = await Lesson.countDocuments({ courseId });
    if (totalLessons === 0) {
      return res.status(200).json({
        totalLessons: 0,
        completedLessons: 0,
        overallPercentage: 0
      });
    }

    const completedCount = await Progress.countDocuments({
      userId,
      courseId,
      completed: true
    });

    const overallPercentage = Math.round((completedCount / totalLessons) * 100);

    return res.status(200).json({
      totalLessons,
      completedLessons: completedCount,
      overallPercentage
    });
  } catch (error: any) {
    console.error("Get course progress summary error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};
