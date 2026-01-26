import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import router from './routes/routes.js'

//this looks for the .env file and loads the variables in this case MONGO_URI into process.env
dotenv.config()

//initializes the server
const app = express()

//adds middleware
app.use(express.json())  // to parse JSON requests
app.use(cors({
    origin: true,
    credentials: true,
}))

app.use('/api', router)

app.get('/', (req, res) => {
    res.status(200).json({ message: 'API is running successfully 🚀' })
})
const PORT = 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))




// connect to mongoDB HERE
