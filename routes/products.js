import express from "express";
import { connectToDB, connection } from "../conectDB.js";

const router = express.Router();

const from = "products";
await connectToDB();
// Endpoint GET dla pobierania produktów
router.get("/", async (req, res) => {
  try {
    console.log("laczenie...");
    const data = await getAll(from, connection);
    res.json(data);
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
    }));

    if (sql) {
      res.json(result);
    } else {
      res.status(404).json({ error: "Produkt nie został znaleziony" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Błąd serwera", details: error.message });
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
      `INSERT INTO public.${from} (id, name, price) VALUES (${id}, '${name}', ${price})`
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

//pobieranie danych
async function getAll(from, connection) {
  console.log("pobieram dane");
  const sql = `SELECT * FROM public.${from};`;
  const res = await connection.query(sql);
  const result = res.rows.map((item) => ({
    id: item[0],
    name: item[1],
    price: item[2],
  }));
  return result;
}

export default router;

// //dodawanie rekordu do tabeli
// async function insertOne(tableName, data) {
//   const query = `
//     INSERT INTO public.${tableName} (id, name, surname, e_mail)
//     VALUES (${data.id}, '${data.name}', '${data.surname}', '${data.e_mail}');
//   `;
//   const res = await connection.query(query);
// }

// //update rekordu
// async function update(tableName, dataUpdate) {
//   if (!tableName.id) return null;

//   const query = `
//         UPDATE public.${tableName} SET brand = '$1', model = '$2' WHERE id ='$3'
//     `;

//   await client.query(query, [tableName.name, tableName.surname, tableName.id]);
// }
