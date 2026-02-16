import express from 'express'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
const router = express.Router()

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' })
}

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body

    try {
        const userExists = await User.findOne({ email })
        if (userExists) return res.status(400).json({ message: 'User already exists' })

        const user = await User.create({ username, email, password })

        const token = generateToken(user._id)

        res.status(201).json({
            token,
            user: { id: user._id, username: user.username, email: user.email }
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @route   POST /api/auth/login
// @desc    Login user and get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ message: 'Invalid credentials' })

        const isMatch = await user.matchPassword(password)
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

        const token = generateToken(user._id)

        res.json({
            token,
            user: { id: user._id, username: user.username, email: user.email }
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

export default router
