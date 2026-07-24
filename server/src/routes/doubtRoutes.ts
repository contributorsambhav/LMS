import express from "express";
import { authenticate, checkApproved } from "../middleware/auth";
import { 
  createDoubtThread, 
  getDoubtThreads, 
  getThreadMessages, 
  postMessage,
  updateThreadStatus
} from "../controllers/doubtController";

const router = express.Router();

// Create new thread
router.post("/", authenticate, checkApproved, createDoubtThread);

// Get all threads for a course
router.get("/course/:courseId", authenticate, checkApproved, getDoubtThreads);

// Get messages for a thread
router.get("/:threadId/messages", authenticate, checkApproved, getThreadMessages);

// Post a message in a thread
router.post("/:threadId/messages", authenticate, checkApproved, postMessage);

// Update thread status (resolve)
router.patch("/:threadId/status", authenticate, checkApproved, updateThreadStatus);

export default router;
