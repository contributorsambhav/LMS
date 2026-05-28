import { Router } from "express";
import { authenticate, checkRole, checkApproved } from "../middleware/auth";
import {
  createCourse,
  getCourses,
  createSubject,
  deleteSubject,
  assignSubjectFaculty,
  removeFaculty,
  removeStudent,
  updateUserStatus,
  getInstituteProfile,
  updateInstituteProfile,
  getRoster,
  getPendingUsers
} from "../controllers/adminController";
import { getPlans } from "../controllers/superController";

const router = Router();

// Apply global middleware to all institute admin routes
router.use(authenticate);
router.use(checkApproved);
router.use(checkRole(["InstituteAdmin"]));

// Course Management
router.post("/courses", createCourse);
router.get("/courses", getCourses);

// Institute Profile
router.get("/institute", getInstituteProfile);
router.patch("/institute", updateInstituteProfile);
router.get("/plans", getPlans);

// Subject Management
router.post("/subjects", createSubject);
router.delete("/subjects/:id", deleteSubject);
router.patch("/subjects/:id/assign", assignSubjectFaculty);

// User Management
router.get("/roster", getRoster);
router.delete("/faculties/:id", removeFaculty);
router.delete("/students/:id", removeStudent);
router.get("/pending-users", getPendingUsers);
router.patch("/users/:id/status", updateUserStatus);

export default router;
