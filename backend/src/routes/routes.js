import dotenv from "dotenv"
import express from "express"
import Issue from "../models/Issue.js"
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";


dotenv.config()


const router = express.Router()

router.post('/issues', upload.single('photo'), async (req, res) => {
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

    res.status(500).json({ message: "The report cannot be submitted. Please try again." });
  }
});


router.get('/test', (req, res) => {
    res.status(200).json({ message: 'Router is working!' })
})

router.get('/issues', async (req, res) => {
    try {
        const issues = await Issue.find({})
        
        res.status(200).json(issues)
    } 
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})


export default router