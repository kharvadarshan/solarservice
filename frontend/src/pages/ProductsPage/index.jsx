// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./index.css";

// const ProductsPage = () => {
//   const [products, setProducts] = useState([]);
//   const [cart, setCart] = useState([]);

//   useEffect(() => {
//     axios.get("http://localhost:5000/api/products")
//       .then(res => {
//         if (Array.isArray(res.data)) {
//           setProducts(res.data);
//         } else {
//           setProducts([]);
//         }
//       })
//       .catch(() => setProducts([]));
//   }, []);

//   const addToCart = (product) => {
//     setCart(prev => {
//       const idx = prev.findIndex(item => item.product._id === product._id);
//       if (idx > -1) {
//         const updated = [...prev];
//         updated[idx].quantity++;
//         return updated;
//       }
//       return [...prev, { product, quantity: 1 }];
//     });
//   };

//   const removeFromCart = (productId) => {
//     setCart(prev => prev.filter(item => item.product._id !== productId));
//   };

//   const checkout = () => {
//     alert("Checkout feature coming soon!");
//   };

//   return (
//     <div className="products-page">
//       <div className="products-list">
//         <h2>Solar Products</h2>
//         <div className="product-grid">
//           {products.length > 0 ? (
//             products.map(product => (
//               <div className="product-card" key={product._id}>
//                 <img
//                   src={product.imageUrl || "/default-product.jpg"}
//                   alt={product.name}
//                   className="product-image"
//                 />
//                 <h3>{product.name}</h3>
//                 <p>{product.description}</p>
//                 <span className="product-price">₹{product.price}</span>
//                 <button onClick={() => addToCart(product)}>Add to Cart</button>
//               </div>
//             ))
//           ) : (
//             <p>No products available.</p>
//           )}
//         </div>
//       </div>

//       <div className="cart-section">
//         <h3>Your Cart</h3>
//         {cart.length === 0 ? (
//           <div className="cart-empty">Cart is empty</div>
//         ) : (
//           <ul className="cart-items">
//             {cart.map(item => (
//               <li key={item.product._id} className="cart-item">
//                 <span>{item.product.name} x {item.quantity}</span>
//                 <span>₹{item.product.price * item.quantity}</span>
//                 <button onClick={() => removeFromCart(item.product._id)}>Remove</button>
//               </li>
//             ))}
//           </ul>
//         )}
//         <button
//           onClick={checkout}
//           disabled={cart.length === 0}
//           className="checkout-btn"
//         >
//           Checkout
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ProductsPage;





import React, { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/products")
      .then(res => {
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setProducts([]));
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product._id === product._id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity++;
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
  };

  const increaseQuantity = (productId) => {
    setCart(prev =>
      prev.map(item =>
        item.product._id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setCart(prev =>
      prev.map(item =>
        item.product._id === productId
          ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
          : item
      )
    );
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const checkout = () => {
    alert("Checkout feature coming soon!");
  };
 console.log("Products from API:", products);
  return (
    <div className="products-page">
      {/* Products List */}
      <div className="products-list">
        <h2 className="page-title">🌞 Premium Solar Products</h2>
        <div className="product-grid">
          {products.length > 0 ? (
            products.map(product => (
              <div className="product-card" key={product._id}>
                <img
                  src={product.imageUrl || "/default-product.jpg"}
                  alt={product.name}
                  className="product-image"
                />
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">₹{product.price}</span>
                  <button onClick={() => addToCart(product)}>Add to Cart</button>
                </div>
              </div>
            ))
          ) : (
            <p>No products available.</p>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="cart-section">
        <h3>🛒 Your Cart</h3>
        {cart.length === 0 ? (
          <div className="cart-empty">Cart is empty</div>
        ) : (
          <>
            <ul className="cart-items">
              {cart.map(item => (
                <li key={item.product._id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.product.name}</span>
                    <div className="quantity-controls">
                      <button onClick={() => decreaseQuantity(item.product._id)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item.product._id)}>+</button>
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <span className="cart-price">₹{item.product.price * item.quantity}</span>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.product._id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Cart Total */}
            <div className="cart-total">
              <span>Total:</span>
              <strong>₹{getTotal()}</strong>
            </div>
          </>
        )}

        <button
          onClick={checkout}
          disabled={cart.length === 0}
          className="checkout-btn"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default ProductsPage;

