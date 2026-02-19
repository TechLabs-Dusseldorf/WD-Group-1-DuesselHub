import express from 'express'
import User from '../models/user.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' })
}

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body

        // Basic validation (verhindert viele stille Crashes)
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide all fields' })
        }

        // Prüfen, ob User schon existiert
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' })
        }

        // User erstellen
        const user = await User.create({ username, email, password })

        // JWT erstellen
        const token = generateToken(user._id)

        // Response zurückschicken
        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {
    console.error('REGISTER ERROR:', error) // Zeigt Fehler im Terminal
    res.status(500).json({ message: error.message }) // statt generischem Text
}

})


// @route   POST /api/auth/login
// @desc    Login user and get token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' })
        }

        const isMatch = await user.matchPassword(password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' })
        }

        const token = generateToken(user._id)

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {
        console.error('LOGIN ERROR:', error)
        res.status(500).json({ message: 'Server error during login' })
    }
})

export default router
