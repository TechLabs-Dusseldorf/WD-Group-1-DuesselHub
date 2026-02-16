import Issue from "../models/Issue.js";
import cloudinary from "../config/cloudinary.js";



export const createIssue = async (req, res) => {
  try {
    const { title, name, description, location } = req.body;

    let photoUrl = null;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "issues" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      photoUrl = result.secure_url;
    }

    const issue = new Issue({
      title,
      name,
      description,
      location,
      photoUrl
    });

    const savedIssue = await issue.save();

    res.status(201).json(savedIssue);


  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      message: "The file is over the size limit. It should be smaller than 5 MegaBytes." 
    });
  }

  if (error.message && error.message.includes('You are only allowed to upload image files')) {
    return res.status(400).json({ message: error.message });
  }

  if (error.http_code) {
    return res.status(500).json({ 
      message: "We couldn't upload your photo. Please try again." 
    });
  }

    res.status(500).json({ 
      message: "We couldn't submit your report. Please try again." 
    });
  }
};



export const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find({});
    
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};