import express from "express";
import { connectToDB, connection } from "../../conectDB.js";
import {
  addToBasket,
  removeFromBasket,
  updateBasket,
  getBasketItems,
} from "./basket.service.js";
const router = express.Router();

const from = "basket";
const user = "users";
const product = "products";

await connectToDB();

// Endpoint dodawanie do kosza
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // // Sprawdź, czy użytkownik i produkt istnieją w bazie danych
    // const userQuery = `SELECT * FROM public.${user} WHERE id = ${userId}`;
    // const productQuery = `SELECT * FROM public.${product} WHERE id = ${productId}`;
    // const userResult = await connection.query(userQuery);
    // const productResult = await connection.query(productQuery);

    // if (userResult.rows.length === 0) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    // if (productResult.rows.length === 0) {
    //   return res.status(404).json({ message: "Product not found" });
    // }

    // // Sprawdź, czy produkt jest już w koszyku użytkownika
    // const checkProductQuery = `SELECT * FROM public.${from} WHERE user_id = ${userId} AND product_id = ${productId}`;
    // const checkProductResult = await connection.query(checkProductQuery);

    // if (checkProductResult.rows.length > 0) {
    //   // Jeśli produkt jest już w koszyku, zwiększ jego ilość o 1
    //   const updateQuantityQuery = `UPDATE public.${from} SET quantity = quantity + 1 WHERE user_id = ${userId} AND product_id = ${productId}`;
    //   await connection.query(updateQuantityQuery);

    //   return res
    //     .status(200)
    //     .json({ message: "Product quantity updated in basket" });
    // }

    // // Jeśli produkt nie jest w koszyku, dodaj go
    // const insertQuery = `INSERT INTO public.${from} (user_id, product_id, quantity) VALUES (${userId}, ${productId}, ${quantity})`;
    // await connection.query(insertQuery);

    // res.status(201).json({ message: "Product added to basket successfully" });
    const message = await addToBasket(userId, productId, quantity);
    res.status(201).json({ message });
  } catch (error) {
    console.error("Error adding product to basket:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// usowanie
router.delete("/remove/:basketId", async (req, res) => {
  try {
    const basketId = req.params.basketId;
    const deleteQuery = `DELETE FROM public.${from} WHERE basket_id = ${basketId}`;
    await connection.query(deleteQuery);
    res
      .status(200)
      .json({ message: "Product removed from basket successfully" });
  } catch (error) {
    console.error("Error removing product from basket:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update/:basketId", async (req, res) => {
  try {
    const basketId = req.params.basketId;
    const newQuantity = req.body.quantity; // Załóżmy, że nowa ilość produktu jest przekazywana w ciele żądania
    const updateQuery = `UPDATE public.${from} SET quantity = ${newQuantity} WHERE basket_id = ${basketId}`;
    await connection.query(updateQuery);

    res.status(200).json({ message: "basket updated successfully" });
  } catch (error) {
    console.error("Error updating basket:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const query = `
      SELECT ${from}.basket_id, products.name, products.price, ${from}.quantity
      FROM public.${from}
      INNER JOIN products ON basket.product_id = products.id
      WHERE basket.user_id = ${userId}
    `;
    const result = await connection.query(query);
    const basketItems = result.rows.map((item) => ({
      id: item[0],
      name: item[1],
      price: item[2],
      quantity: item[3],
    }));

    res.status(200).json(basketItems);
  } catch (error) {
    console.error("Error fetching basket items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
