import express from "express";
import { Connection } from "postgresql-client";

const app = express();
const port = 3001;

const connection = new Connection({
  host: "postgre://database-shop.cri2ia2emfjm.eu-north-1.rds.amazonaws.com",
  port: 5432,
  user: "root",
  password: "haslobaza1",
  database: "postgres",
});

const from1 = "user";
const from2 = "products";
const fromData = {
  id: (Math.random() * 1000).toFixed(0),
  name: "user4",
  surname: "user4",
  e_mail: "user4@ec.pl",
};

const dataUpdate = (async () => {
  try {
    await connection.connect();
    console.log("Nawiązano połączenie");
    //wysylanie danych do BD
    // const result1 = await insertOne(from1, fromData);
    // console.log(result1);
    //pobieranie danych z bd
    // let data = await getAll(from1);
    // console.log("data: ", data);

    data = await getAll(from2);
    console.log("data: ", data);
  } catch (error) {
    console.error("Błąd połączenia:", error);
  } finally {
    await connection.close();
  }
})();

app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});

//pobieranie danych
async function getAll(from) {
  console.log("pobieram dane");
  app.get("/products", (req, res) => {
    const sql = `SELECT * FROM public.${from};`;
    connection.query(sql);
    res.status(200).send(res.rows);
    res.json(res.rows);
  });

  const sql = `SELECT * FROM public.${from};`;
  const res = await connection.query(sql);
  return res.rows;
}
//dodawanie rekordu do tabeli
async function insertOne(tableName, data) {
  const query = `
    INSERT INTO public.${tableName} (id, name, surname, e_mail)
    VALUES (${data.id}, '${data.name}', '${data.surname}', '${data.e_mail}');
  `;
  const res = await connection.query(query);
}

//update rekordu
async function update(tableName, dataUpdate) {
  if (!tableName.id) return null;

  const query = `
        UPDATE public.${tableName} SET brand = '$1', model = '$2' WHERE id ='$3'
    `;

  await client.query(query, [tableName.name, tableName.surname, tableName.id]);
}
