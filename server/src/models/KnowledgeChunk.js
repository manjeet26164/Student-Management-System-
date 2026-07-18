const mongoose = require("mongoose");

const knowledgeChunkSchema = new mongoose.Schema(
  {
    sourceFile: { type: String, required: true },
    page: { type: Number, default: null },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    roles: {
      type: [String],
      enum: ["student", "faculty", "admin"],
      default: ["student", "faculty", "admin"],
    },
  },
  { timestamps: true }
);

knowledgeChunkSchema.index({ sourceFile: 1 });

module.exports = mongoose.model("KnowledgeChunk", knowledgeChunkSchema);