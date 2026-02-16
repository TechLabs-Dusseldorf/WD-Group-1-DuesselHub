import mongoose from 'mongoose';
const { Schema } = mongoose;

const issueSchema = new Schema({
  title: {
    type: String,
    required: [true, "Please enter a title for your report."],
    maxlength: [40, "Too long. Your title cannot be longer than 40 characters."]
  },
  name: {
  type: String,
  required: [true, "Please enter your name."],
  minlength: [2, "Please enter a name with at least 2 characters."],
  validate: {
    validator: v => /^[A-Za-z\s]+$/.test(v),
    message: "Your name cannot have numbers!"
  }
},
  description: {
  type: String,
  required: [true, "Please write your report."],
  minlength: [40, "Too short. Your report must be at least 40 characters long."],
  maxlength: [250, "Too long. Your report cannot be longer than 250 characters."],
  trim: true
},
  location: {
    type: String,
    required: [true, "Please enter the address where the issue exists."],
    maxlength: [100, "Too long. Your address cannot be longer than 100 characters."],
    trim: true
  },
  photoUrl: {
    type: String,
    required: false
  },
  endorsements: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Issue", issueSchema);