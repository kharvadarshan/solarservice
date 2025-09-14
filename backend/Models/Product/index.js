// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: String,
//   price: { type: Number, required: true },
//   category: String,
//   imageUrl: { type: String },
//   stock: { type: Number, default: 0 },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("Product", productSchema);

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  imageUrl: String,
  category: String,
  stock: Number,
});

module.exports = mongoose.model("Product", productSchema);
