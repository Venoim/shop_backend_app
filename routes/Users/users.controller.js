import express from "express";
// import { getConnection } from "../../connectDB.js";
import {
  getAllUsers,
  getUserById,
  registerUser,
  checkEmailExists,
  confirmEmail,
  loginUser,
  updateUser,
  deleteUser,
} from "./users.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await getAllUsers();
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await getUserById(id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: "User not found", details: error.message });
  }
});

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await registerUser(email, password);
    res.json({ message: "User registered successfully", result });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.post("/check-email", async (req, res) => {
  const { email } = req.body;
  try {
    const exists = await checkEmailExists(email);
    res.json({ exists });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.post("/confirm-email", async (req, res) => {
  const { email, confirmationCode } = req.body;
  try {
    await confirmEmail(email, confirmationCode);
    res.json({ message: "Email confirmed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  loginUser(email, password, res);
});

router.put("/:userId", async (req, res) => {
  const userId = req.params.userId;
  const updatedUserData = req.body;
  try {
    const updatedUser = await updateUser(userId, updatedUserData);
    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const message = await deleteUser(id);
    res.json({ message });
  } catch (error) {
    res.status(404).json({ error: "User not found", details: error.message });
  }
});

export default router;
