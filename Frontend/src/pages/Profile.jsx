import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toWords } from "number-to-words";

const Profile = () => {
    const [selectedTab, setSelectedTab] = useState("addresses");
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        pincode: "",
        address: "",
        city: "",
        state: "",
        landmark: "",
        alternatePhone: "",
        addressType: ""
    });

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id;
    const baseurl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (selectedTab === "addresses" && userId) fetchAddresses();
        if (selectedTab === "orders" && userId) fetchOrders();
    }, [selectedTab, userId]);

    const fetchAddresses = async () => {
        try {
            const res = await axios.get(`${baseurl}/api/getAddress/${userId}`);
            setAddresses(res.data.add);
        } catch (error) {
            console.error("Failed to fetch addresses:", error);
        }
    };

    useEffect(() => {
        if (selectedTab === "orders" && userId) {
            fetchOrders();
        }
    }, [selectedTab, userId]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${baseurl}/api/getOrdersByUserId/${userId}`);
            setOrders(res.data.orders || []);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        }
    };

    useEffect(() => {
        if (selectedTab === "orders" && userId) {
            fetchOrders();
            const interval = setInterval(fetchOrders, 5000); // Refresh every 5s
            return () => clearInterval(interval); // Clean up
        }
    }, [selectedTab, userId]);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${baseurl}/api/address/${userId}/${id}`);
            setAddresses((prev) => prev.filter((addr) => addr._id !== id));
        } catch (error) {
            console.error("Failed to delete address:", error);
        }
    };

    const handleEdit = (addr) => {
        setEditingAddress(addr._id);
        setFormData({ ...addr });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`${baseurl}/api/address/${userId}/${editingAddress}`, formData);
            const res = await axios.get(`${baseurl}/api/getAddress/${userId}`);
            setAddresses(res.data.add);
            setEditingAddress(null);
        } catch (error) {
            console.error("Update failed", error);
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            await axios.put(`${baseurl}/api/cancelOrder/${orderId}`);
            fetchOrders(); // refresh orders list
        } catch (error) {
            console.error("Failed to cancel order:", error);
        }
    };

    const handleDownloadInvoice = async (order, index = 1) => {
        const doc = new jsPDF();

        // ======= LOGO (async image loading) =======
        const logoUrl = "images/logo.jpg";
        const getImageAsBase64 = async (url) => {
            const res = await fetch(url);
            const blob = await res.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        };

        const logoBase64 = await getImageAsBase64(logoUrl);
        doc.addImage(logoBase64, 'JPEG', 15, 10, 30, 30); // x, y, width, height

        // ======= TITLE & ADDRESS =======
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Udupi Saree', 55, 20);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Kalasanka, Udupi Dist, Karnataka - 575001', 55, 26);

        // ======= Invoice Title =======
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('TAX INVOICE / BILL OF SUPPLY', 105, 42, { align: 'center' });

        // ======= Invoice Info =======
        const paddedIndex = String(index).padStart(5, '0');
        const shortOrderId = order._id?.slice(-4) || '0000';
        const invoiceNumber = `INV${paddedIndex}${shortOrderId}`;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Invoice No: ${invoiceNumber}`, 20, 52);
        doc.text(`Order No: ${order._id}`, 20, 58);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 64);
        doc.text(`Place of Supply: Karnataka (29)`, 200, 52, { align: 'right' });
        doc.text(`Payment Mode: ${order.paymentMode}`, 200, 58, { align: 'right' });
        doc.text(`Payment ID: ${order.paymentId || 'N/A'}`, 200, 64, { align: 'right' });

        // ======= Billing & Shipping =======
        doc.setFont('helvetica', 'bold');
        doc.text('Bill To:', 20, 76);
        doc.setFont('helvetica', 'normal');
        doc.text(order.username || 'Customer', 20, 82);
        doc.text(`Phone: ${order.userphone || '--'}`, 20, 88);

        doc.setFont('helvetica', 'bold');
        doc.text('Ship To:', 200, 76, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.text(`${order.shippingAddress?.house}, ${order.shippingAddress?.area}`, 200, 82, { align: 'right' });
        doc.text(`${order.shippingAddress?.landmark || ''}`, 200, 88, { align: 'right' });

        // ======= Table Content =======
        let grandTotal = 0;
        let totalGstAmount = 0;

        const rows = order.items.map((item, idx) => {
            const price = parseFloat(item.productprice) || 0;
            const gst = parseFloat(item.productgst) || 0;
            const qty = parseInt(item.productquantity) || 1;
            const gstAmt = (price * qty * gst) / 100;

            const validTill = item.offer?.validTill ? new Date(item.offer.validTill) : null;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            validTill?.setHours(23, 59, 59, 999);

            const offerActive =
                item.offer?.offerpercentage &&
                (!validTill || validTill >= today);

            const offerRate = offerActive ? item.offer.offerpercentage : 0;
            const offerValidTill = offerActive && validTill
                ? validTill.toLocaleDateString()
                : '—';

            const discountedPrice = offerRate ? price - (price * offerRate) / 100 : price;
            const totalItemPrice = discountedPrice * qty;
            const gstAmount = (totalItemPrice * gst) / 100;

            totalGstAmount += gstAmount;
            grandTotal += totalItemPrice + gstAmount;

            return [
                idx + 1,
                item.productname,
                price.toFixed(2),
                offerRate ? `${offerRate}%` : '—',
                offerValidTill,
                `${gst}%`,
                gstAmount.toFixed(2),
                qty,
                (totalItemPrice + gstAmount).toFixed(2),
            ];
        });

        autoTable(doc, {
            startY: 100,
            head: [['S.No', 'Product', 'Price', 'Offer %', 'Valid Till', 'GST %', 'GST Amt', 'Qty', 'Total']],
            body: rows,
            styles: {
                fontSize: 9,
                cellPadding: 3,
                valign: 'middle',
            },
            headStyles: {
                fillColor: [40, 40, 40],
                textColor: 255,
                halign: 'center',
            },
            columnStyles: {
                0: { cellWidth: 11, halign: 'center' },
                1: { cellWidth: 46 },
                2: { cellWidth: 19, halign: 'center' },
                3: { cellWidth: 20, halign: 'center' },
                4: { cellWidth: 22, halign: 'center' },
                5: { cellWidth: 16, halign: 'center' },
                6: { cellWidth: 19, halign: 'center' },
                7: { cellWidth: 12, halign: 'center' },
                8: { cellWidth: 20, halign: 'center' },
            },
            theme: 'grid',
            tableWidth: 'auto',
        });

        const finalY = doc.lastAutoTable.finalY + 8;

        // ======= Summary =======
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total GST: ${totalGstAmount.toFixed(2)}`, 190, finalY, { align: 'right' });
        doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, 190, finalY + 8, { align: 'right' });

        // ======= Amount in Words =======
        const amountInWords = toWords(Math.round(grandTotal));
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Amount in Words: ${amountInWords.toUpperCase()} RUPEES ONLY`, 20, finalY + 18);

        doc.text('Thank you for shopping with us!', 20, finalY + 26);

        // ======= Footer =======
        const pageHeight = doc.internal.pageSize.height;
        const footerText = "This is a computer generated invoice and does not require a physical signature";
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(footerText, doc.internal.pageSize.width / 2, pageHeight - 10, { align: 'center' });

        // ======= Save Invoice =======
        doc.save(`Invoice_${invoiceNumber}.pdf`);
    };



    const renderOrders = () => {
        return (
            <div className="profile-content">
                <h2>Your Orders</h2>
                {orders.length === 0 ? (
                    <p>No orders found.</p>
                ) : (
                    [...orders]
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by latest
                        .map((order) => {
                            let totalProductAmount = 0;
                            let totalGstAmount = 0;

                            order.items.forEach((item) => {
                                const price = parseFloat(item.productprice) || 0;
                                const gstPercent = parseFloat(item.productgst) || 0;
                                const qty = parseInt(item.productquantity) || 1;

                                totalProductAmount += price * qty;
                                totalGstAmount += (price * qty * gstPercent) / 100;
                            });

                            const grandTotal = totalProductAmount + totalGstAmount;
                            const orderDate = new Date(order.createdAt).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                            });

                            return (
                                <div key={order._id} className="order-card">
                                    <h4>Order ID: {order._id}</h4>
                                    <p><strong>Order Date:</strong> {orderDate}</p>
                                    <p><strong>Payment Mode:</strong> {order.paymentMode}</p>
                                    <p>
                                        <strong>Order Status:</strong>{" "}
                                        <span style={{
                                            color: order.status === "delivered" ? "green" :
                                                order.status === "cancelled" ? "red" :
                                                    "orange",
                                            fontWeight: "bold"
                                        }}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </p>
                                    <p><strong>Total Product Amount:</strong> ₹{totalProductAmount.toFixed(2)}</p>
                                    <p><strong>Total GST:</strong> ₹{totalGstAmount.toFixed(2)}</p>
                                    <p><strong>Grand Total (incl. GST):</strong> ₹{grandTotal.toFixed(2)}</p>
                                    <p><strong>Shipping Address:</strong> {order.shippingAddress.house}, {order.shippingAddress.area}, Landmark: {order.shippingAddress.landmark}</p>

                                    <div className="order-items">
                                        <strong>Items:</strong>
                                        {order.items.map((item, index) => {
                                            const price = parseFloat(item.productprice) || 0;
                                            const gstPercent = parseFloat(item.productgst) || 0;
                                            const qty = parseInt(item.productquantity) || 1;
                                            const gstAmount = (price * qty * gstPercent) / 100;
                                            const itemTotal = price * qty + gstAmount;

                                            return (
                                                <div key={index} className="order-item">
                                                    <p>🛍 <strong>{item.productname}</strong></p>
                                                    <p>Price: ₹{price.toFixed(2)}</p>
                                                    <p>GST: {gstPercent}% → ₹{gstAmount.toFixed(2)}</p>
                                                    <p>Quantity: {qty}</p>
                                                    <p>Total (incl. GST): ₹{itemTotal.toFixed(2)}</p>
                                                    {item.offer?.offerpercentage && (
                                                        <p>Offer: {item.offer.offerpercentage}% valid till {new Date(item.offer.validTill).toLocaleDateString()}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="order-btn-group">
                                        {order.status === "placed" && (
                                            <button className="btn btn-danger" onClick={() => handleCancelOrder(order._id)}>
                                                Cancel Order
                                            </button>
                                        )}
                                        <button className="btn btn-secondary" onClick={() => handleDownloadInvoice(order)}>
                                            Download Invoice
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                )}
            </div>
        );
    };

    const renderContent = () => {
        switch (selectedTab) {
            case "addresses":
                return (
                    <div className="profile-content">
                        <h2>Saved Addresses</h2>
                        <div className="address-grid">
                            {addresses.map((addr) => (
                                <div key={addr._id} className="address-card">
                                    {editingAddress === addr._id ? (
                                        <>
                                            <label>Address Type</label>
                                            <select name="addressType" value={formData.addressType} onChange={handleChange}>
                                                <option value="">Select Address Type</option>
                                                <option value="Home">Home</option>
                                                <option value="Work">Work</option>
                                                <option value="Other">Other</option>
                                            </select>

                                            <label>Address</label>
                                            <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" />

                                            <label>City</label>
                                            <input name="city" value={formData.city} onChange={handleChange} placeholder="City" />

                                            <label>State</label>
                                            <input name="state" value={formData.state} onChange={handleChange} placeholder="State" />

                                            <label>Pincode</label>
                                            <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" />

                                            <label>Landmark</label>
                                            <input name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Landmark" />

                                            <label>Alternate Phone</label>
                                            <input name="alternatePhone" value={formData.alternatePhone} onChange={handleChange} placeholder="Alt Phone" />

                                            <div style={{ marginTop: '10px' }}>
                                                <button onClick={handleUpdate}>Save</button>
                                                <button onClick={() => setEditingAddress(null)}>Cancel</button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p><strong>Address Type:</strong> {addr.addressType}</p>
                                            <p><strong>Address:</strong> {addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                            <p><strong>Landmark:</strong> {addr.landmark}</p>
                                            <p><strong>Alt Phone:</strong> {addr.alternatePhone}</p>
                                            <button className="btn btn-primary me-2" onClick={() => handleEdit(addr)}>Edit</button>
                                            <button className="btn btn-danger" onClick={() => handleDelete(addr._id)}>Delete</button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case "orders":
                return renderOrders();
            case "contact":
                return (
                    <div className="contact-container">
                        <div className="contact-box">
                            <h2>Contact Us</h2>
                            <p><strong>📞 Phone:</strong> +919563296583</p>
                            <p><strong>📧 Email:</strong> udupisaree@gmail.com</p>
                        </div>
                    </div>
                );

            // case "track":
            // return <div className="profile-content"><h2>Track My Order</h2></div>;
            default:
                return <div className="profile-content"><h2>Welcome</h2></div>;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.href = "/auth";
    };

    return (
        <div className="profile-container">
            <div className="sidebar">
                <h2 className="sidebar-heading">Manage My Account</h2>
                <ul>
                    <li onClick={() => setSelectedTab("addresses")} className={selectedTab === "addresses" ? "active" : ""}>
                        📍Saved Addresses
                    </li>
                    <li onClick={() => setSelectedTab("orders")} className={selectedTab === "orders" ? "active" : ""}>
                        🛒 Your Orders
                    </li>
                    <li onClick={() => setSelectedTab("contact")} className={selectedTab === "contact" ? "active" : ""}>
                        📞 Customer Support
                    </li>
                    {/* <li onClick={() => setSelectedTab("track")} className={selectedTab === "track" ? "active" : ""}>
                        🚚 Track My Order
                    </li> */}
                    <li onClick={handleLogout}>
                        🔓 Logout
                    </li>
                </ul>
            </div>
            <div className="main-content">{renderContent()}</div>
        </div>
    );
};

export default Profile;


