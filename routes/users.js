import express from "express";
import { connectToDB, connection } from "../conectDB.js";

const router = express.Router();

const from = "users";
await connectToDB();
// Endpoint GET dla pobierania uzytkownikow
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

// Endpoint GET dla pobierania pojedynczego uzytkownika
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const sql = await connection.query(
      `SELECT * FROM public.${from} WHERE id = ${id};`
    );
    const result = sql.rows.map((item) => ({
      id: item[0],
      name: item[1],
      surname: item[2],
      email: item[3],
    }));

    if (sql) {
      res.json(result);
    } else {
      res.status(404).json({ error: "Uzytkownik nie został znaleziony" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Błąd serwera", details: error.message });
  }
});

// Endpoint POST dla dodawania nowego uzytkownika
router.post("/", async (req, res) => {
  const { name, surname, email, password } = req.body;

  if (!name || !surname || !email) {
    return res.status(400).json({ error: "Brak wymaganych danych" });
  }
  try {
    await connection.query(
      `INSERT INTO public.${from} (name, surname, email, password) VALUES ('${name}', '${surname}', '${email}', '${password}')`
    );
    res.json({ message: "Uzytkownik dodany pomyślnie" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Błąd serwera", error });
  }
});

// Endpoint DELETE dla usuwania Uzytkownika
router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const connection = await connectToDB();
    const result = await connection.query(
      `DELETE FROM public.${from} WHERE id = ${id};`
    );
    if (result.rowsAffected > 0) {
      res.json({ message: "Uzytkownik został pomyślnie usunięty" });
    } else {
      res.status(404).json({ error: "Uzytkownik nie został znaleziony" });
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
    surname: item[2],
    email: item[3],
  }));
  return result;
}

export default router;
