import express from "express";
// import { connectToDB, connection } from "../../conectDB.js";
import {
  addToBasket,
  removeFromBasket,
  updateBasket,
  getBasketItems,
} from "./basket.service.js";
const router = express.Router();

// await connectToDB();

router.post("/add", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const message = await addToBasket(userId, productId, quantity);
    res.status(201).json({ message });
  } catch (error) {
    console.error("Error adding product to basket:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/remove/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const message = await removeFromBasket(userId, productId);
    res.status(200).json({ message });
  } catch (error) {
    console.error("Error removing product from basket:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update/", async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const newQuantity = req.body.quantity;
    const message = await updateBasket(userId, productId, newQuantity);
    res.status(200).json({ message });
  } catch (error) {
    console.error("Error updating basket:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const basketItems = await getBasketItems(userId);
    res.status(200).json(basketItems);
  } catch (error) {
    console.error("Error fetching basket items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
