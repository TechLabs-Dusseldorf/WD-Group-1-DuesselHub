import dotenv from "dotenv"
import express from "express"
import upload from "../middleware/upload.js"
import authRoutes from "./auth.js"
import protect, { authorize, optionalProtect } from "../middleware/authMiddleware.js"
import userRoutes from './userRoutes.js';

import {
  createIssue,
  deleteIssue,
  endorseIssue,
  getAllIssues,
  softDeleteIssue,
  updateIssue,
  updateIssueStatus,
  getMyIssues
} from "../controllers/issueController.js"

import {
  createComment,
  getCommentsByIssue,
} from "../controllers/commentController.js"

dotenv.config()

const router = express.Router()

// Auth routes
router.use("/auth", authRoutes)

router.use('/users', userRoutes);

// Health check
router.get("/test", (req, res) => {
  res.status(200).json({ message: "Router is working!" })
})

router.post("/issues/:issueId/comments", protect, createComment);
router.get("/issues/:issueId/comments", getCommentsByIssue);

// Issue routes
router.post("/issues", protect, upload.single("photo"), createIssue)
router.get("/issues", optionalProtect, getAllIssues)
router.patch("/issues/:id/endorse", protect, endorseIssue)
router.get('/issues/my-issues', protect, getMyIssues); 
router.delete('/issues/:id', protect, deleteIssue);
// Backward compatible endpoint used by current frontend
router.patch("/:id/endorse", protect, endorseIssue)
router.patch("/issues/:id/status", protect, authorize("moderator", "admin"), updateIssueStatus)
router.put("/issues/:id", protect, updateIssue)
router.patch("/issues/:id/soft-delete", protect, authorize("moderator", "admin"), softDeleteIssue)
router.delete("/issues/:id", protect, authorize("admin"), deleteIssue)

export default router