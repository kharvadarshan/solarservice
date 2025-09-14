const express = require("express");
const router = express.Router();
const Product = require("../../Models/Product"); // Path to Product model

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products); // Return array of products
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// CREATE NEW PRODUCT (for admin or seeding)
router.post("/", async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock } = req.body;

    // Basic validation
    if (!name || !price) {
      return res.status(400).json({ error: "Product name and price required" });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      imageUrl,
      stock,
    });

    await product.save();
    res.status(201).json(product);

  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

// OPTIONAL: GET SINGLE PRODUCT BY ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

module.exports = router;
