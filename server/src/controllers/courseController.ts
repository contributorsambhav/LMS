import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { Course } from "../models/Course";
import { Enrollment } from "../models/Enrollment";
import { User } from "../models/User";
import { Session } from "../models/Session";
import { Material } from "../models/Material";
import { Institute } from "../models/Institute";
import { createZoomMeeting, deleteZoomMeeting } from "../services/zoomService";

// Helper to generate unique 6-character alphanumeric codes
const generateUniqueCode = async (): Promise<string> => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let isUnique = false;
  let code = "";

  while (!isUnique) {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existing = await Course.findOne({ 
      $or: [{ facultyCode: code }, { studentCode: code }] 
    });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
};

// Course Creation (Accessible to Admins and Faculty)
export const createCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, courseCode } = req.body;
    const instituteId = req.user?.instituteId;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!instituteId) {
      return res.status(403).json({ message: "Access denied: User is not linked to an Institute." });
    }

    if (!name || !description || !courseCode) {
      return res.status(400).json({ message: "Course name, description, and course code are required." });
    }

    // Check unique course code for this institute
    const existingCourseCode = await Course.findOne({ 
      courseCode: courseCode.trim(), 
      instituteId 
    });
    if (existingCourseCode) {
      return res.status(400).json({ message: "Course code must be unique within your institute." });
    }

    const facultyCode = await generateUniqueCode();
    const studentCode = await generateUniqueCode();

    const course = new Course({
      name,
      description,
      courseCode: courseCode.trim(),
      instituteId,
      facultyCode,
      studentCode
    });

    await course.save();

    // If the creator is a Faculty member, automatically enroll them as approved Faculty
    if (userRole === "Faculty") {
      const enrollment = new Enrollment({
        userId,
        courseId: course._id,
        role: "Faculty",
        status: "Approved"
      });
      await enrollment.save();
    }

    return res.status(201).json({
      message: "Course created successfully!",
      course
    });
  } catch (error: any) {
    console.error("Create course error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const joinCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { joinCode } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({ message: "Authentication failed: Missing user details." });
    }

    if (!joinCode || typeof joinCode !== "string" || joinCode.trim().length < 3) {
      return res.status(400).json({ message: "Please provide a valid course code or join code." });
    }

    const cleanCode = joinCode.trim().toUpperCase();

    // Find course with matching code (can be custom courseCode, studentCode, or facultyCode)
    const course = await Course.findOne({
      $or: [
        { courseCode: cleanCode },
        { studentCode: cleanCode },
        { facultyCode: cleanCode }
      ]
    });

    if (!course) {
      return res.status(404).json({ message: "Invalid code: Course not found." });
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
          message: "Access denied: Only Students can enroll using this code." 
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
        : `Enrollment request for '${course.name}' submitted. Waiting for teacher approval.`,
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
    const userRole = req.user?.role;
    const instituteId = req.user?.instituteId;

    if (!userId || !userRole) {
      return res.status(401).json({ message: "Authentication failed: Missing user details." });
    }

    // Faculty pending affiliation can't see their courses
    const user = await User.findById(userId);
    if (userRole === "Faculty" && user?.affiliationStatus === "Pending") {
      return res.status(200).json([]);
    }

    if (userRole === "InstituteAdmin") {
      if (!instituteId) return res.status(200).json([]);
      const courses = await Course.find({ instituteId });
      return res.status(200).json(courses);
    }

    const enrollments = await Enrollment.find({ userId, status: "Approved" }).populate("courseId");
    const courses = enrollments.map(e => e.courseId).filter(Boolean);
    return res.status(200).json(courses);
  } catch (error: any) {
    console.error("Get user courses error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const getUserEnrollments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication failed: Missing user details." });
    }

    const enrollments = await Enrollment.find({ userId }).populate("courseId");
    return res.status(200).json(enrollments);
  } catch (error: any) {
    console.error("Get user enrollments error:", error);
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

    const course = await Course.findById(enrollment.courseId);
    if (!course) {
      return res.status(404).json({ message: "Associated course not found." });
    }

    let isAuthorized = false;

    if (req.user?.role === "InstituteAdmin") {
      if (req.user?.instituteId && course.instituteId.toString() === req.user.instituteId.toString()) {
        isAuthorized = true;
      }
    } else {
      const isAssigned = await Enrollment.findOne({
        userId: facultyId,
        courseId: enrollment.courseId,
        role: "Faculty",
        status: "Approved"
      });
      if (isAssigned) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: "Access denied: You are not authorized to update enrollment status for this course." });
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

