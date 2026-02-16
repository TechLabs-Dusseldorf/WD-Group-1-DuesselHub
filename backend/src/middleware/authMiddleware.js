import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const protect = async (req, res, next) => {
    let token

    // Check if token exists in Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1] // "Bearer <token>"
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Attach user to request object (excluding password)
            req.user = await User.findById(decoded.id).select('-password')
            next() // allow access
        } catch (error) {
            console.error(error)
            res.status(401).json({ message: 'Not authorized, token failed' })
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' })
    }
}

export default protect
