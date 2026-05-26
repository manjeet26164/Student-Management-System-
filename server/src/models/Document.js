const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    docType: {
      type: String,
      enum: ["aadhaar", "migration", "marksheet_10", "marksheet_12", "bonafide", "nptel"],
      required: true,
    },
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    status: { type: String, enum: ["pending", "verified"], default: "pending" },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", default: null },
    verifiedAt: { type: Date, default: null },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

documentSchema.index({ student: 1, docType: 1 }, { unique: true });

module.exports = mongoose.model("Document", documentSchema);
