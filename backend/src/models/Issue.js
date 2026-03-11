import mongoose from "mongoose";

const { Schema } = mongoose;

const issueSchema = new Schema({
  title: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  photoUrl: { type: String },
  endorsements: { type: Number, default: 0, min: 0 },
  endorsedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.model("Issue", issueSchema);