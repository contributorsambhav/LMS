import { Router } from "express";
import { authenticate, checkRole, checkApproved } from "../middleware/auth";
import { 
  joinCourse, 
  getUserCourses,
  getPendingEnrollments,
  updateEnrollmentStatus
} from "../controllers/courseController";

const router = Router();

router.post("/join", authenticate, checkApproved, checkRole(["Faculty", "Student"]), joinCourse);
router.get("/my-courses", authenticate, checkApproved, getUserCourses);
router.get("/pending-enrollments", authenticate, checkApproved, checkRole(["Faculty"]), getPendingEnrollments);
router.patch("/enrollments/:id/status", authenticate, checkApproved, checkRole(["Faculty"]), updateEnrollmentStatus);

export default router;
