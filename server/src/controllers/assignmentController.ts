import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { Assignment } from "../models/Assignment";
import { Submission } from "../models/Submission";
import { Course } from "../models/Course";

// Create Assignment (Admin / Faculty only)
export const createAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId, title, description, deadline, totalMarks, attachmentUrl } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!courseId || !title || !description || !deadline || totalMarks === undefined) {
      return res.status(400).json({ message: "Missing required fields: courseId, title, description, deadline, totalMarks." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Verify ownership/institute match
    if (req.user.role !== "SuperAdmin" && course.instituteId.toString() !== req.user.instituteId) {
      return res.status(403).json({ message: "Forbidden: Access denied." });
    }

    const newAssignment = new Assignment({
      courseId,
      title,
      description,
      deadline: new Date(deadline),
      totalMarks,
      attachmentUrl,
      createdBy: req.user.id
    });

    await newAssignment.save();
    return res.status(201).json({ message: "Assignment created successfully.", assignment: newAssignment });
  } catch (error: any) {
    console.error("Error creating assignment:", error);
    return res.status(500).json({ message: "Failed to create assignment.", error: error.message });
  }
};

// Get all assignments for a course
export const getAssignmentsByCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Verify ownership/institute match
    if (req.user.role !== "SuperAdmin" && course.instituteId.toString() !== req.user.instituteId) {
      return res.status(403).json({ message: "Forbidden: Access denied." });
    }

    const assignments = await Assignment.find({ courseId }).sort({ deadline: 1 });
    return res.status(200).json(assignments);
  } catch (error: any) {
    console.error("Error fetching assignments:", error);
    return res.status(500).json({ message: "Failed to fetch assignments.", error: error.message });
  }
};

// Get single assignment details
export const getAssignmentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res.status(404).json({ message: "Linked Course not found." });
    }

    // Verify ownership/institute match
    if (req.user.role !== "SuperAdmin" && course.instituteId.toString() !== req.user.instituteId) {
      return res.status(403).json({ message: "Forbidden: Access denied." });
    }

    return res.status(200).json(assignment);
  } catch (error: any) {
    console.error("Error fetching assignment:", error);
    return res.status(500).json({ message: "Failed to fetch assignment details.", error: error.message });
  }
};

// Submit Assignment (Student only)
export const submitAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params; // assignmentId

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a submission file (PDF)." });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    // Check if student already submitted
    const existingSubmission = await Submission.findOne({ studentId: req.user.id, assignmentId: id });
    if (existingSubmission) {
      return res.status(400).json({ message: "You have already submitted this assignment." });
    }

    const submission = new Submission({
      studentId: req.user.id,
      assignmentId: id,
      filePath: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      submittedAt: new Date()
    });

    await submission.save();
    return res.status(201).json({ message: "Assignment submitted successfully.", submission });
  } catch (error: any) {
    console.error("Error submitting assignment:", error);
    return res.status(500).json({ message: "Failed to submit assignment.", error: error.message });
  }
};

// Get Submissions (Student gets their own, Faculty/Admin gets all)
export const getSubmissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params; // assignmentId
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    let query: any = { assignmentId: id };

    if (req.user.role === "Student") {
      query.studentId = req.user.id;
    }

    const submissions = await Submission.find(query)
      .populate("studentId", "name email")
      .populate("gradedBy", "name email")
      .sort({ submittedAt: -1 });

    return res.status(200).json(submissions);
  } catch (error: any) {
    console.error("Error getting submissions:", error);
    return res.status(500).json({ message: "Failed to fetch submissions.", error: error.message });
  }
};

// Grade Submission (Faculty / Admin only)
export const gradeSubmission = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (grade === undefined) {
      return res.status(400).json({ message: "Missing grade parameter." });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found." });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.graded = true;
    submission.gradedBy = req.user.id as any;

    await submission.save();
    return res.status(200).json({ message: "Submission graded successfully.", submission });
  } catch (error: any) {
    console.error("Error grading submission:", error);
    return res.status(500).json({ message: "Failed to grade submission.", error: error.message });
  }
};

// Delete Assignment
export const deleteAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    // Clean up submissions
    await Submission.deleteMany({ assignmentId: id });
    await Assignment.findByIdAndDelete(id);

    return res.status(200).json({ message: "Assignment deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting assignment:", error);
    return res.status(500).json({ message: "Failed to delete assignment.", error: error.message });
  }
};
