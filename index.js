const http = require("http");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.status(200).send("Hello Word!");
});

app.listen(8080, () => {
  console.log("serwer start");
});
