import { Router } from "express";
import { authenticate, checkRole, checkApproved } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { 
  joinCourse, 
  getUserCourses,
  getUserEnrollments,
  getPendingEnrollments,
  updateEnrollmentStatus,
  createCourse,
  addCourseSession,
  getCourseSessions,
  addStudentToCourse,
  getCourseStudents,
  getInstituteStudents,
  addCourseMaterial,
  getCourseMaterials,
  getCourseById,
  updateCourse,
  deleteCourse,
  getInstituteFaculty,
  getCourseFaculty,
  assignFacultyToCourse,
  unassignFacultyFromCourse,
  removeStudentFromCourse,
  getUpcomingSessions
} from "../controllers/courseController";

const router = Router();

// Upcoming Sessions across all courses (Must be placed before parametric routes like /:courseId)
router.get("/upcoming-sessions", authenticate, checkApproved, getUpcomingSessions);

// Get list of all Faculty members affiliated to user's institute
router.get("/institute-faculty", authenticate, checkApproved, checkRole(["InstituteAdmin"]), getInstituteFaculty);

// Course Management (Create Course) — only InstituteAdmin can create courses
router.post("/", authenticate, checkApproved, checkRole(["InstituteAdmin"]), createCourse);

// Course Management (Join & Fetch User Courses)
router.post("/join", authenticate, checkApproved, checkRole(["Faculty", "Student"]), joinCourse);
router.get("/my-courses", authenticate, checkApproved, getUserCourses);
router.get("/my-enrollments", authenticate, checkApproved, checkRole(["Student"]), getUserEnrollments);

// Get list of all students in user's institute
router.get("/students", authenticate, checkApproved, checkRole(["InstituteAdmin", "Faculty"]), getInstituteStudents);

// Fetch a single course by ID
router.get("/:courseId", authenticate, checkApproved, getCourseById);

// Update/Delete Course
router.put("/:courseId", authenticate, checkApproved, checkRole(["InstituteAdmin"]), updateCourse);
router.delete("/:courseId", authenticate, checkApproved, checkRole(["InstituteAdmin"]), deleteCourse);

// Session Management inside Courses
router.post("/:courseId/sessions", authenticate, checkApproved, checkRole(["InstituteAdmin", "Faculty"]), upload.array("pdfs"), addCourseSession);
router.get("/:courseId/sessions", authenticate, checkApproved, checkRole(["InstituteAdmin", "Faculty", "Student"]), getCourseSessions);

// Direct Enrollment inside Courses
router.post("/:courseId/students", authenticate, checkApproved, checkRole(["InstituteAdmin", "Faculty"]), addStudentToCourse);
router.get("/:courseId/students", authenticate, checkApproved, checkRole(["InstituteAdmin", "Faculty", "Student"]), getCourseStudents);

// Course Faculty assignments
router.get("/:courseId/faculty", authenticate, checkApproved, getCourseFaculty);
router.post("/:courseId/assign-faculty", authenticate, checkApproved, checkRole(["InstituteAdmin"]), assignFacultyToCourse);
router.post("/:courseId/unassign-faculty", authenticate, checkApproved, checkRole(["InstituteAdmin"]), unassignFacultyFromCourse);

// Remove student from course registry
router.delete("/:courseId/students/:studentId", authenticate, checkApproved, checkRole(["InstituteAdmin", "Faculty"]), removeStudentFromCourse);

// Independent Course Materials
router.post("/:courseId/materials", authenticate, checkApproved, checkRole(["InstituteAdmin", "Faculty"]), upload.single("pdf"), addCourseMaterial);
router.get("/:courseId/materials", authenticate, checkApproved, checkRole(["InstituteAdmin", "Faculty", "Student"]), getCourseMaterials);

// Faculty Enrollment Approval / Requests
router.get("/pending-enrollments", authenticate, checkApproved, checkRole(["Faculty"]), getPendingEnrollments);
router.patch("/enrollments/:id/status", authenticate, checkApproved, checkRole(["Faculty"]), updateEnrollmentStatus);

export default router;
