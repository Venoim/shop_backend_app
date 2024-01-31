import { Connection } from "postgresql-client";
import dbConfig from "./config/dbConfig.js";

// const pgPromise = pgp();
const connection = new Connection(dbConfig);
//   {
//   host: "postgre://database-shop.cri2ia2emfjm.eu-north-1.rds.amazonaws.com",
//   port: 5432,
//   user: "root",
//   password: "haslobaza1",
//   database: "postgres",
// });

const from1 = "user";
const from2 = "products";
const fromData = {
  id: (Math.random() * 1000).toFixed(0),
  name: "user4",
  surname: "user4",
  e_mail: "user4@ec.pl",
};

const connectToDB = async () => {
  // const connection = new Connection(dbConfig);
  try {
    await connection.connect();
    console.log("Jest polaczenie z BD");
    return connection;
    //.connect();
    //wysylanie danych do BD
    // const result1 = await insertOne(from1, fromData);
    // console.log(result1);
    //pobieranie danych z bd
    // let data = await getAll(from1);
    // console.log("data: ", data);
    // const data = await getAll(from2);
    // console.log("data: ", data);
    // return data;
  } catch (error) {
    console.error("Błąd połączenia z BD:", error);
  }
  // finally {
  throw error;
  //   await connection.close();
  // }
};

// async function getAll(from) {
//   console.log("pobieram dane");
//   const sql = `SELECT * FROM public.${from};`;
//   const res = await connection.query(sql);
//   return res.rows;
// }
// connectToDB();
export { connectToDB, connection };

//   const sql = `SELECT * FROM public.${from};`;
//   const res = await connection.query(sql);
//   return res.rows;
// }
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
