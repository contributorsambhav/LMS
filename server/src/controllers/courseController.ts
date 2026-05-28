import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { Course } from "../models/Course";
import { Enrollment } from "../models/Enrollment";
import { User } from "../models/User";

export const joinCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { joinCode } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({ message: "Authentication failed: Missing user details." });
    }

    if (!joinCode || typeof joinCode !== "string" || joinCode.trim().length !== 6) {
      return res.status(400).json({ message: "Please provide a valid 6-character join code." });
    }

    const cleanCode = joinCode.trim().toUpperCase();

    // Find course with matching code
    const course = await Course.findOne({
      $or: [{ facultyCode: cleanCode }, { studentCode: cleanCode }]
    });

    if (!course) {
      return res.status(404).json({ message: "Invalid join code: Course not found." });
    }

    let roleForEnrollment: "Faculty" | "Student";

    if (course.facultyCode === cleanCode) {
      if (userRole !== "Faculty") {
        return res.status(403).json({ 
          message: "Access denied: This code is for Faculty members only." 
        });
      }
      roleForEnrollment = "Faculty";
    } else {
      if (userRole !== "Student") {
        return res.status(403).json({ 
          message: "Access denied: This code is for Students only." 
        });
      }
      roleForEnrollment = "Student";
    }

    // Check if user is already enrolled in this course
    const existingEnrollment = await Enrollment.findOne({ userId, courseId: course._id });
    if (existingEnrollment) {
      return res.status(409).json({ message: "You are already enrolled in this course." });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      userId,
      courseId: course._id,
      role: roleForEnrollment,
      status: roleForEnrollment === "Faculty" ? "Approved" : "Pending"
    });
    await enrollment.save();

    // Update user's instituteId if not already linked
    const user = await User.findById(userId);
    if (user && !user.instituteId) {
      user.instituteId = course.instituteId as any;
      await user.save();
    }

    return res.status(200).json({
      message: roleForEnrollment === "Faculty"
        ? `Successfully joined course '${course.name}' as Faculty!`
        : `Enrollment request for '${course.name}' submitted. Pending Faculty approval.`,
      course: {
        id: course._id,
        name: course.name,
        description: course.description
      }
    });
  } catch (error: any) {
    console.error("Join course error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const getUserCourses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication failed: Missing user details." });
    }

    const enrollments = await Enrollment.find({ userId, status: "Approved" }).populate("courseId");
    const courses = enrollments.map(e => e.courseId).filter(Boolean);
    return res.status(200).json(courses);
  } catch (error: any) {
    console.error("Get user courses error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// Faculty Enrollment Management Actions
export const getPendingEnrollments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const facultyId = req.user?.id;
    if (!facultyId) {
      return res.status(401).json({ message: "Authentication failed: Missing user details." });
    }

    // Find all courses this Faculty member is enrolled in (and approved)
    const facultyEnrollments = await Enrollment.find({
      userId: facultyId,
      role: "Faculty",
      status: "Approved"
    });
    const courseIds = facultyEnrollments.map(e => e.courseId);

    // Get all pending Student enrollments for those courses
    const pendingEnrollments = await Enrollment.find({
      courseId: { $in: courseIds },
      role: "Student",
      status: "Pending"
    }).populate("userId", "name email").populate("courseId", "name facultyCode studentCode");

    const enrichedEnrollments = pendingEnrollments.map(e => {
      const student = e.userId as any;
      const course = e.courseId as any;
      return {
        id: e._id,
        joinedAt: e.joinedAt,
        student: student ? { id: student._id, name: student.name, email: student.email } : null,
        course: course ? { id: course._id, name: course.name } : null
      };
    });

    return res.status(200).json(enrichedEnrollments);
  } catch (error: any) {
    console.error("Get pending enrollments error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const updateEnrollmentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params; // Enrollment ID
    const { status } = req.body; // "Approved" | "Rejected"
    const facultyId = req.user?.id;

    if (!facultyId) {
      return res.status(401).json({ message: "Authentication failed: Missing user details." });
    }

    if (!status || !["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status state specified." });
    }

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment request not found." });
    }

    // Verify the requesting user is an approved Faculty in that course
    const isAssigned = await Enrollment.findOne({
      userId: facultyId,
      courseId: enrollment.courseId,
      role: "Faculty",
      status: "Approved"
    });
    if (!isAssigned) {
      return res.status(403).json({ message: "Access denied: You are not assigned as Faculty to this course." });
    }

    enrollment.status = status;
    await enrollment.save();

    return res.status(200).json({
      message: `Student enrollment has been successfully ${status.toLowerCase()}.`,
      enrollment
    });
  } catch (error: any) {
    console.error("Update enrollment status error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};
