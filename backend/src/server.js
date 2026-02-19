import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
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
const PORT = process.env.PORT || 5001

const connectDB = async () => {
    try {
        // Read the variable from the .env file
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ message: err.message })
})

// Connect to DB, then start the server
connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
