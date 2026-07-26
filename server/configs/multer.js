import multer from "multer";

// Memory storage works on Vercel (no writable disk for uploads)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
