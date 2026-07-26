import { Router } from "express";
import { authenticate, checkRole } from "../middleware/auth";
import {
  createLesson,
  getLessons,
  updateLesson,
  deleteLesson,
  updateLessonProgress,
  getCourseProgressSummary
} from "../controllers/lessonController";

const router = Router();

// Apply auth to all lesson routes
router.use(authenticate);

// Course level routes
router.post(
  "/courses/:courseId",
  checkRole(["SuperAdmin", "InstituteAdmin", "Faculty"]),
  createLesson
);
router.get("/courses/:courseId", getLessons);
router.get("/courses/:courseId/progress", checkRole(["Student"]), getCourseProgressSummary);

// Single lesson routes
router.put(
  "/:id",
  checkRole(["SuperAdmin", "InstituteAdmin", "Faculty"]),
  updateLesson
);
router.delete(
  "/:id",
  checkRole(["SuperAdmin", "InstituteAdmin", "Faculty"]),
  deleteLesson
);

// Progress tracking route
router.post("/:lessonId/progress", checkRole(["Student"]), updateLessonProgress);

export default router;
