const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Product = require("../Models/Product");

// ✅ Seed Data with working Unsplash image URLs
const products = [
  {
    name: "Solar Panel 300W",
    description: "High efficiency solar panel.",
    price: 25000,
    category: "Panels",
    imageUrl: "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?auto=format&fit=crop&w=600&q=80",
    stock: 10
  },
  {
    name: "Solar Battery 12V",
    description: "Durable solar battery.",
    price: 12000,
    category: "Batteries",
    imageUrl: "https://images.unsplash.com/photo-1603791445824-0050bd436b3f?auto=format&fit=crop&w=600&q=80",
    stock: 15
  },
  {
    name: "Solar Inverter",
    description: "Reliable inverter.",
    price: 18000,
    category: "Inverters",
    imageUrl: "https://images.unsplash.com/photo-1581091215367-59ab6b8b7b2d?auto=format&fit=crop&w=600&q=80",
    stock: 8
  }
];

async function seedProducts() {
  try {
    // ✅ Make sure this matches your .env
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB:", process.env.MONGO_URI);

    await Product.deleteMany();
    console.log("🗑️ Cleared old products.");

    await Product.insertMany(products);
    console.log("🌱 Seeded products!");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seedProducts();
