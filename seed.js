// Imports
import mongoose from "mongoose";
import dotenv from "dotenv";
import Issue from "./src/model/Issue.js";

dotenv.config();

// DB-Verbindung
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Database connected (seed)");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
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

// Daten in DB einfügen
async function seedDatabase() {
  try {
    await Issue.insertMany(fakeIssues);
    console.log("🌱 Issues inserted into database");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Seed Script ausführen
async function runSeed() {
  await connectDB();
  await seedDatabase();
}

runSeed();
