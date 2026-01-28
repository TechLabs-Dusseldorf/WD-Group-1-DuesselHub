const mongoose = require("mongoose");
const { Schema } = mongoose;

const dusseldorfPostalCodes = ["40210",
  "40211", "40212", "40213", "40215", "40217", "40219",
  "40221", "40223", "40225", "40227", "40229", "40231",
  "40233", "40235", "40237", "40239", "40468", "40470",
  "40472", "40474", "40476", "40477", "40479", "40489",
  "40545", "40547", "40549", "40589", "40591", "40593",
  "40595", "40597", "40599", "40625", "40627", "40629"];

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

  address: {
  streetName: {
    type: String,
    required: true
  },
  streetNumber: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true,
    enum: {
      values: dusseldorfPostalCodes,
      message: "Postal code is not from Düsseldorf, please try again!"
  }
},

description: {
    type: String,
    required: true,
    minlength: 40,
    maxlength: 250
  },

  upVote: {
    type: Number,
    default: 0,
    min: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

  photo: {
    type: String
    required: false
  }
});

module.exports = mongoose.model("Issue", issueSchema);
