const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    credits: { type: Number, required: true },
    semester: { type: Number, required: true },
    branch: { type: String, required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
