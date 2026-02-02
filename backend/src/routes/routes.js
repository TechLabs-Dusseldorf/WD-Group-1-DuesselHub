import dotenv from "dotenv"
import express from "express"
import Issue from "../models/Issue.js"

dotenv.config()

const router = express.Router()

router.get('/test', (req, res) => {
    res.status(200).json({ message: 'Router is working!' })
})

router.get('/issues', async (req, res) => {
    try {
        const issues = await Issue.find({})
        
        res.status(200).json(issues)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

export default router