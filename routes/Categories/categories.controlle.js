import express from "express";
import { getAllCategories } from "./categories.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

export default router;
