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

export default protect
