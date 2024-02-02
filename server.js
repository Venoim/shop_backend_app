import express from "express";
import cors from "cors";
import { port } from "./config/config.js";
import bodyParser from "body-parser";
import { connectToDB } from "./conectDB.js";
import productsRoutes from "./routes/products.js"; // import endpointow
import usersRoutes from "./routes/users.js";

const app = express();
app.use(cors()); // Dodaj to jako middleware
app.use(bodyParser.json());

app.use("/api/products", productsRoutes);

app.use("/api/users", usersRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Błąd serwera server.js status:500",
  });
});

app.listen(port, () => {
  console.log("serwer start");
});

//Test
// Przykładowa lista użytkowników
// const users = [
//   { id: 1, name: "Abc", surname: "QWE" },
//   { id: 2, name: "ZXC", surname: "VBN" },
// ];

// app.get("/api/users", (req, res) => {
//   res.json(users);
// });
