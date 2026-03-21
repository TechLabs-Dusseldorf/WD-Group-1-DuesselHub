import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema({
    issueId: { type: Schema.Types.ObjectId, ref: "Issue", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("comment", commentSchema);