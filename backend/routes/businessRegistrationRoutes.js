import { Router } from "express";
import { getBusinessRegistration } from "../controllers/etradeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";

const router = Router();

router.use(protect);

router
  .route("/:tin")
  .get(getBusinessRegistration)
  .all(methodNotAllowed("GET"));

export default router;
