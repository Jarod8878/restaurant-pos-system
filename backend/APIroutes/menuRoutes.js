const express = require("express");
const {
  getMenuItems,
  getCategories,
  addMenuItem,
  flagMenuItem,
  deleteMenuItem,
  updateStock,
  updateMenuItem
} = require("../controller/menuBackendController");

const router = express.Router();

// 📌 Fetch menu items and categories
router.get("/", getMenuItems);
router.get("/categories", getCategories);

// 📌 Admin actions
router.post("/menu-items", addMenuItem);
router.put("/menu-items/:itemId/flag", flagMenuItem);
router.delete("/menu-items/:itemId", deleteMenuItem);
router.put('/menu-items/:itemId/stock', updateStock);
router.put('/menu-items/:itemId', updateMenuItem);

module.exports = router;
