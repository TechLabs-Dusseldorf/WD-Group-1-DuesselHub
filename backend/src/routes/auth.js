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
        const { username, email, password, role } = req.body  // role optional hinzugefügt
        const normalizedUsername = String(username ?? '').trim()
        const normalizedEmail = String(email ?? '').trim().toLowerCase()

        // Basic validation (verhindert viele stille Crashes)
        if (!normalizedUsername || !normalizedEmail || !password) {
            return res.status(400).json({ message: 'Please provide all fields' })
        }

        // Validate Username length (Backend validation per review)
        if (normalizedUsername.length < 4) {
            return res.status(400).json({ message: 'Username must be at least 4 characters long' })
        }

        // Validate Email format (Backend validation per review)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ message: 'Please provide a valid email address' })
        }

        // Validate Password length (Backend validation per review)
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' })
        }

        // Prüfen, ob User schon existiert
        const userExists = await User.findOne({ $or: [{ email: normalizedEmail }, { username: normalizedUsername }] })
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' })
        }

        // User erstellen, Default role = "user"
        const user = await User.create({
            username: normalizedUsername,
            email: normalizedEmail,
            password,
            role: role || 'user'  // <- Default fallback
        })

        // JWT erstellen
        const token = generateToken(user._id)

        // Response zurückschicken
        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
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
        // Only accept ONE identifier from the Frontend
        const { email, password } = req.body
        const identifier = String(email ?? '').trim()

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Please provide an email/username and password' })
        }

        // Still allow the user to log in using either their email OR username in the DB
        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier }
            ]
        })
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
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {
        console.error('LOGIN ERROR:', error)
        res.status(500).json({ message: 'Server error during login' })
    }
})

export default router