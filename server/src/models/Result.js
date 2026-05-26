const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    semester: { type: Number, required: true },
    subjects: [
      {
        subjectCode: String,
        subjectName: String,
        credits: Number,
        grade: String,
        marks: Number,
      },
    ],
    sgpa: { type: Number, default: 0 },
    cgpa: { type: Number, default: 0 },
  },
  { timestamps: true }
);

resultSchema.index({ student: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model("Result", resultSchema);
