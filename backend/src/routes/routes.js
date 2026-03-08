import dotenv from "dotenv"
import express from "express"
import upload from "../middleware/upload.js"
import authRoutes from "./auth.js"
import protect, { authorize, optionalProtect } from "../middleware/authMiddleware.js"
import {
  createIssue,
  deleteIssue,
  endorseIssue,
  getAllIssues,
  softDeleteIssue,
  updateIssue,
  updateIssueStatus
} from "../controllers/issueController.js"

dotenv.config()

const router = express.Router()

// Auth routes
router.use("/auth", authRoutes)

// Health check
router.get("/test", (req, res) => {
  res.status(200).json({ message: "Router is working!" })
})

// Issue routes
router.post("/issues", protect, upload.single("photo"), createIssue)
router.get("/issues", optionalProtect, getAllIssues)
router.patch("/issues/:id/endorse", protect, endorseIssue)
// Backward compatible endpoint used by current frontend
router.patch("/:id/endorse", protect, endorseIssue)
router.patch("/issues/:id/status", protect, authorize("moderator", "admin"), updateIssueStatus)
router.put("/issues/:id", protect, updateIssue)
router.patch("/issues/:id/soft-delete", protect, authorize("moderator", "admin"), softDeleteIssue)
router.delete("/issues/:id", protect, authorize("admin"), deleteIssue)

export default router