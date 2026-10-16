import { Router } from "express";
import { getSettings, replaceSettings } from "../controllers/settingsController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";

const router = Router();

router
  .route("/")
  .get(protect, getSettings)
  .put(protect, requireRole("admin"), replaceSettings)
  .all(methodNotAllowed("GET, PUT"));

export default router;
