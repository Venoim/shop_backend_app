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

    // Oblicz łączną kwotę zamówienia
    // const totalAmount = cartItems.reduce(
    //   (total, item) => total + item.price * item.quantity,
    //   0
    // );
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
    const userId = req.params.userId; // Pobierz id użytkownika z parametru żądania
    // Wykonaj zapytanie SQL, aby pobrać zamówienia dla danego użytkownika
    const ordersQuery = `
      SELECT * FROM orders
      WHERE user_id = ${userId};
    `;
    const ordersResult = await connection.query(ordersQuery, [userId]);
    const orders = ordersResult.rows;

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
