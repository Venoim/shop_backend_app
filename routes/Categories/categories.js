import express from "express";
import { connectToDB, connection } from "../../conectDB.js";

const router = express.Router();

const from = "productCategories";

await connectToDB();

// Endpoint GET dla pobierania Kategorii
router.get("/", async (req, res) => {
  try {
    console.log("laczenie...");
    const data = await getAll(from, connection);
    console.log(data);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Błąd serwera",
      details: error.message,
    });
  }
});

async function getAll(from, connection) {
  console.log("pobieram dane");
  const sql = `SELECT * FROM public."${from}";`;
  const res = await connection.query(sql);
  console.log("ladowanie listy kategori");
  const result = res.rows.map((item) => ({
    id: item[0],
    name: item[1],
  }));
  return result;
}

export default router;
