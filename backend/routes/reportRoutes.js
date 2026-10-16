import { Router } from "express";
import { getReport, downloadReport, getAnalytics } from "../controllers/reportController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, requireRole("admin"));

router.get("/analytics", getAnalytics);
router.get("/", getReport);
router.get("/download", downloadReport);

export default router;
