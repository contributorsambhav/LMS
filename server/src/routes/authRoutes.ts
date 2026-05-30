import { Router } from "express";
import { 
  register, 
  login, 
  oauthLogin, 
  superCodeLogin, 
  getActiveInstitutes, 
  updateInstitute, 
  updateProfile,
  getPendingFacultyAffiliations,
  updateFacultyAffiliation
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/oauth-login", oauthLogin);
router.post("/super-login", superCodeLogin);
router.get("/active-institutes", getActiveInstitutes);
router.put("/update-institute", authenticate, updateInstitute);
router.patch("/update-profile", authenticate, updateProfile);

// Faculty affiliation approvals
router.get("/faculty/pending-affiliations", authenticate, getPendingFacultyAffiliations);
router.post("/faculty/approve-affiliation", authenticate, updateFacultyAffiliation);

export default router;
