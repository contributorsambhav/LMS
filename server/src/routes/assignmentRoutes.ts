import { Router } from "express";
import { authenticate, checkRole } from "../middleware/auth";
import {
  createAssignment,
  getAssignmentsByCourse,
  getAssignmentById,
  submitAssignment,
  getSubmissions,
  gradeSubmission,
  deleteAssignment
} from "../controllers/assignmentController";

const router = Router();

// Apply global auth to all assignment routes
router.use(authenticate);

// Course level assignment routes
router.post(
  "/",
  checkRole(["SuperAdmin", "InstituteAdmin", "Faculty"]),
  createAssignment
);
router.post(
  "/courses/:courseId",
  checkRole(["SuperAdmin", "InstituteAdmin", "Faculty"]),
  createAssignment
);
router.get("/courses/:courseId", getAssignmentsByCourse);

// Single assignment routes
router.get("/:id", getAssignmentById);
router.delete(
  "/:id",
  checkRole(["SuperAdmin", "InstituteAdmin", "Faculty"]),
  deleteAssignment
);

// Submission routes
router.post(
  "/:id/submit",
  checkRole(["Student"]),
  submitAssignment
);
router.get("/:id/submissions", getSubmissions);
router.post(
  "/submissions/:submissionId/grade",
  checkRole(["SuperAdmin", "InstituteAdmin", "Faculty"]),
  gradeSubmission
);

export default router;
