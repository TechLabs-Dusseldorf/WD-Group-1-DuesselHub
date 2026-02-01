import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  photoUrl: { type: String },
  endorsements: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Issue = mongoose.model("Issue", issueSchema);
export default Issue;
