import dotenv from "dotenv"
import express from "express"

dotenv.config()

const router = express.Router()
router.get('/test', (req, res) => {
    res.status(200).json({ message: 'Router is working!' })
})

export default router
