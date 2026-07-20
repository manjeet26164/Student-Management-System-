const pdfParse = require("pdf-parse");
const KnowledgeChunk = require("../models/KnowledgeChunk");
const { embedText } = require("../services/geminiEmbeddings");

const VALID_ROLES = ["student", "faculty", "admin"];
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;

function chunkText(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks = [];
  let start = 0;

  while (start < clean.length) {
    const end = Math.min(start + CHUNK_SIZE, clean.length);
    chunks.push(clean.slice(start, end));
    if (end === clean.length) break;
    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

function parseRoles(rawRoles) {
  const list = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
  const roles = list.filter((r) => VALID_ROLES.includes(r));
  return roles.length > 0 ? roles : VALID_ROLES; 
}

// POST /api/admin/knowledge  (multipart: file=<pdf>, roles=<checked roles>)
const uploadKnowledgeDoc = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "PDF file is required (field name: file)" });
  }

  const roles = parseRoles(req.body.roles);
  const sourceFile = req.file.originalname;

  const parsed = await pdfParse(req.file.buffer);
  const chunks = chunkText(parsed.text).filter((c) => c.trim());

  if (chunks.length === 0) {
    return res.status(400).json({ message: "No extractable text found in this PDF" });
  }

  // Re-upload of the same filename replaces its old chunks entirely
  await KnowledgeChunk.deleteMany({ sourceFile });

  const docs = [];
  for (const text of chunks) {
    const embedding = await embedText(text);
    docs.push({ sourceFile, page: null, text, embedding, roles });
  }
  await KnowledgeChunk.insertMany(docs);

  return res.status(201).json({
    message: `${sourceFile} ingested: ${docs.length} chunks`,
    sourceFile,
    roles,
    chunkCount: docs.length,
  });
};

// GET /api/admin/knowledge — one row per source file, roles + chunk count
const listKnowledgeDocs = async (req, res) => {
  const summary = await KnowledgeChunk.aggregate([
    {
      $group: {
        _id: "$sourceFile",
        roles: { $first: "$roles" },
        chunkCount: { $sum: 1 },
        uploadedAt: { $min: "$createdAt" },
      },
    },
    { $sort: { uploadedAt: -1 } },
  ]);

  return res.json(
    summary.map((doc) => ({
      sourceFile: doc._id,
      roles: doc.roles,
      chunkCount: doc.chunkCount,
      uploadedAt: doc.uploadedAt,
    }))
  );
};

const updateKnowledgeDocRoles = async (req, res) => {
  const { sourceFile } = req.params;
  const roles = parseRoles(req.body.roles);

  const result = await KnowledgeChunk.updateMany({ sourceFile }, { $set: { roles } });

  if (result.matchedCount === 0) {
    return res.status(404).json({ message: `No document found for sourceFile "${sourceFile}"` });
  }

  return res.json({ message: `Roles updated for ${sourceFile}`, sourceFile, roles });
};

// DELETE /api/admin/knowledge/:sourceFile
const deleteKnowledgeDoc = async (req, res) => {
  const { sourceFile } = req.params;
  const result = await KnowledgeChunk.deleteMany({ sourceFile });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: `No document found for sourceFile "${sourceFile}"` });
  }

  return res.json({ message: `${sourceFile} removed (${result.deletedCount} chunks deleted)` });
};

module.exports = { uploadKnowledgeDoc, listKnowledgeDocs, updateKnowledgeDocRoles, deleteKnowledgeDoc };