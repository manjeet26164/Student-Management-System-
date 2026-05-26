const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsDir = path.join(__dirname, "../../uploads/documents");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;
    cb(null, fileName);
  },
});

const pdfOnlyFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === "application/pdf";
  const isPdfExt = path.extname(file.originalname).toLowerCase() === ".pdf";
  if (!isPdfMime && !isPdfExt) {
    return cb(new Error("Only PDF files are allowed"));
  }
  return cb(null, true);
};

const documentUpload = multer({
  storage,
  fileFilter: pdfOnlyFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

module.exports = { documentUpload };
