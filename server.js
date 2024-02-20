import express from "express";
import cors from "cors";
import { port } from "./config/config.js";
import bodyParser from "body-parser";
import productsRoutes from "./routes/Products/products.controller.js";
import usersRoutes from "./routes/Users/users.controller.js";
import categoriesRoutes from "./routes/Categories/categories.controller.js";
import basketRoutes from "./routes/Basket/basket.controller.js";
import ordersRoutes from "./routes/Orders/orders.controller.js";

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use("/api/categories", categoriesRoutes);

app.use("/api/products", productsRoutes);

app.use("/api/users", usersRoutes);

app.use("/api/basket", basketRoutes);

app.use("/api/orders", ordersRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Błąd serwera server.js status:500",
  });
});

app.listen(port, () => {
  console.log("server start");
});
