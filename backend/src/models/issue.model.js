import mongoose from "mongoose";
const { Schema } = mongoose;

const issueSchema = new Schema({

  title: {
    type: String,
    required: true,
    maxlength: 40
  },

  name: {
    type: String,
    required: true,
    minlength: 2
  },

  description: {
    type: String,
    required: true,
    minlength: 40,
    maxlength: 250
  },

location: {
  type: String,
  required: true
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