import { connection } from "../../connectDB.js";

const from = "productCategories";

export const getAllCategories = async () => {
  try {
    const sql = `SELECT * FROM public."${from}";`;
    const res = await connection.query(sql);
    return res.rows.map((item) => ({
      id: item[0],
      name: item[1],
    }));
  } catch (error) {
    throw new Error(`Error getting categories: ${error.message}`);
  }
};
