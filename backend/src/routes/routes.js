import dotenv from "dotenv"
import express from "express"
import Issue from "../models/Issue.js"
import authRoutes from './auth.js'
import protect, { authorize } from '../middleware/authMiddleware.js'

dotenv.config()

const router = express.Router() 

// Auth routes
router.use('/auth', authRoutes)

// Issue routes
// create new issue – any authenticated user
router.post('/issues', protect, async (req, res) => {
  try {
    const { title, name, description, location, photoUrl } = req.body

    // Pflichtfelder prüfen
    if (!title || !name || !description || !location) {
      return res.status(400).json({ message: 'Missing required field(s)' })
    }

    // User prüfen
    if (!req.user) {
      return res.status(401).json({ message: 'Token missing or invalid' })
    }

    // Neues Issue erstellen
    const issue = new Issue({
      title,
      name,
      description,
      location,
      photoUrl,
      user: req.user._id
    })

    const savedIssue = await issue.save()
    res.status(201).json(savedIssue)

  } catch (error) {
    console.error('ISSUE CREATE ERROR:', error)
    res.status(500).json({ message: error.message }) // gibt echte Mongoose-ValidationErrors zurück
  }
})

// retrieve issues; public endpoint, hides soft-deleted items for everyone
router.get('/issues', async (req, res) => {
  try {
    const filter = { deleted: { $ne: true } }
    const issues = await Issue.find(filter).populate('user', 'username email')
    res.status(200).json(issues)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// update an issue – behaviour depends on role
router.put('/issues/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
    if (!issue) return res.status(404).json({ message: 'Issue not found' })

    // admin can update anything
    if (req.user.role === 'admin') {
      Object.assign(issue, req.body)
      const saved = await issue.save()
      return res.status(200).json(saved)
    }

    // moderator may only change status (and not resurrect a soft deletion)
    if (req.user.role === 'moderator') {
      if (req.body.status) {
        issue.status = req.body.status
        const saved = await issue.save()
        return res.status(200).json(saved)
      }
      return res.status(403).json({ message: 'Moderators may only modify status' })
    }

    // regular user: must own the issue and can edit basic fields
    if (issue.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You may only edit your own issues' })
    }

    // prevent user from changing role‑restricted fields
    const allowed = ['title','name','description','location','photoUrl']
    allowed.forEach(field => {
      if (req.body[field] !== undefined) issue[field] = req.body[field]
    })
    const saved = await issue.save()
    res.status(200).json(saved)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// soft delete – accessible to moderators and admins
router.patch('/issues/:id/soft-delete', protect, authorize('moderator', 'admin'), async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
    if (!issue) return res.status(404).json({ message: 'Issue not found' })
    issue.deleted = true
    const saved = await issue.save()
    res.status(200).json(saved)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// permanent delete – admins only
router.delete('/issues/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
    if (!issue) return res.status(404).json({ message: 'Issue not found' })
    await issue.remove()
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Router is working!' })
})

export default router
