import { Router } from "express";
import { getCertificate } from "../controllers/applicationController.js";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";

const router = Router();

router
  .route("/:year/:seq")
  .get(getCertificate)
  .all(methodNotAllowed("GET"));

export default router;
