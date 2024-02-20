import { Connection } from "postgresql-client";
import dbConfig from "./config/dbConfig.js";

const connection = new Connection(dbConfig);

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
