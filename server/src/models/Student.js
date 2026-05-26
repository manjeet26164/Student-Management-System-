const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    rollNumber: { type: String, required: true, unique: true },
    branch: { type: String, required: true },
    semester: { type: Number, required: true },
    section: { type: String, required: true },
    batch: { type: String, required: true },
    totalCredits: { type: Number, default: 0 },
    cgpa: { type: Number, default: 0 },
    backlogs: { type: Number, default: 0 },
    personalInfo: {
      phone: String,
      dob: String,
      bloodGroup: String,
    },
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },
    guardian: {
      name: String,
      relation: String,
      phone: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
