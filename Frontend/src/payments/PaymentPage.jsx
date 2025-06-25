import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { AiOutlineCheckCircle } from "react-icons/ai";
import "./PaymentPage.css";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../../context/cartContext";

const PaymentPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddressText, setSelectedAddressText] = useState("");
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const [formMode, setFormMode] = useState("add");
  const [editAddressId, setEditAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    pincode: "",
    address: "",
    city: "",
    state: "",
    landmark: "",
    alternatePhone: "",
    addressType: "Home",
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const baseurl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { clearCart } = useContext(CartContext);

  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem("cartItems");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  const totals = cartItems.reduce(
    (acc, item) => {
      const price = item.price || 0;
      const originalPrice = item.originalPrice || 0;
      const quantity = item.quantity || 1;
      const gstRate = item.gst || item.productgst || 0;
      const discount = (originalPrice - price) * quantity;
      const gstAmount = (price * quantity * gstRate) / 100;
      acc.totalPrice += price * quantity;
      acc.totalDiscount += discount;
      acc.totalGST += gstAmount;
      return acc;
    },
    { totalPrice: 0, totalDiscount: 0, totalGST: 0 }
  );

  // const platformFee = 3;
  const deliveryCharge = totals.totalPrice > 500 ? 0 : 30;

  const finalAmount = totals.totalPrice + totals.totalGST + deliveryCharge;

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`${baseurl}/api/getAddress/${user._id}`);
      setAddresses(res.data.add || []);
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    }
  };

  useEffect(() => {
    if (user?._id) fetchAddresses();
  }, [user?._id]);


  const handleSaveAddress = async () => {
    try {
      if (formMode === "add") {
        await axios.post(`${baseurl}/api/createAddress`, {
          userId: user._id,
          ...addressForm,
        });
        alert("Address added successfully");
      } else if (formMode === "edit" && editAddressId) {
        await axios.put(`${baseurl}/api/address/${user._id}/${editAddressId}`, addressForm);
        alert("Address updated successfully");
        setFormMode("add");
        setEditAddressId(null);
      }
      setAddressForm({
        pincode: "",
        address: "",
        city: "",
        state: "",
        landmark: "",
        alternatePhone: "",
        addressType: "Home",
      });
      fetchAddresses();
    } catch (err) {
      console.error("Failed to save address", err);
      alert("Error saving address");
    }
  };

  const handleEditClick = (addr) => {
    setAddressForm({
      pincode: addr.pincode || "",
      address: addr.address || "",
      city: addr.city || "",
      state: addr.state || "",
      landmark: addr.landmark || "",
      alternatePhone: addr.alternatePhone || "",
      addressType: addr.addressType || "Home",
    });
    setFormMode("edit");
    setEditAddressId(addr._id);
    setShowPaymentOptions(false);
  };

  const handleDeleteClick = async (addrId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await axios.delete(`${baseurl}/api/address/${user._id}/${addrId}`);
      alert("Address deleted");
      if (selectedAddressId === addrId) {
        setSelectedAddressId(null);
        setShowPaymentOptions(false);
      }
      fetchAddresses();
    } catch (err) {
      console.error("Failed to delete address", err);
      alert("Error deleting address");
    }
  };

  const handleProceedToPay = () => {
    if (!selectedAddressId) {
      alert("Please select an address before proceeding.");
      return;
    }
    const selected = addresses.find((addr) => addr._id === selectedAddressId);
    if (selected) {
      const fullAddress = `${selected.address}, ${selected.city}, ${selected.state} - ${selected.pincode}`;
      setSelectedAddressText(fullAddress);
      setShowPaymentOptions(true);
      setPaymentMethod("");
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      alert("Please select a shipping address.");
      return;
    }
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }
    const selected = addresses.find((addr) => addr._id === selectedAddressId);
    if (!selected) {
      alert("Invalid address selected.");
      return;
    }
    // Validate address fields
    if (!selected.address || !selected.city || !selected.landmark) {
      alert("Please make sure the selected address is complete.");
      return;
    }

    // Build order data
    const orderData = {
      userId: user._id,
      username: user.name || "Unknown User",
      userphone: user.phone || "0000000000",
      paymentMode: paymentMethod === "Razorpay" ? "Razorpay" : "cash on delivery",
      paymentId: "",
      shippingAddress: {
        house: selected.address,
        area: selected.city,
        landmark: selected.landmark,
      },
      total: finalAmount.toFixed(2),
      items: cartItems.map((item) => ({
        _id: item.id || item._id,
        productname: item.name || "Unnamed Product",
        productprice: String(item.price),
        productgst: String(item.productgst || 0),
        productquantity: String(item.quantity || 1),
        offer: item.offer
          ? {
            offerType: item.offer.offerType || null,
            offerValue: item.offer.offerValue || null,
            validTill: item.offer.validTill || null,
          }
          : null,
      })),
    };
    console.log("Sending orderData:", orderData);

    if (paymentMethod === "cash on delivery") {
      try {
        await axios.post(`${baseurl}/api/createorder`, orderData);
        clearCart();
        setShowSuccessDialog(true);
        setShowPaymentOptions(false);
        setSelectedAddressId(null);
        setPaymentMethod("");
        // Redirect to homepage after 2 seconds
        setTimeout(() => navigate("/"), 2000);
      } catch (err) {
        console.error("COD order failed", err.response?.data || err.message);
        alert(`Failed to place order: ${err.response?.data?.message || "Server error"}`);
      }
    } else if (paymentMethod === "Razorpay") {
      try {
        const razorpayOrderRes = await axios.post(`${baseurl}/api/create-razorpay-order`, {
          amount: Number(orderData.total) * 100,
        });

        const { orderId, currency } = razorpayOrderRes.data;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderData.total * 100,
          currency,
          name: "Saree World",
          description: "Product Purchase",
          order_id: orderId,
          handler: async function (response) {
            try {
              await axios.post(`${baseurl}/api/createorder`, {
                ...orderData,
                paymentId: response.razorpay_payment_id,
              });
              clearCart();
              setShowSuccessDialog(true);
              setSelectedAddressId(null);
              setPaymentMethod("");
              setTimeout(() => navigate("/"), 2000);
            } catch (err) {
              alert("Payment successful but order creation failed.");
            }
          },

          prefill: {
            name: orderData.username,
            contact: orderData.userphone,
          },
          theme: { color: "#b78c6a" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error("Razorpay setup failed", err.response?.data || err.message);
        alert("Unable to initiate Razorpay.");
      }
    }
  };

  const [errors, setErrors] = useState({
    pincode: "",
    alternatePhone: "",
    requiredFields: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddressForm({ ...addressForm, [name]: value });

    // Validation logic
    let errorMsg = "";

    if (name === "pincode" && value && !/^[0-9]{6}$/.test(value)) {
      errorMsg = "Pincode must be 6 digits";
    }

    if (name === "alternatePhone" && value && !/^[0-9]{10}$/.test(value)) {
      errorMsg = "Phone number must be 10 digits";
    }

    if ((name === "address" || name === "city" || name === "state" || name === "landmark") && !value) {
      errorMsg = "This field is required";
    }

    // Update the error state for the specific field
    setErrors((prev) => ({
      ...prev,
      [name]: errorMsg
    }));
  };


  return (
    <>
      <div className="payment-page">
        <div className="address-form">
          <h2>{formMode === "add" ? "Add New Address" : "Edit Address"}</h2>
          <div className="address-grid">
            <input name="pincode" value={addressForm.pincode} onChange={handleInputChange} placeholder="Pincode" />
            {errors.pincode && <div className="error-message">{errors.pincode}</div>}
            <input name="address" value={addressForm.address} onChange={handleInputChange} placeholder="Address" />
            <input name="city" value={addressForm.city} onChange={handleInputChange} placeholder="City" />
            <input name="state" value={addressForm.state} onChange={handleInputChange} placeholder="State" />
            <input name="landmark" value={addressForm.landmark} onChange={handleInputChange} placeholder="Landmark" />
            <input name="alternatePhone" value={addressForm.alternatePhone} onChange={handleInputChange} placeholder="Alternate Phone" />
            {errors.alternatePhone && <div className="error-message">{errors.alternatePhone}</div>}
            <select name="addressType" value={addressForm.addressType} onChange={handleInputChange}>
              <option>Home</option>
              <option>Work</option>
              <option>Other</option>
            </select>
          </div>
          <button className="save-btn" onClick={handleSaveAddress}>
            {formMode === "add" ? "Add Address" : "Update Address"}
          </button>
          {formMode === "edit" && (
            <button className="cancel-btn" onClick={() => {
              setFormMode("add");
              setEditAddressId(null);
              setAddressForm({
                pincode: "", address: "", city: "", state: "",
                landmark: "", alternatePhone: "", addressType: "Home"
              });
            }}>
              Cancel Edit
            </button>
          )}
        </div>

        <div className="saved-addresses">
          <h2>Saved Addresses</h2>
          {addresses.length === 0 && <p>No saved addresses found.</p>}

          <div className="saved-addresses-list">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className={`address-card ${selectedAddressId === addr._id ? "selected" : ""}`}
                onClick={() => setSelectedAddressId(addr._id)}
              >
                <div style={{ flexGrow: 1 }}>
                  <input type="radio" checked={selectedAddressId === addr._id} readOnly />
                  {addr.address}, {addr.city}, {addr.state} - {addr.pincode} ({addr.addressType})
                </div>
                <div className="address-actions">
                  <FaEdit
                    onClick={(e) => { e.stopPropagation(); handleEditClick(addr); }}
                    title="Edit"
                    style={{ cursor: "pointer", color: "#ffc107", fontSize: 18 }}
                  />
                  <FaTrash
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(addr._id); }}
                    title="Delete"
                    style={{ cursor: "pointer", color: "red", fontSize: 18 }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleProceedToPay}
            className={`proceed-btn ${!selectedAddressId ? "disabled" : ""}`}
            disabled={!selectedAddressId}
          >
            Proceed to Pay
          </button>

          {showPaymentOptions && (
            <>
              <div className="selected-address-display">
                Selected Address: {selectedAddressText}
              </div>
              <div className="payment-options">
                <h3>Payment Options</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label>
                    <input
                      type="radio"
                      name="paymentMode"
                      value="Razorpay"
                      checked={paymentMethod === "Razorpay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    &nbsp; Pay with Razorpay
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="paymentMode"
                      value="cash on delivery"
                      checked={paymentMethod === "cash on delivery"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    &nbsp; Cash on Delivery
                  </label>
                </div>

                {paymentMethod && (
                  <button className="proceed-btn" onClick={handleCheckout} disabled={!paymentMethod}>
                    Checkout
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showSuccessDialog && (
        <div className="success-dialog-overlay">
          <div className="success-dialog">
            <AiOutlineCheckCircle style={{ color: "green", fontSize: 50, marginBottom: 15 }} />
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for your order. It will be delivered soon.</p>
            <button onClick={() => {
              setShowSuccessDialog(false);
              setSelectedAddressId(null);
              setPaymentMethod("");
              setShowPaymentOptions(false);
            }}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentPage;