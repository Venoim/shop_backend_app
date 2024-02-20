import express from "express";
import { connectToDB, connection } from "../conectDB.js";

const router = express.Router();

const from = "orders";
const user = "users";
const product = "products";
const cart = "basket";

await connectToDB();

// Endpoint do przeniesienia produktów z koszyka do zamówienia
router.post("/checkout", async (req, res) => {
  try {
    const { user_id } = req.body; // Pobierz id użytkownika z ciała żądania
    // Pobierz produkty z koszyka użytkownika
    const cartItemsQuery = `
    SELECT * FROM ${cart}
    WHERE user_id = ${user_id};
  `;
    const cartItemsResult = await connection.query(cartItemsQuery);
    const cartItems = cartItemsResult.rows;

    // Jeśli koszyk jest pusty, zwróć odpowiedź
    if (cartItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Koszyk jest pusty" });
    }

    const orderId = generateRandomId(8);
    // Przeniesienie produktów z koszyka do zamówienia
    const addOrderQuery = `
        INSERT INTO ${from} (order_id, user_id, product_id, quantity, total_price)
        SELECT '${orderId}', ${user_id}, product_id, quantity, (SELECT price FROM ${product} WHERE id = ${cart}.product_id) * quantity
        FROM ${cart}
        WHERE user_id = ${user_id};
      `;
    await connection.query(addOrderQuery);

    // Wyczyszczenie koszyka użytkownika
    const clearCartQuery = `
        DELETE FROM ${cart}
        WHERE user_id = ${user_id};
      `;
    await connection.query(clearCartQuery);

    res
      .status(201)
      .json({ success: true, message: "Zamówienie zostało złożone pomyślnie" });
  } catch (error) {
    console.error("Error checking out:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Endpoint do pobierania wszystkich zamówień użytkownika
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const ordersQuery = `
    SELECT 
    ${from}.order_id,
    ${from}.product_id,
    ${product}.name,
    ${from}.quantity,
    ${from}.total_price,
    ${from}.order_date
  FROM ${from}
  JOIN ${product} ON ${from}.product_id = ${product}.id
  WHERE ${from}.user_id = ${userId};
    `;
    const ordersResult = await connection.query(ordersQuery);
    const orders = ordersResult.rows.map((order) => ({
      order_id: order[0],
      product_id: order[1],
      product_name: order[2],
      quantity: order[3],
      total_price: order[4],
      order_date: order[5],
    }));

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

function generateRandomId(length) {
  let result = "";
  const characters = "0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export default router;
