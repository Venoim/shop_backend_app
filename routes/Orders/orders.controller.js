import express from "express";
import { checkout, getUserOrders } from "./orders.service.js";

const router = express.Router();

router.post("/checkout", async (req, res) => {
  try {
    const { user_id } = req.body;
    const message = await checkout(user_id);
    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Error checking out:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await getUserOrders(userId);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

export default router;
