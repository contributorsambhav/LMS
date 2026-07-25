import {
  approveVerification,
  getVerificationRequests,
  rejectVerification
} from "../controllers/superController";
import { authenticate, checkRole } from "../middleware/auth";
import {
  getInstitutes,
  updateInstituteBilling,
  updateInstituteStatus,
  deleteInstitute,
  getPlans,
  updatePlan,
  getStudents,
  getStudentDetails,
  deleteUser,
  getGlobalTransactions
} from "../controllers/superController";

import { Router } from "express";

const router = Router();

// Secure all endpoints to SuperAdmin role only
router.use(authenticate);
router.use(checkRole(["SuperAdmin"]));

router.get("/institutes", getInstitutes);
router.post("/institutes/:id/status", updateInstituteStatus);
router.post("/institutes/:id/billing", updateInstituteBilling);
router.delete("/institutes/:id", deleteInstitute);

router.get("/plans", getPlans);
router.patch("/plans/:id", updatePlan);
router.get("/transactions", getGlobalTransactions);

// Student Management
router.get("/students", getStudents);
router.get("/students/:id/details", getStudentDetails);
router.delete("/users/:id", deleteUser);

router.get("/verifications", getVerificationRequests);
router.post("/verifications/:id/approve", approveVerification);
router.post("/verifications/:id/reject", rejectVerification);

export default router;
