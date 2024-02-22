import { Connection } from "postgresql-client";
import dbConfig from "./config/dbConfig.js";

const connection = new Connection(dbConfig);

const getConnection = async () => {
  try {
    await connection.connect();
    return connection;
  } catch (error) {
    console.error("Błąd połączenia z BD:", error);
    throw error;
  }
};

export { getConnection };
