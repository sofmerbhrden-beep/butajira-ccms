import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) =>
    cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});

const ALLOWED_MIMES = new Set([
  "image/jpeg", "image/png", "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function fileFilter(req, file, cb) {
  if (ALLOWED_MIMES.has(file.mimetype)) return cb(null, true);
  cb(new Error("Only JPG, PNG, WEBP, PDF or DOCX files are allowed"));
}

export const uploadDocuments = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "photo", maxCount: 1 },
  { name: "education", maxCount: 1 },
  { name: "competency", maxCount: 1 },
  { name: "tradeLicense", maxCount: 1 },
  { name: "faydaFront", maxCount: 1 },
  { name: "faydaBack", maxCount: 1 },
  { name: "existingCertificate", maxCount: 1 },
  { name: "others", maxCount: 10 },
]);
