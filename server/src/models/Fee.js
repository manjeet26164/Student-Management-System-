const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    semester: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueDate: { type: Date },
    status: { type: String, enum: ["paid", "partial", "pending"], default: "pending" },
    transactions: [
      {
        amount: Number,
        mode: String,
        reference: String,
        paidOn: Date,
      },
    ],
  },
  { timestamps: true }
);

feeSchema.index({ student: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model("Fee", feeSchema);
