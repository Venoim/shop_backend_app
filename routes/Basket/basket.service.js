import { connection } from "../../connectDB.js";

const from = "basket";
const user = "users";
const product = "products";

export const addToBasket = async (userId, productId, quantity) => {
  const userQuery = `SELECT * FROM public.${user} WHERE id = ${userId}`;
  const productQuery = `SELECT * FROM public.${product} WHERE id = ${productId}`;
  const userResult = await connection.query(userQuery);
  const productResult = await connection.query(productQuery);

  if (userResult.rows.length === 0) {
    throw new Error("User not found");
  }

  if (productResult.rows.length === 0) {
    throw new Error("Product not found");
  }

  const checkProductQuery = `SELECT * FROM public.${from} WHERE user_id = ${userId} AND product_id = ${productId}`;
  const checkProductResult = await connection.query(checkProductQuery);

  if (checkProductResult.rows.length > 0) {
    const updateQuantityQuery = `UPDATE public.${from} SET quantity = quantity + 1 WHERE user_id = ${userId} AND product_id = ${productId}`;
    await connection.query(updateQuantityQuery);
    return "Product quantity updated in basket";
  }

  const insertQuery = `INSERT INTO public.${from} (user_id, product_id, quantity) VALUES (${userId}, ${productId}, ${quantity})`;
  await connection.query(insertQuery);
  return "Product added to basket successfully";
};

export const removeFromBasket = async (basketId) => {
  const deleteQuery = `DELETE FROM public.${from} WHERE basket_id = ${basketId}`;
  await connection.query(deleteQuery);
  return "Product removed from basket successfully";
};

export const updateBasket = async (basketId, newQuantity) => {
  const updateQuery = `UPDATE public.${from} SET quantity = ${newQuantity} WHERE basket_id = ${basketId}`;
  await connection.query(updateQuery);
  return "Basket updated successfully";
};

export const getBasketItems = async (userId) => {
  const query = `
    SELECT ${from}.basket_id, products.name, products.price, ${from}.quantity
    FROM public.${from}
    INNER JOIN products ON ${from}.product_id = products.id
    WHERE ${from}.user_id = ${userId}
  `;
  const result = await connection.query(query);
  return result.rows.map((item) => ({
    id: item[0],
    name: item[1],
    price: item[2],
    quantity: item[3],
  }));
};
