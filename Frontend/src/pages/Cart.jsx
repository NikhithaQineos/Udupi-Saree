import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import { CartContext } from "../../context/cartContext";
import { useContext } from "react";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, setCartItems } = useContext(CartContext);

  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.price || 0) * (item.quantity || 1);
  }, 0);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cartItems"));
    if (storedCart) setCartItems(storedCart);
  }, [setCartItems]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const updateQuantity = (id, delta) => {
    setCartItems(prevCartItems =>
      prevCartItems
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = id => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const totals = cartItems.reduce(
    (acc, item) => {
      const { price = 0, originalPrice = 0, quantity = 1, id } = item;
      const discountPercent =
        originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

      acc.totalPrice += price * quantity;
      acc.totalDiscount += (originalPrice - price) * quantity;
      acc.discounts[id] = discountPercent;
      return acc;
    },
    { totalPrice: 0, totalDiscount: 0, discounts: {} }
  );

  // ADDED: GST total calculation
  const totalGST = cartItems.reduce((acc, item) => {
    const gstRate = item.gst || item.productgst || 0; // fallback if using 'productgst'
    const itemGST = (item.price * item.quantity * gstRate) / 100;
    return acc + itemGST;
  }, 0);

  const deliveryCharge = totals.totalPrice > 500 ? 0 : 30;
  // const platformFee = 3;
  const finalAmount = totals.totalPrice + deliveryCharge + totalGST;

  const clearCart = () => {
    localStorage.removeItem("cartItems");
    setCartItems([]);
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        {cartItems.length === 0 ? (
          <p className="empty-cart-message">🛒 Your cart is empty.</p>
        ) : (
          cartItems.map(({ id, image, name, price, originalPrice, quantity, gst, productgst, maxQty }) => {
            const gstRate = gst || productgst || 0;
            const gstAmount = (price * quantity * gstRate) / 100;

            return (
              <div key={id} className="cart-item">
                <img src={image} alt={name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3>{name}</h3>
                  <p className="price">
                    <span className="discounted-price">₹{(price * quantity).toFixed(2)}</span>
                    <span className="original-price">₹{(originalPrice * quantity).toFixed(2)}</span>
                    <span className="discount">
                      {(() => {
                        const offer = cartItems.find(i => i.id === id)?.offer;
                        if (!offer) return null;

                        return offer.offerType === "rupees"
                          ? `₹${offer.offerValue.toFixed(2)} Off`
                          : `${offer.offerValue}% Off`;
                      })()}
                    </span>
                  </p>

                  {/* ADDED: GST info per item */}
                  <p className="gst-text">
                    GST ({gstRate}%): ₹{gstAmount.toFixed(2)}
                  </p>

                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(id, -1)}>-</button>
                    <span>{quantity}</span>
                    <button
                      onClick={() => updateQuantity(id, 1)}
                      disabled={quantity >= (maxQty)} // fallback to 20 if maxQty missing
                      className={quantity >= (maxQty) ? "disabled-plus" : ""}
                    >
                      +
                    </button>

                  </div>
                  <button className="remove" onClick={() => removeFromCart(id)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="price-details">
          <h3>PRICE DETAILS</h3>
          <hr className="divider" />
          <div className="price-breakdown">
            <p>
              Total (after discount) <span>₹{totals.totalPrice.toFixed(2)}</span>
            </p>
            <p>
              Discount <span className="discount-text">-₹{totals.totalDiscount.toFixed(2)}</span>
            </p>
            {/* <p>
              Platform Fee <span>₹{platformFee}</span>
            </p> */}
            <p>
              Delivery Charges{" "}
              <span className="delivery-text">
                {deliveryCharge === 0 ? "Free" : `₹${deliveryCharge}`}
              </span>
            </p>
            {/* ADDED: Total GST line */}
            <p>
              GST Total <span>₹{totalGST.toFixed(2)}</span>
            </p>
          </div>
          <hr className="divider" />
          <p className="total-amount">
            <strong>Total Amount</strong> <strong>₹{finalAmount.toFixed(2)}</strong>
          </p>
          <p className="saving-text">
            You will save ₹{totals.totalDiscount.toFixed(2)} on this order
          </p>
          <button className="place-order-btn" onClick={() => navigate("/payment")}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
