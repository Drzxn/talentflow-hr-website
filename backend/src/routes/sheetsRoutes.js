import express from "express";

import {
  getDashboardData,
  getHospitalityData,
} from "../services/googleSheetsService.js";

const router = express.Router();

/* HEALTH */

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Sheets route working",
  });
});

/* DASHBOARD */

router.get("/dashboard", async (req, res) => {
  try {
    const data = await getDashboardData();

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.log("DASHBOARD API ERROR:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* HOSPITALITY */

router.get("/hospitality", async (req, res) => {
  try {
    const data = await getHospitalityData();

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.log("HOSPITALITY API ERROR:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;