import Issue from "../models/Issue.js";
import { validateIssue } from "../middleware/validateIssues.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";


export const createIssue = async (req, res) => {
  try {
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
      photoUrl
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

    const issues = await Issue.find({}).sort(sortLogic);
    
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const endorseIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const incrementValue = action === "remove" ? -1 : 1;

    const updatedIssue = await Issue.findByIdAndUpdate(
      id,
      { $inc: { endorsements: incrementValue } },
      { new: true, runValidators: true } 
    );

    if (!updatedIssue) {
      return res.status(404).json({ message: "Issue not found." });
    }

    res.status(200).json(updatedIssue);

  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Endorsements cannot be less than zero." });
    }
    res.status(500).json({ message: "Could not update endorsement. Please try again." });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Open', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided." });
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedIssue) {
      return res.status(404).json({ message: "Issue not found." });
    }

    res.status(200).json(updatedIssue);

  } catch (error) {
    res.status(500).json({ message: "Could not update issue status." });
  }
};