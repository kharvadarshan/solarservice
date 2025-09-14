const Order = require("../../Models/Order");
const Product = require("../../Models/Product");

exports.createOrder = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    // Get product info and calculate totals
    const items = await Promise.all(products.map(async (item) => {
      const prod = await Product.findById(item.productId);
      if (!prod) throw new Error(`Product not found for id: ${item.productId}`);
      return {
        productId: prod._id,
        name: prod.name,
        quantity: item.quantity,
        price: prod.price,
        total: prod.price * item.quantity,
      };
    }));

    const installationFee = 5000;
    const total = items.reduce((sum, item) => sum + item.total, 0) + installationFee;

    // Make user field optional
    const newOrder = {
      products: items.map(({ productId, quantity }) => ({ productId, quantity })),
      total,
      installationFee,
      installService: true,
      status: "pending",
      createdAt: new Date(),
    };

    // If userId is included in request, use it; otherwise skip
    if (req.body.userId) {
      newOrder.user = req.body.userId;
    }

    // Optionally add anonymous name/email here if you want to track
    // if (req.body.name) newOrder.name = req.body.name;
    // if (req.body.email) newOrder.email = req.body.email;

    const order = new Order(newOrder);
    await order.save();

    res.json({ order, items, total, installationFee });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};
