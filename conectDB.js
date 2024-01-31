import { Connection } from "postgresql-client";
import dbConfig from "./config/dbConfig.js";

const connection = new Connection(dbConfig);

const from1 = "user";
const from2 = "products";
const fromData = {
  id: (Math.random() * 1000).toFixed(0),
  name: "user4",
  surname: "user4",
  e_mail: "user4@ec.pl",
};

const connectToDB = async () => {
  try {
    await connection.connect();
    console.log("Jest polaczenie z BD");
    return connection;
  } catch (error) {
    console.error("Błąd połączenia z BD:", error);
  }
  throw error;
};

export { connectToDB, connection };
