import mongoose from "mongoose";

const { Schema } = mongoose;

const issueSchema = new Schema({
    issueId: { type: Schema.Types.ObjectId, ref: "Issue", required: true },
    user: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("comment", issueSchema);