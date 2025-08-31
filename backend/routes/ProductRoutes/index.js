const express = require("express");
const router = express.Router();
const Product = require("../../Models/Product"); // Correct path with folder and index.js

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// POST (for admin/testing seeding only)
router.post("/", async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock } = req.body;
    const product = new Product({ name, description, price, category, imageUrl, stock });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

module.exports = router;
