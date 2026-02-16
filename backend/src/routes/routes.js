import dotenv from "dotenv"
import express from "express"
import Issue from "../models/Issue.js"
import authRoutes from './auth.js'
import protect from '../middleware/authMiddleware.js'

dotenv.config()

const router = express.Router() 

// Auth routes
router.use('/auth', authRoutes)

// Issue routes (protected)
router.post('/issues', protect, async (req, res) => {
  try {
    const { title, name, description, location, photoUrl } = req.body
    if (!title) return res.status(400).json({ message: "Please enter a title." })
    if (!name) return res.status(400).json({ message: "Please enter your name."})
    if (!description) return res.status(400).json({ message: "Please write your report."})
    if (!location) return res.status(400).json({ message: "Please write where the issue is located."})

    const issue = new Issue({
      title,
      name,
      description,
      location,
      photoUrl,
      user: req.user._id  // link issue to logged-in user
    })

    const savedIssue = await issue.save()
    res.status(201).json(savedIssue)
  } catch (error) {
    res.status(500).json({ message: "The report cannot be submitted. Please try again." })
  }
})

router.get('/issues', protect, async (req, res) => {
  try {
    const issues = await Issue.find({}).populate('user', 'username email')
    res.status(200).json(issues)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Router is working!' })
})

export default router
