import express from "express";
import { login, profile, register } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Auth route working",
  });
});

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, profile);

export default router;