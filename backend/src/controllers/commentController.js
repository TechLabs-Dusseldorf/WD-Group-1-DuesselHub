import Comment from "../models/Comment.js";
import Issue from "../models/Issue.js";
import { validateComment } from "../middleware/validateComments.js";

export const createComment = async (req, res) => {
  try {
    const { issueId } = req.params;

    const result = validateComment(req.body);
    if (!result.success) {
      return res.status(400).json({
        errors: result.error.errors
      });
    }

    const issueExists = await Issue.findById(issueId);
    if (!issueExists) {
      return res.status(404).json({ message: "This Issue Does Not Exist." });
    }

    const comment = new Comment({
      issueid: issueId,
      ...result.data
    });

    const savedComment = await comment.save();

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

    const issueExists = await Issue.findById(issueId);
    if (!issueExists) {
      return res.status(404).json({ message: "This Issue Does Not Exist." });
    }

    
    const comments = await Comment.find({ issueid: issueId })
      .sort({ createdAt: -1 });

    return res.status(200).json(comments);

  } catch (error) {
    return res.status(500).json({
      message: "The Comments Could Not Be Retrieved. Please Try Again."
    });
  }
};