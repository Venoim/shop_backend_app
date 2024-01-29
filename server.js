const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3001;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200).send("Hello Word!");
});

app.post("/api/dane", (req, res) => {
  // Obsługa zapytań POST
});

app.listen(port, () => {
  console.log("serwer start");
});
