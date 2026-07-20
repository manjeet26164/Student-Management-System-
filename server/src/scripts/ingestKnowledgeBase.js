require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mongoose = require("mongoose");
const KnowledgeChunk = require("../models/KnowledgeChunk");
const { embedText } = require("../services/geminiEmbeddings");

const KB_DIR = path.join(__dirname, "../../knowledge-base");
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;
const VALID_ROLES = ["student", "faculty", "admin"];

const ROLE_MAP = {
  // "student_fees.pdf": ["student"],
  // "faculty_leave_policy.pdf": ["faculty"],
  // "hostel_rules.pdf": ["student", "faculty", "admin"],
};

function getRolesForFile(filename) {
  const roles = ROLE_MAP[filename];
  if (!roles || roles.some((r) => !VALID_ROLES.includes(r))) return null;
  return roles;
}

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

async function run() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY missing in server/.env — add it before running ingestion.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  if (!fs.existsSync(KB_DIR)) {
    fs.mkdirSync(KB_DIR, { recursive: true });
  }

  const files = fs.readdirSync(KB_DIR).filter((f) => f.toLowerCase().endsWith(".pdf"));

  if (files.length === 0) {
    console.log(`No PDFs found in ${KB_DIR}. Drop rulebook/policy PDFs there and re-run.`);
    await mongoose.disconnect();
    return;
  }

  for (const file of files) {
    console.log(`\nProcessing ${file} ...`);
    const roles = getRolesForFile(file);
    if (!roles) {
      console.log(`  Skipping ${file} — no explicit ROLE_MAP entry (add one to ingest via this script).`);
      continue;
    }

    const buffer = fs.readFileSync(path.join(KB_DIR, file));
    const parsed = await pdfParse(buffer);
    const chunks = chunkText(parsed.text);

    await KnowledgeChunk.deleteMany({ sourceFile: file });

    for (let i = 0; i < chunks.length; i++) {
      const text = chunks[i];
      if (!text.trim()) continue;
      const embedding = await embedText(text);
      await KnowledgeChunk.create({ sourceFile: file, page: null, text, embedding, roles });
      process.stdout.write(`  chunk ${i + 1}/${chunks.length} embedded\r`);
    }
    console.log(`\n${file}: ${chunks.length} chunks saved (roles: ${roles.join(", ")})`);
  }

  console.log("\nIngestion complete.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});