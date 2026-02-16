import dotenv from "dotenv";
import express from "express";
import upload from "../middleware/upload.js";
import { createIssue, getAllIssues } from "../controllers/issueController.js";

dotenv.config();

const router = express.Router();

router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Router is working!' });
});

router.post('/issues', upload.single('photo'), createIssue);
router.get('/issues', getAllIssues);

export default router;