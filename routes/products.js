import express from "express";
import { connectToDB, connection } from "../connectDB.js";

const router = express.Router();

const from = "products";
await connectToDB();

// Endpoint GET dla pobierania wszystkich produktów
router.get("/", async (req, res) => {
  try {
    const { limit, page } = req.query;

    let query = `SELECT * FROM public.${from}`;
    const countQuery = `SELECT COUNT(*) FROM public.${from}`;

    // Jeśli nie ma limitu, nie dodawaj ograniczenia LIMIT
    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    }

    // Jeśli jest podana strona i limit, oblicz offset
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
      imgUrl: item[5],
    }));

    const countResult = await connection.query(countQuery);
    const totalProducts = countResult.rows[0];

    res.json({
      data,
      totalProducts,
    });
  } catch (error) {
    res.status(500).json({
      error: "Błąd serwera",
      details: error.message,
    });
  }
});

// Endpoint GET dla pobierania pojedynczego produktu
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const sql = await connection.query(
      `SELECT * FROM public.${from} WHERE id = ${id};`
    );
    const result = sql.rows.map((item) => ({
      id: item[0],
      name: item[1],
      price: item[2],
      category: item[3],
      description: item[4],
      imgUrl: item[5],
    }));

    if (sql) {
      res.json({
        result,
      });
    } else {
      res.status(404).json({ error: "Produkt nie został znaleziony" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Błąd serwera", details: error.message });
  }
});
// Endpoint GET dla pobierania według kategorii
router.get("/category/:categoryId", async (req, res) => {
  const categoryId = req.params.categoryId;
  const { limit, page } = req.query;

  try {
    let query = `SELECT * FROM public.${from}`;
    if (categoryId !== "null") {
      // Sprawdzenie, czy categoryId nie jest puste
      query += ` WHERE "categoriesId" = ${categoryId}`;
    } else {
      // Obsługa przypadku, gdy categoryId jest puste
      query += ` WHERE "categoriesId" IS NULL`;
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
      imgUrl: item[5],
    }));

    // Dodaj kod do pobrania całkowitej liczby produktów dla danej kategorii
    let countQuery = `SELECT COUNT(*) FROM public.${from}`;
    if (categoryId !== "null") {
      // Sprawdzenie, czy categoryId nie jest puste
      countQuery += ` WHERE "categoriesId" = ${categoryId}`;
    } else {
      // Obsługa przypadku, gdy categoryId jest puste
      countQuery += ` WHERE "categoriesId" IS NULL`;
    }
    const countResult = await connection.query(countQuery);
    const totalProducts = countResult.rows[0][0];
    res.json({
      data,
      totalProducts,
    });
  } catch (error) {
    res.status(500).json({
      error: "Błąd serwera",
      details: error.message,
    });
  }
});

// Endpoint POST dla dodawania nowego produktu
router.post("/", async (req, res) => {
  const { id, name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "Brak wymaganych danych" });
  }
  if (price <= 0) {
    return res.status(400).json({ error: "dane sa nie poprawne" });
  }

  try {
    await connection.query(
      `INSERT INTO public.${from} (id, name, price) VALUES (${id}, '${name}', ${price});`
    );
    res.json({ message: "Produkt dodany pomyślnie" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Błąd serwera", error });
  }
});

// Endpoint DELETE dla usuwania produktu
router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const connection = await connectToDB();
    const result = await connection.query(
      `DELETE FROM public.${from} WHERE id = ${id};`
    );
    if (result.rowsAffected > 0) {
      res.json({ message: "Produkt został pomyślnie usunięty" });
    } else {
      res.status(404).json({ error: "Produkt nie został znaleziony" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Błąd serwera", details: error.message });
  }
});

export default router;