// Session Management Actions
export const addCourseSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { title, description, startTime, endTime, liveLink, recordedVideo, facultyId, autoGenerateZoom } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const instituteId = req.user?.instituteId;

    if (!userId || !userRole || !instituteId) {
      return res.status(401).json({ message: "Authentication failed: Missing user details." });
    }

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: "Session title, startTime, and endTime are required." });
    }

    const isAutoZoom = autoGenerateZoom === true || autoGenerateZoom === "true";

    if (!isAutoZoom && !liveLink) {
      return res.status(400).json({ message: "liveLink (Zoom link) is required when auto-generation is disabled." });
    }

    const files = (req.files as Express.Multer.File[]) || [];

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
      return res.status(403).json({ message: "Access denied: Only Faculty or Admins can add sessions." });
    }

    const attachments = files.map(file => "/uploads/" + file.filename);

    let sessionLiveLink = liveLink;
    let zoomMeetingId: number | undefined;
    let zoomStartUrl: string | undefined;
    let zoomPassword: string | undefined;

    if (isAutoZoom) {
      const institute = await Institute.findById(course.instituteId);
      if (!institute || !institute.zoomAccountId || !institute.zoomClientId || !institute.zoomClientSecret) {
        return res.status(400).json({
          message: "Failed to auto-generate Zoom meeting. Please check the Zoom credentials in the Settings page or try again later."
        });
      }

      const start = new Date(startTime);
      const end = new Date(endTime);
      const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));

      try {
        const zoomMeeting = await createZoomMeeting(
          title,
          start.toISOString(),
          duration,
          {
            zoomAccountId: institute.zoomAccountId,
            zoomClientId: institute.zoomClientId,
            zoomClientSecret: institute.zoomClientSecret
          }
        );
        sessionLiveLink = zoomMeeting.joinUrl;
        zoomMeetingId = zoomMeeting.meetingId;
        zoomStartUrl = zoomMeeting.startUrl;
        zoomPassword = zoomMeeting.password;
      } catch (err: any) {
        const zoomError = err.response?.data;
        console.error("Zoom meeting creation failed:", zoomError || err);
        
        let errorMessage = "Failed to auto-generate Zoom meeting. Please check the Zoom credentials in the Settings page or try again later.";
        if (zoomError && zoomError.reason) {
          errorMessage = `Failed to auto-generate Zoom meeting. Zoom API error: ${zoomError.reason} (${zoomError.error || 'unknown_error'}). Please check your credentials and make sure your Server-to-Server OAuth app is activated in the Zoom App Marketplace.`;
        } else if (zoomError && zoomError.message) {
          errorMessage = `Failed to auto-generate Zoom meeting. Zoom API error: ${zoomError.message}. Please check the Zoom credentials in the Settings page.`;
        }

        return res.status(400).json({
          message: errorMessage
        });
      }
    }

    const session = new Session({
      courseId,
      facultyId: facultyId ? facultyId : null,
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      liveLink: sessionLiveLink,
      zoomMeetingId,
      zoomStartUrl,
      zoomPassword,
      recordedVideo,
      attachments
    });

    await session.save();

    // Create course materials for any uploaded files
    if (files.length > 0) {
      for (const file of files) {
        const material = new Material({
          courseId,
          sessionId: session._id,
          title: file.originalname,
          originalName: file.originalname,
          filePath: "/uploads/" + file.filename,
          uploadedAt: new Date()
        });
        await material.save();
      }
    }

    return res.status(201).json({
      message: "Session added successfully!",
      session
    });
  } catch (error: any) {
    console.error("Add course session error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const getCourseSessions = async (req: AuthenticatedRequest, res: Response) => {
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

    // Authorization check
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

    const sessions = await Session.find({ courseId }).populate("facultyId", "name email").sort({ startTime: 1 });
    return res.status(200).json(sessions);
  } catch (error: any) {
    console.error("Get course sessions error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// Direct Enrollment by Faculty / Admin (Bulk multi-select support)
export const addStudentToCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { studentIds } = req.body; // array of user IDs
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const instituteId = req.user?.instituteId;

    if (!userId || !userRole || !instituteId) {
      return res.status(401).json({ message: "Authentication failed: Missing user details." });
    }

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: "At least one student must be selected." });
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
      return res.status(403).json({ message: "Access denied: Only Faculty or Admins can enroll students." });
    }

    let enrolledCount = 0;
    for (const studentId of studentIds) {
      const student = await User.findOne({ _id: studentId, role: "Student" });
      if (!student) continue;

      // Check student's affiliation
      if (student.instituteId && student.instituteId.toString() !== course.instituteId.toString()) {
        continue;
      }

      // Create or update enrollment
      let enrollment = await Enrollment.findOne({ userId: student._id, courseId: course._id });
      if (enrollment) {
        if (enrollment.status !== "Approved") {
          enrollment.status = "Approved";
          await enrollment.save();
          enrolledCount++;
        }
      } else {
        enrollment = new Enrollment({
          userId: student._id,
          courseId: course._id,
          role: "Student",
          status: "Approved"
        });
        await enrollment.save();
        enrolledCount++;
      }

      // Update student's instituteId if independent
      if (!student.instituteId) {
        student.instituteId = course.instituteId as any;
        await student.save();
      }
    }

    return res.status(200).json({
      message: `Successfully enrolled ${enrolledCount} students into course.`
    });
  } catch (error: any) {
    console.error("Add student to course error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const getCourseStudents = async (req: AuthenticatedRequest, res: Response) => {
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

    // Authorization check
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

    const studentEnrollments = await Enrollment.find({ courseId, role: "Student", status: "Approved" }).populate("userId", "name email");
    const students = studentEnrollments.map(e => e.userId).filter(Boolean);
    return res.status(200).json(students);
  } catch (error: any) {
    console.error("Get course students error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// Fetch all students registered under user's institute
export const getInstituteStudents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const instituteId = req.user?.instituteId;
    if (!instituteId) {
      return res.status(403).json({ message: "Access denied: User is not linked to an Institute." });
    }
    const students = await User.find({ instituteId, role: "Student" }).select("name email");
    return res.status(200).json(students);
  } catch (error: any) {
    console.error("Get institute students error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// Course Materials (Independent Uploads)
export const addCourseMaterial = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { title } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const instituteId = req.user?.instituteId;

    if (!userId || !userRole || !instituteId) {
      return res.status(401).json({ message: "Authentication failed: Missing user details." });
    }

    const file = req.file as Express.Multer.File;
    if (!file) {
      return res.status(400).json({ message: "PDF file upload is required." });
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
      return res.status(403).json({ message: "Access denied: Only Faculty or Admins can upload materials." });
    }

    const material = new Material({
      courseId,
      title: title || file.originalname,
      originalName: file.originalname,
      filePath: "/uploads/" + file.filename,
      uploadedAt: new Date()
    });

    await material.save();

    return res.status(201).json({
      message: "Course material uploaded successfully!",
      material
    });
  } catch (error: any) {
    console.error("Add course material error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const getCourseMaterials = async (req: AuthenticatedRequest, res: Response) => {
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

    // Authorization check
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

    const materials = await Material.find({ courseId }).populate("sessionId", "title").sort({ uploadedAt: -1 });
    return res.status(200).json(materials);
  } catch (error: any) {
    console.error("Get course materials error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const getCourseById = async (req: AuthenticatedRequest, res: Response) => {
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

    // Get count of students, faculty, and sessions
    const studentCount = await Enrollment.countDocuments({ courseId, role: "Student", status: "Approved" });
    const facultyCount = await Enrollment.countDocuments({ courseId, role: "Faculty", status: "Approved" });
    const sessionCount = await Session.countDocuments({ courseId });

    return res.status(200).json({
      course,
      studentCount,
      facultyCount,
      sessionCount
    });
  } catch (error: any) {
    console.error("Get course by ID error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const updateCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { name, description, courseCode } = req.body;
    const instituteId = req.user?.instituteId;
    const userRole = req.user?.role;

    if (userRole !== "InstituteAdmin" || !instituteId) {
      return res.status(403).json({ message: "Access denied: Only Institute Admins can edit courses." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    if (course.instituteId.toString() !== instituteId.toString()) {
      return res.status(403).json({ message: "Access denied: Course belongs to another institute." });
    }

    if (name) course.name = name;
    if (description) course.description = description;
    
    if (courseCode && courseCode.trim() !== course.courseCode) {
      const existing = await Course.findOne({
        courseCode: courseCode.trim(),
        instituteId
      });
      if (existing) {
        return res.status(400).json({ message: "Course code must be unique within your institute." });
      }
      course.courseCode = courseCode.trim();
    }

    await course.save();

    return res.status(200).json({ message: "Course updated successfully!", course });
  } catch (error: any) {
    console.error("Update course error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const deleteCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const instituteId = req.user?.instituteId;
    const userRole = req.user?.role;

    if (userRole !== "InstituteAdmin" || !instituteId) {
      return res.status(403).json({ message: "Access denied: Only Institute Admins can delete courses." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    if (course.instituteId.toString() !== instituteId.toString()) {
      return res.status(403).json({ message: "Access denied: Course belongs to another institute." });
    }

    // Delete Course
    await Course.findByIdAndDelete(courseId);
    // Clean up Zoom meetings associated with this course's sessions
    try {
      const institute = await Institute.findById(course.instituteId);
      if (institute && institute.zoomAccountId && institute.zoomClientId && institute.zoomClientSecret) {
        const zoomCredentials = {
          zoomAccountId: institute.zoomAccountId,
          zoomClientId: institute.zoomClientId,
          zoomClientSecret: institute.zoomClientSecret
        };
        const zoomSessions = await Session.find({ courseId, zoomMeetingId: { $exists: true, $ne: null } });
        for (const sess of zoomSessions) {
          if (sess.zoomMeetingId) {
            try {
              await deleteZoomMeeting(sess.zoomMeetingId, zoomCredentials);
            } catch (err) {
              console.error(`Failed to delete Zoom meeting ${sess.zoomMeetingId}:`, err);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error cleaning up Zoom meetings:", err);
    }

    // Delete Enrollments
    await Enrollment.deleteMany({ courseId });
    // Delete Sessions
    await Session.deleteMany({ courseId });
    // Delete Materials
    await Material.deleteMany({ courseId });

    return res.status(200).json({ message: "Course and all associated records deleted successfully!" });
  } catch (error: any) {
    console.error("Delete course error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const getInstituteFaculty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const instituteId = req.user?.instituteId;
    const userRole = req.user?.role;

    if (userRole !== "InstituteAdmin" || !instituteId) {
      return res.status(403).json({ message: "Access denied." });
    }

    const facultyList = await User.find({
      instituteId,
      role: "Faculty",
      affiliationStatus: "Approved"
    }).select("name email phoneNumber address");

    return res.status(200).json(facultyList);
  } catch (error: any) {
    console.error("Get institute faculty error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const getCourseFaculty = async (req: AuthenticatedRequest, res: Response) => {
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

    const facultyEnrollments = await Enrollment.find({
      courseId,
      role: "Faculty",
      status: "Approved"
    }).populate("userId", "name email");

    const facultyList = facultyEnrollments.map(e => e.userId).filter(Boolean);

    return res.status(200).json(facultyList);
  } catch (error: any) {
    console.error("Get course faculty error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const assignFacultyToCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { facultyIds } = req.body; // array of User IDs
    const instituteId = req.user?.instituteId;
    const userRole = req.user?.role;

    if (userRole !== "InstituteAdmin" || !instituteId) {
      return res.status(403).json({ message: "Access denied: Only Institute Admins can assign faculty." });
    }

    if (!facultyIds || !Array.isArray(facultyIds) || facultyIds.length === 0) {
      return res.status(400).json({ message: "Please provide a valid list of faculty IDs." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    if (course.instituteId.toString() !== instituteId.toString()) {
      return res.status(403).json({ message: "Access denied: Course belongs to another institute." });
    }

    const enrollmentsSaved = [];
    for (const facultyId of facultyIds) {
      // Validate faculty member exists and belongs to this institute
      const faculty = await User.findOne({
        _id: facultyId,
        instituteId,
        role: "Faculty",
        affiliationStatus: "Approved"
      });

      if (!faculty) continue;

      // Upsert enrollment
      const enrollment = await Enrollment.findOneAndUpdate(
        { userId: facultyId, courseId },
        { 
          userId: facultyId, 
          courseId, 
          role: "Faculty", 
          status: "Approved" 
        },
        { upsert: true, new: true }
      );
      enrollmentsSaved.push(enrollment);
    }

    return res.status(200).json({
      message: "Faculty assigned successfully!",
      count: enrollmentsSaved.length
    });
  } catch (error: any) {
    console.error("Assign faculty error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const unassignFacultyFromCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { facultyId } = req.body;
    const instituteId = req.user?.instituteId;
    const userRole = req.user?.role;

    if (userRole !== "InstituteAdmin" || !instituteId) {
      return res.status(403).json({ message: "Access denied: Only Institute Admins can unassign faculty." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    if (course.instituteId.toString() !== instituteId.toString()) {
      return res.status(403).json({ message: "Access denied: Course belongs to another institute." });
    }

    await Enrollment.findOneAndDelete({
      userId: facultyId,
      courseId,
      role: "Faculty"
    });

    return res.status(200).json({ message: "Faculty member unassigned successfully." });
  } catch (error: any) {
    console.error("Unassign faculty error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const removeStudentFromCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId, studentId } = req.params;
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
        return res.status(403).json({ message: "Access denied." });
      }
    } else if (userRole === "Faculty") {
      const isAssigned = await Enrollment.findOne({
        userId,
        courseId,
        role: "Faculty",
        status: "Approved"
      });
      if (!isAssigned) {
        return res.status(403).json({ message: "Access denied: You are not assigned to this course." });
      }
    } else {
      return res.status(403).json({ message: "Access denied." });
    }

    const result = await Enrollment.findOneAndDelete({
      userId: studentId,
      courseId,
      role: "Student"
    });

    if (!result) {
      return res.status(404).json({ message: "Enrollment record not found." });
    }

    return res.status(200).json({ message: "Student removed from course registry successfully." });
  } catch (error: any) {
    console.error("Remove student error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const getUpcomingSessions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const instituteId = req.user?.instituteId;

    if (!userId || !userRole) {
      return res.status(401).json({ message: "Authentication failed: Missing user details." });
    }

    const now = new Date();
    let queryCourseIds: any[] = [];

    if (userRole === "InstituteAdmin") {
      if (!instituteId) {
        return res.status(200).json([]);
      }
      const courses = await Course.find({ instituteId });
      queryCourseIds = courses.map(c => c._id);
    } else {
      // Find all courses where they are approved
      const enrollments = await Enrollment.find({
        userId,
        status: "Approved"
      });
      queryCourseIds = enrollments.map(e => e.courseId);
    }

    if (queryCourseIds.length === 0) {
      return res.status(200).json([]);
    }

    // Retrieve sessions where endTime is in the future
    const sessions = await Session.find({
      courseId: { $in: queryCourseIds },
      endTime: { $gt: now }
    })
    .populate("courseId", "name courseCode")
    .populate("facultyId", "name email")
    .sort({ startTime: 1 });

    return res.status(200).json(sessions);
  } catch (error: any) {
    console.error("Get upcoming sessions error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const getAllMySessions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const instituteId = req.user?.instituteId;

    if (!userId || !userRole) {
      return res.status(401).json({ message: "Authentication failed: Missing user details." });
    }

    let queryCourseIds: any[] = [];

    if (userRole === "InstituteAdmin") {
      if (!instituteId) {
        return res.status(200).json([]);
      }
      const courses = await Course.find({ instituteId });
      queryCourseIds = courses.map(c => c._id);
    } else {
      const enrollments = await Enrollment.find({
        userId,
        status: "Approved"
      });
      queryCourseIds = enrollments.map(e => e.courseId);
    }

    if (queryCourseIds.length === 0) {
      return res.status(200).json([]);
    }

    // Retrieve all sessions (past + future)
    const sessions = await Session.find({
      courseId: { $in: queryCourseIds }
    })
    .populate("courseId", "name courseCode")
    .populate("facultyId", "name email")
    .sort({ startTime: 1 });

    return res.status(200).json(sessions);
  } catch (error: any) {
    console.error("Get all sessions error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};
