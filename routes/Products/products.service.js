import { getConnection } from "../../connectDB.js";

const from = "products";

export const getAllProducts = async (limit, page) => {
  try {
    const connection = await getConnection();
    let query = `SELECT * FROM public.${from}`;
    const countQuery = `SELECT COUNT(*) FROM public.${from}`;

    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    }

    if (page && limit) {
      const offset = (parseInt(page) - 1) * parseInt(limit);
      query += ` OFFSET ${offset}`;
    }

    const result = await connection.query(query);
    const data = result.rows.map((item) => ({
      id: item[0],
      name: item[1],
      price: item[2],
      category: item[3],
      imgUrl: item[4],
    }));

    const countResult = await connection.query(countQuery);
    const totalProducts = countResult.rows[0][0];

    return { data, totalProducts };
  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }
};

export const getProductById = async (id) => {
  try {
    const connection = await getConnection();
    const sql = await connection.query(
      `SELECT * FROM public.${from} WHERE id = ${id};`
    );
    if (sql.rows.length > 0) {
      const result = sql.rows.map((item) => ({
        id: item[0],
        name: item[1],
        price: item[2],
        category: item[3],
        imgUrl: item[4],
        description: item[5],
      }));
      return result;
    } else {
      throw new Error("Product not found");
    }
  } catch (error) {
    throw new Error(`Error fetching product: ${error.message}`);
  }
};

export const getProductsByCategory = async (categoryId, limit, page) => {
  try {
    const connection = await getConnection();
    let query = `SELECT * FROM public.${from}`;

    if (categoryId !== "null") {
      query += ` WHERE "category_id" = ${categoryId}`;
    } else {
      query += ` WHERE "category_id" IS NULL`;
    }
    if (limit && page) {
      const offset = (parseInt(page) - 1) * parseInt(limit);
      query += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;
    }

    const result = await connection.query(query);
    const data = result.rows.map((item) => ({
      id: item[0],
      name: item[1],
      price: item[2],
      category: item[3],
      imgUrl: item[4],
    }));
    console.log(data);
    let countQuery = `SELECT COUNT(*) FROM public.${from}`;

    if (categoryId !== "null") {
      countQuery += ` WHERE "category_id" = ${categoryId}`;
    } else {
      countQuery += ` WHERE "category_id" IS NULL`;
    }

    const countResult = await connection.query(countQuery);
    const totalProducts = countResult.rows[0][0];

    return { data, totalProducts };
  } catch (error) {
    throw new Error(`Error fetching products by category: ${error.message}`);
  }
};

export const addProduct = async (id, name, price) => {
  try {
    const connection = await getConnection();
    if (!name || !price || price <= 0) {
      throw new Error("Invalid data");
    }
    await connection.query(
      `INSERT INTO public.${from} (id, name, price) VALUES (${id}, '${name}', ${price});`
    );
    return "Product added successfully";
  } catch (error) {
    throw new Error(`Error adding product: ${error.message}`);
  }
};

export const deleteProduct = async (id) => {
  try {
    const connection = await getConnection();
    const result = await connection.query(
      `DELETE FROM public.${from} WHERE id = ${id};`
    );
    if (result.rowsAffected > 0) {
      return "Product deleted successfully";
    } else {
      throw new Error("Product not found");
    }
  } catch (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
};
