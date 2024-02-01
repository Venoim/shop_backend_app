import express from "express";
import bodyParser from "body-parser";
import { connectToDB } from "./conectDB.js";
import productsRoutes from "./routes/products.js"; // import endpointow
import usersRoutes from "./routes/users.js";

const app = express();
const port = 3001;

app.use(bodyParser.json());

app.use("/api/products", productsRoutes);

app.use("/api/users", usersRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Błąd serwera server.js status:500" });
});

app.listen(port, () => {
  console.log("serwer start");
});

// app.get("/api/products", (req, res) => {
//   res.status(200).send("Hello Word!");
// });

// app.post("/", (req, res) => {
//   // Obsługa zapytań POST
// });

// app.listen(port, () => {
//   console.log("serwer start");
// });
