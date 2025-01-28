const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema({
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  time: {
    type: Date,
    required: true,
    default: Date.now, // Automatically set current timestamp
  },
});

module.exports = mongoose.model("Data", DataSchema);
