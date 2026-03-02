// Imports
import mongoose from "mongoose";
import dotenv from "dotenv";
import Issue from "./src/models/Issue.js";
import User from "./src/models/User.js";

dotenv.config();

// DB-Connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected (seed)");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

// Fake Issues
const fakeIssues = [
  { title: "Broken street lamp", description: "Lamp not working at night", location: "Main Street 12" },
  { title: "Pothole in city center", description: "Large pothole causing traffic problems", location: "City Center" },
  { title: "Overflowing trash bin", description: "Trash bin has not been emptied", location: "Park Avenue" },
  { title: "Graffiti on school wall", description: "Graffiti on the side of the school building", location: "School Street" },
  { title: "Broken bench", description: "Bench in the park is broken and unsafe", location: "Central Park" }
];

// sample users with different roles
const fakeUsers = [
  { username: 'alice', email: 'alice@example.com', password: 'password123', role: 'user' },
  { username: 'mod_bob', email: 'bob@example.com', password: 'password123', role: 'moderator' },
  { username: 'admin_carol', email: 'carol@example.com', password: 'password123', role: 'admin' },
];

// Put data into DB
async function seedDatabase() {
  try {
    await User.deleteMany({})
    await Issue.deleteMany({})

    const users = await User.insertMany(fakeUsers)
    console.log("Users inserted into database")

    // assign the first user as reporter for all dummy issues
    const issuesWithUser = fakeIssues.map((iss) => ({ ...iss, user: users[0]._id }))
    await Issue.insertMany(issuesWithUser)
    console.log("Issues inserted into database");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Seed Script
async function runSeed() {
  await connectDB();
  await seedDatabase();
}

runSeed();
