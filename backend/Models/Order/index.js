const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: Number,
  }],
  total: Number,
  installService: { type: Boolean, default: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
  // user field is optional now:
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  // Optionally, you could add anonymous info, e.g.:
  // name: String,
  // email: String
});

module.exports = mongoose.model("Order", orderSchema);
