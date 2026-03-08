import jwt from 'jsonwebtoken'
import User from '../models/user.js'

const protect = async (req, res, next) => {
    let token

    // Prüfen, ob Token im Authorization Header existiert
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1] // "Bearer <token>"
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // User an Request anhängen (ohne Passwort)
            req.user = await User.findById(decoded.id).select('-password')

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' })
            }

            // Middleware erfolgreich → nächste Funktion aufrufen
            next()

        } catch (error) {
            console.error('AUTH MIDDLEWARE ERROR:', error)
            return res.status(401).json({ message: 'Not authorized, token failed' })
        }
    } else if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' })
    }
}

export const optionalProtect = async (req, _res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            const token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await User.findById(decoded.id).select('-password')
        } catch (_error) {
        }
    }
    next()
}


// middleware to check if the current user has one of the allowed roles
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' })
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: insufficient privileges' })
        }
        next()
    }
}

export default protect