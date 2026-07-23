import { Router } from "express";
import { authenticate, checkRole } from "../middleware/auth";
import {
  createQuiz,
  getQuizzesByCourse,
  getQuizById,
  updateQuiz,
  startQuizAttempt,
  submitQuizAttempt,
  getQuizAttempts,
  gradeQuizAttempt,
  deleteQuiz,
  getQuizAnalytics
} from "../controllers/quizController";

const router = Router();

// Apply global auth to all quiz routes
router.use(authenticate);

// Course level quiz routes
router.post(
  "/courses/:courseId",
  checkRole(["SuperAdmin", "InstituteAdmin", "Faculty"]),
  createQuiz
);
router.get("/courses/:courseId", getQuizzesByCourse);

// Single quiz routes
router.get("/:id", getQuizById);
router.put(
  "/:id",
  checkRole(["SuperAdmin", "InstituteAdmin", "Faculty"]),
  updateQuiz
);
router.delete(
  "/:id",
  checkRole(["SuperAdmin", "InstituteAdmin", "Faculty"]),
  deleteQuiz
);

// Quiz attempt routes
router.post("/:id/start", checkRole(["Student"]), startQuizAttempt);
router.post("/:id/submit", checkRole(["Student"]), submitQuizAttempt);
router.get("/:id/attempts", getQuizAttempts);
router.get(
  "/:id/analytics",
  checkRole(["SuperAdmin", "InstituteAdmin", "Faculty"]),
  getQuizAnalytics
);
router.post(
  "/attempts/:attemptId/grade",
  checkRole(["SuperAdmin", "InstituteAdmin", "Faculty"]),
  gradeQuizAttempt
);

export default router;
