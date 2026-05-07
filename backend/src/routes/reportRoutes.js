import express from "express";
import {
  createPosition,
  getDepartmentReports,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getDepartmentReports);
router.post("/", protect, createPosition);

export default router;  