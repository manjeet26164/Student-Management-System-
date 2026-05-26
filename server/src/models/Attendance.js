const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    present: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
