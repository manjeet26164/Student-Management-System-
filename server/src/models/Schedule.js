const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    day: { type: String, required: true },
    classes: [
      {
        time: String,
        subject: String,
        room: String,
        faculty: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
