import express from "express";
import connectToDB from "./conectDB";

const app = express();
const port = 3001;

app.use(express.json());

app.get("/api/products", (req, res) => {
  res.status(200).send("Hello Word!");
});

app.post("/", (req, res) => {
  // Obsługa zapytań POST
});

app.listen(port, () => {
  console.log("serwer start");
});
