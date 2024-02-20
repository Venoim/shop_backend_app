import express from "express";
import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  addProduct,
  deleteProduct,
} from "./products.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { limit, page } = req.query;
    const { data, totalProducts } = await getAllProducts(limit, page);
    res.json({ data, totalProducts });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const product = await getProductById(id);
    res.json({ product });
  } catch (error) {
    res
      .status(404)
      .json({ error: "Product not found", details: error.message });
  }
});

router.get("/category/:categoryId", async (req, res) => {
  const categoryId = req.params.categoryId;
  const { limit, page } = req.query;
  try {
    const { data, totalProducts } = await getProductsByCategory(
      categoryId,
      limit,
      page
    );
    res.json({ data, totalProducts });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.post("/", async (req, res) => {
  const { id, name, price } = req.body;
  try {
    const message = await addProduct(id, name, price);
    res.json({ message });
  } catch (error) {
    res.status(400).json({ error: "Bad Request", details: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const message = await deleteProduct(id);
    res.json({ message });
  } catch (error) {
    res
      .status(404)
      .json({ error: "Product not found", details: error.message });
  }
});

export default router;
