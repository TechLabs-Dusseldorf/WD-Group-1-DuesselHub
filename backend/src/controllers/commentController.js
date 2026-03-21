import Comment from "../models/Comment.js";
import Issue from "../models/Issue.js";
import mongoose from "mongoose";
import { validateComment } from "../middleware/validateComments.js";

export const createComment = async (req, res) => {
  try {
    const { issueId } = req.params;
    if (!mongoose.isValidObjectId(issueId)) {
      return res.status(400).json({ message: "Invalid issue id." });
    }

    const result = validateComment(req.body);
    if (!result.success) {
      return res.status(400).json({
        errors: result.error.issues
      });
    }

    const issueExists = await Issue.findById(issueId);
    if (!issueExists) {
      return res.status(404).json({ message: "This Issue Does Not Exist." });
    }

    const cooldownCutoff = new Date(Date.now() - 30 * 1000);
    const recentComment = await Comment.findOne({
      issueId,
      user: req.user._id,
      createdAt: { $gte: cooldownCutoff }
    });
    if (recentComment) {
      return res.status(429).json({
        message: "You're posting too fast. Please wait 30 seconds before commenting on this issue again."
      });
    }

    const comment = new Comment({
      issueId,
      user: req.user._id,
      ...result.data
    });

    const savedComment = await comment.save();
    await savedComment.populate("user", "username");

    return res.status(201).json(savedComment);

  } catch (error) {
    return res.status(500).json({
      message: "The Comment Could Not Be Created. Please Try Again."
    });
  }
};


export const getCommentsByIssue = async (req, res) => {
  try {  
    const { issueId } = req.params;
    if (!mongoose.isValidObjectId(issueId)) {
      return res.status(400).json({ message: "Invalid issue id." });
    }

    const issueExists = await Issue.findById(issueId);
    if (!issueExists) {
      return res.status(404).json({ message: "This Issue Does Not Exist." });
    }

    
    const comments = await Comment.find({ issueId })
      .sort({ createdAt: -1 })
      .populate("user", "username");

    return res.status(200).json(comments);

  } catch (error) {
    return res.status(500).json({
      message: "The Comments Could Not Be Retrieved. Please Try Again."
    });
  }
};