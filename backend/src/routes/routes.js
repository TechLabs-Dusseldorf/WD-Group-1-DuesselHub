import dotenv from "dotenv";
import express from "express";
import upload from "../middleware/upload.js";
import { createIssue, getAllIssues, endorseIssue } from "../controllers/issueController.js";
import { createComment, getCommentsByIssue } from "../controllers/commentController.js";

dotenv.config();

const router = express.Router();

router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Router is working!' });
});

router.post('/issues', upload.single('photo'), createIssue);
router.get('/issues', getAllIssues);
router.patch('/:id/endorse', endorseIssue);

router.post("/issues/:issueId/comments", createComment);
router.get("/issues/:issueId/comments", getCommentsByIssue);

export default router;