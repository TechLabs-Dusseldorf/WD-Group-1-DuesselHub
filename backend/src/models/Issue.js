import mongoose from "mongoose";

const { Schema } = mongoose;

const issueSchema = new Schema({
  title: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  photoUrl: { type: String },
  endorsements: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Issue", issueSchema);