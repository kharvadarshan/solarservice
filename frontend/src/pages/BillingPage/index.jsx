import React, { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";

const BillingPage = () => {
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.length > 0) {
      axios.post("http://localhost:5000/api/orders", { products: cart }) // no userId sent
        .then(res => setOrderDetails(res.data))
        .catch(err => {
          console.error("Order creation failed:", err);
          setOrderDetails({ error: "Failed to create order." });
        });
    } else {
      setOrderDetails({ error: "Cart empty. Please select products first." });
    }
  }, []);

  if (!orderDetails) {
    return <div>Loading bill summary...</div>;
  }

  if (orderDetails.error) {
    return <div>Error: {orderDetails.error}</div>;
  }

  return (
    <div className="billing-page">
      <h2>Bill Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Product</th><th>Quantity</th><th>Unit Price (₹)</th><th>Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {orderDetails.items.map(item => (
            <tr key={item.productId || item.name}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.price}</td>
              <td>{item.total}</td>
            </tr>
          ))}
          <tr>
            <td colSpan="3" style={{ textAlign: "right" }}>Installation Cost</td>
            <td>₹{10000}</td>
          </tr>
        </tbody>
      </table>
      <div className="total-cost">
        <b>Total: ₹{orderDetails.total}</b>
      </div>
      <button className="payment-btn">Proceed to Payment</button>
    </div>
  );
};

export default BillingPage;
