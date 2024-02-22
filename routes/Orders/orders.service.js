import { getConnection } from "../../connectDB.js";

const from = "orders";
const user = "users";
const product = "products";
const cart = "basket";

export const checkout = async (userId) => {
  try {
    const connection = await getConnection();
    const cartItemsQuery = `SELECT * FROM ${cart} WHERE user_id = ${userId}`;
    const cartItemsResult = await connection.query(cartItemsQuery);
    const cartItems = cartItemsResult.rows;

    if (cartItems.length === 0) {
      throw new Error("Koszyk jest pusty");
    }

    const orderId = generateRandomId(8);

    const addOrderQuery = `
      INSERT INTO ${from} (order_id, user_id, product_id, quantity, total_price)
      SELECT '${orderId}', ${userId}, product_id, quantity, (SELECT price FROM ${product} WHERE id = ${cart}.product_id) * quantity
      FROM ${cart}
      WHERE user_id = ${userId};
    `;
    await connection.query(addOrderQuery);

    const clearCartQuery = `DELETE FROM ${cart} WHERE user_id = ${userId}`;
    await connection.query(clearCartQuery);

    return "Zamówienie zostało złożone pomyślnie";
  } catch (error) {
    throw new Error(`Error checking out: ${error.message}`);
  }
};

export const getUserOrders = async (userId) => {
  const connection = await getConnection();
  try {
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
    return ordersResult.rows.map((order) => ({
      order_id: order[0],
      product_id: order[1],
      product_name: order[2],
      quantity: order[3],
      total_price: order[4],
      order_date: order[5],
    }));
  } catch (error) {
    throw new Error(`Error fetching orders: ${error.message}`);
  }
};

function generateRandomId(length) {
  let result = "";
  const characters = "0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
