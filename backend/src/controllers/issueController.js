import mongoose from "mongoose";
import Issue from "../models/Issue.js";
import { validateIssue } from "../middleware/validateIssues.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

function sanitizeEndorsedByList(value) {
  if (!Array.isArray(value)) return [];
  const unique = new Map();
  value.forEach((entry) => {
    const raw = entry?.toString?.() ?? String(entry ?? "");
    if (!mongoose.Types.ObjectId.isValid(raw)) return;
    unique.set(raw, new mongoose.Types.ObjectId(raw));
  });
  return [...unique.values()];
}


export const createIssue = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Token missing or invalid" });
    }

    const result = validateIssue(req.body);

    if (!result.success) {
      return res.status(400).json({
        errors: result.error.errors
      });
    }

    const validatedData = result.data;

    let photoUrl = null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      photoUrl = uploadResult.secure_url;
    }

    const issue = new Issue({
      ...validatedData,
      photoUrl,
      user: req.user._id
    });

    const savedIssue = await issue.save();

    return res.status(201).json(savedIssue);

  } catch (error) {

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: "The file is over the size limit. It should be smaller than 5 MegaBytes."
      });
    }

    if (error.message && error.message.includes('Only image files are allowed!')) {
      return res.status(400).json({ message: error.message });
    }

    if (error.http_code) {
      return res.status(500).json({
        message: "We couldn't upload your photo. Please try again."
      });
    }

    return res.status(500).json({
      message: "We couldn't submit your report. Please try again."
    });
  }
};

export const getAllIssues = async (req, res) => {
  try {
    const { sort } = req.query;
    let sortLogic = { createdAt: -1 };

    if (sort === "most_endorsed") {
      sortLogic = { endorsements: -1 };
    } else if (sort === "hottest") {
      sortLogic = { endorsements: -1, createdAt: -1 };
    }

    const currentUserId = req.user?._id?.toString() ?? null;

    const issues = await Issue.find({ deleted: { $ne: true } })
      .sort(sortLogic)
      .populate("user", "username email");

    const issuesWithVoteState = issues.map((issueDoc) => {
      const issue = issueDoc.toObject();
      const endorsedBy = sanitizeEndorsedByList(issue.endorsedBy);
      const persistedCount = typeof issue.endorsements === "number" ? issue.endorsements : 0;
      const hasEndorsed = currentUserId
        ? endorsedBy.some((userId) => userId.toString() === currentUserId)
        : false;

      return {
        ...issue,
        endorsements: Math.max(persistedCount, endorsedBy.length),
        myVote: hasEndorsed ? 1 : 0
      };
    });

    res.status(200).json(issuesWithVoteState);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const endorseIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const userId = req.user?._id?.toString();

    if (!userId) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    if (action !== "add" && action !== "remove") {
      return res.status(400).json({ message: 'action must be "add" or "remove"' });
    }

    const existingIssue = await Issue.findById(id).select("_id");
    if (!existingIssue) {
      return res.status(404).json({ message: "Issue not found." });
    }

    if (action === "add") {
      await Issue.updateOne(
        { _id: id, endorsedBy: { $ne: req.user._id } },
        {
          $addToSet: { endorsedBy: req.user._id },
          $inc: { endorsements: 1 }
        }
      );
    } else {
      await Issue.updateOne(
        { _id: id, endorsedBy: req.user._id },
        {
          $pull: { endorsedBy: req.user._id },
          $inc: { endorsements: -1 }
        }
      );
    }

    await Issue.updateOne({ _id: id, endorsements: { $lt: 0 } }, { $set: { endorsements: 0 } });
    const updatedIssue = await Issue.findById(id);
    if (!updatedIssue) {
      return res.status(404).json({ message: "Issue not found." });
    }

    const issueObject = updatedIssue.toObject();
    const endorsedBy = sanitizeEndorsedByList(issueObject.endorsedBy);
    const myVote = endorsedBy.some((endorserId) => endorserId.toString() === userId) ? 1 : 0;

    res.status(200).json({
      ...issueObject,
      endorsedBy,
      endorsements: typeof issueObject.endorsements === "number" ? issueObject.endorsements : 0,
      myVote
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Endorsements cannot be less than zero." });
    }
    res.status(500).json({ message: "Could not update endorsement." });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    const validStatuses = ['open', 'in_progress', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided." });
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedIssue) return res.status(404).json({ message: "Issue not found." });
    
    res.status(200).json(updatedIssue);
  } catch (error) {
    res.status(500).json({ message: "Could not update issue status." });
  }
};

export const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    if (req.user.role === "admin") {
      Object.assign(issue, req.body);
      const saved = await issue.save();
      return res.status(200).json(saved);
    }

    if (req.user.role === "moderator") {
      if (req.body.status) {
        issue.status = req.body.status;
        const saved = await issue.save();
        return res.status(200).json(saved);
      }
      return res.status(403).json({ message: "Moderators may only modify status" });
    }

    if (issue.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You may only edit your own issues" });
    }

    const allowed = ["title", "name", "description", "location", "photoUrl"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) issue[field] = req.body[field];
    });

    const saved = await issue.save();
    return res.status(200).json(saved);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const softDeleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    issue.deleted = true;
    const saved = await issue.save();
    return res.status(200).json(saved);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    await issue.deleteOne();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};