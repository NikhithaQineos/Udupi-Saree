import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    TextField,
    Button,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    useTheme,
    Divider,
    Stack
} from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import Autocomplete from "@mui/material/Autocomplete";

const fabricOptions = ["Silk", "Cotton", "Linen", "Georgette", "Chiffon", "Velvet", "Net", "Organza"];

const baseurl = import.meta.env.VITE_API_URL;

const drawerWidth = 240;

export default function AdminPanel() {

    const [searchTerm, setSearchTerm] = useState("");

    const [activeSection, setActiveSection] = useState("category");
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [sortOption, setSortOption] = useState("latest");

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("all");

    // Sort first
    const sortedorders = [...orders].sort((a, b) => {
        if (sortOption === "latest") return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortOption === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortOption === "amountHigh") return b.total - a.total;
        if (sortOption === "amountLow") return a.total - b.total;
        return 0;
    });

    const normalizePayment = (mode) => {
        if (!mode) return "";
        const lower = mode.toLowerCase();
        if (lower.includes("cod") || lower.includes("cash")) return "cod";
        if (lower.includes("razorpay")) return "razorpay";
        return lower;
    };

    const filteredOrders = sortedorders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        const startDate = fromDate ? new Date(fromDate) : null;
        const endDate = toDate ? new Date(toDate + "T23:59:59") : null;

        if (startDate && orderDate < startDate) return false;
        if (endDate && orderDate > endDate) return false;

        if (paymentFilter !== "all") {
            const normalized = normalizePayment(order.paymentMode);
            if (normalized !== paymentFilter.toLowerCase()) return false;
        }

        return true;
    });

    const totalFilteredSales = filteredOrders.length;
    const totalFilteredRevenue = filteredOrders.reduce(
        (sum, order) => sum + (Number(order.total) || 0),
        0
    );

    const productNames = products.map((p) => p.productname);
    // const categoryNames = categories.map((cat) => cat.catname);
    const [filteredCategories, setFilteredCategories] = useState([]);

    const categoryNames = categories
        .map((cat) => cat?.catname)
        .filter((name) => typeof name === "string" && name.trim() !== "");

    // Category fields
    const [catname, setCatName] = useState("");
    const [catdescription, setCatDescription] = useState("");
    const [catimage, setCatImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editCatId, setEditCatId] = useState(null);

    // Product fields
    const [productname, setProductName] = useState("");
    const [productimage, setProductImage] = useState(null);
    const [productprice, setProductPrice] = useState("");
    const [productdescription, setProductDescription] = useState("");
    const [productquantity, setProductQuantity] = useState("");
    const [productgst, setProductGst] = useState("");
    const [productcolor, setProductColor] = useState("");
    const [productfabric, setProductFabric] = useState("");
    const [catId, setCatId] = useState("");
    const [offerpercentage, setOfferPercentage] = useState("");
    const [validTill, setValidTill] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isEditingProduct, setIsEditingProduct] = useState(false);
    const [editProductId, setEditProductId] = useState(null);

    const fetchCategories = async () => {
        const res = await axios.get(`${baseurl}/api/getcategorylist`);
        setCategories(res.data.newgetcategory);
        setFilteredCategories(res.data.newgetcategory);
    };

    const startEditingCategory = (category) => {
        setIsEditing(true);
        setEditCatId(category._id);
        setCatName(category.catname);
        setCatDescription(category.catdescription);
        setCatImage(null); // Clear file input, or handle differently if needed
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;

        try {
            await axios.delete(`${baseurl}/api/deletecategorybyid/${id}`);
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    const fetchProducts = async () => {
        const res = await axios.get(`${baseurl}/api/getproduct`);
        setProducts(res.data.products);
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts();
        fetchContactMessages();
        fetchUsers();
        fetchOrders();
    }, []);

    const startEditingProduct = (product) => {
        setIsEditingProduct(true);
        setEditProductId(product._id);
        setProductName(product.productname);
        setProductPrice(product.productprice);
        setProductDescription(product.productdescription);
        setProductQuantity(product.productquantity);
        setProductGst(product.productgst);
        setProductColor(product.productcolor);
        setProductFabric(product.productfabric);

        // Fixed: use correct variable name
        setOfferPercentage(product.offer?.offerpercentage || "");
        setValidTill(product.offer?.validTill ? product.offer.validTill.split("T")[0] : "");

        // Correctly set category ID (assuming it's populated as object)
        setCatId(product.cat_id?._id || "");

        // Clear file input
        setProductImage(null);
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("catname", catname);
            formData.append("catdescription", catdescription);
            if (catimage) formData.append("catimage", catimage);

            if (isEditing) {
                await axios.put(
                    `${baseurl}/api/updatecategorybyid/${editCatId}`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                setIsEditing(false);
                setEditCatId(null);
            } else {
                await axios.post(`${baseurl}/api/createcategory`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            setCatName("");
            setCatDescription("");
            setCatImage(null);
            fetchCategories();
        } catch (err) {
            console.error("Category not added/updated:", err);
        }
    };


    const handleProductSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("productname", productname);
        formData.append("productprice", productprice);
        formData.append("productdescription", productdescription);
        formData.append("productquantity", productquantity);
        formData.append("productgst", productgst);
        formData.append("productcolor", productcolor);
        formData.append("productfabric", productfabric);
        formData.append("offerpercentage", offerpercentage || 0);
        if (validTill) formData.append("validTill", validTill);
        formData.append("cat_id", catId);

        if (productimage) {
            for (let i = 0; i < productimage.length; i++) {
                formData.append("productimages", productimage[i]);
            }
        }

        try {
            if (isEditingProduct && editProductId) {
                await axios.put(`${baseurl}/api/updateproduct/${editProductId}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                setSuccessMessage("Product updated successfully");
            } else {
                await axios.post(`${baseurl}/api/createproduct`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                setSuccessMessage("Product added successfully");
            }

            // Clear form & reset states
            setProductName("");
            setProductPrice("");
            setProductDescription("");
            setProductQuantity("");
            setProductGst("");
            setProductColor("");
            setProductFabric("");
            setCatId("");
            setOfferPercentage("");
            setValidTill("");
            setProductImage(null);
            setIsEditingProduct(false);
            setEditProductId(null);

            fetchProducts();
        } catch (error) {
            console.error("Error saving product:", error);
        }
    };


    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await axios.delete(`${baseurl}/api/deleteproduct/${id}`);
            fetchProducts();
            // refresh product list or show success toast
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete product");
        }
    };

    //FETCH CONTACT US FROM QUERY FROM USER//

    const fetchContactMessages = async () => {
        try {
            const res = await axios.get(`${baseurl}/api/getMessege`);
            setContacts(res.data.msg);
        } catch (err) {
            console.error("Error fetching contact messages:", err);
        }
    };

    const handleDeleteContact = async (id) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;

        try {
            await axios.delete(`${baseurl}/api/deleteMsg/${id}`);
            fetchContactMessages(); // Refresh after deletion
        } catch (err) {
            console.error("Failed to delete contact message", err);
        }
    };


    //FETCH  USER DETAILS FROM  FROM USER
    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${baseurl}/api/userlist`);
            setUsers(res.data.users);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };


    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${baseurl}/api/getorder`);
            setOrders(res.data.orders); // Ensure backend returns { orders: [...] }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const sortedOrders = [...orders].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const handleMarkAsDelivered = async (orderId) => {
        try {
            await axios.put(`${baseurl}/api/orderasdelivered/${orderId}`);
            // Optional: show a toast or success message
            fetchOrders(); // 👈 This re-fetches and updates the table
        } catch (error) {
            console.error("Failed to mark as delivered:", error);
        }
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <Drawer
                variant="permanent"
                anchor="left"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        background: "#b78c6a",
                        color: "#fff",
                    },
                }}
            >
                <Box sx={{ p: 3, textAlign: "center", fontWeight: "bold", fontSize: 24 }}>
                    Admin Panel
                </Box>
                <Divider sx={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
                <List>
                    <ListItem disablePadding>
                        <ListItemButton
                            selected={activeSection === "category"}

                            onClick={() => setActiveSection("category")}
                            sx={{
                                backgroundColor: activeSection === "category" ? "#b78c6a" : "transparent",
                                color: activeSection === "category" ? "#fff" : "inherit",
                                "&:hover": {
                                    backgroundColor: "#fff",
                                    color: "#b78c6a",
                                    "& .MuiListItemText-root": {
                                        color: "#b78c6a",
                                    },
                                },
                            }}
                        >
                            <ListItemText primary="Categories" />
                        </ListItemButton>

                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton
                            selected={activeSection === "product"}
                            onClick={() => setActiveSection("product")}
                            sx={{
                                backgroundColor: activeSection === "product" ? "#b78c6a" : "transparent",
                                color: activeSection === "product" ? "#fff" : "inherit",
                                "&:hover": {
                                    backgroundColor: "#fff",
                                    color: "#b78c6a",
                                    "& .MuiListItemText-root": {
                                        color: "#b78c6a",
                                    },
                                },
                            }}
                        >
                            <ListItemText primary="Products" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton
                            selected={activeSection === "contact"}
                            onClick={() => setActiveSection("contact")}
                            sx={{
                                backgroundColor: activeSection === "contact" ? "#b78c6a" : "transparent",
                                color: activeSection === "contact" ? "#fff" : "inherit",
                                "&:hover": {
                                    backgroundColor: "#fff",
                                    color: "#b78c6a",
                                    "& .MuiListItemText-root": {
                                        color: "#b78c6a",
                                    },
                                },
                            }}
                        >
                            <ListItemText primary="User Queries" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton
                            selected={activeSection === "users"}
                            onClick={() => setActiveSection("users")}
                            sx={{
                                backgroundColor: activeSection === "users" ? "#b78c6a" : "transparent",
                                color: activeSection === "users" ? "#fff" : "inherit",
                                "&:hover": {
                                    backgroundColor: "#fff",
                                    color: "#b78c6a",
                                    "& .MuiListItemText-root": {
                                        color: "#b78c6a",
                                    },
                                },
                            }}
                        >
                            <ListItemText primary="User Details" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton
                            selected={activeSection === "orders"}
                            onClick={() => setActiveSection("orders")}
                            sx={{
                                backgroundColor: activeSection === "orders" ? "#b78c6a" : "transparent",
                                color: activeSection === "orders" ? "#fff" : "inherit",
                                "&:hover": {
                                    backgroundColor: "#fff",
                                    color: "#b78c6a",
                                    "& .MuiListItemText-root": {
                                        color: "#b78c6a",
                                    },
                                },
                            }}
                        >
                            <ListItemText primary="User Orders" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: "#f5f6fa",
                    p: 4,
                    minHeight: "100vh",
                    overflowY: "auto",
                }}
            >
                {activeSection === "category" && (
                    <Box maxWidth={900} mx="auto" px={2} py={3} bgcolor="#fff" borderRadius={2} boxShadow={2}>
                        {/* Search Bar */}
                        <Box display="flex" alignItems="center" gap={2} mb={3}>
                            <Autocomplete
                                freeSolo
                                options={categoryNames}
                                inputValue={searchTerm}
                                onInputChange={(event, newInputValue) => {
                                    setSearchTerm(newInputValue);
                                    if (newInputValue.trim() === "") {
                                        setFilteredCategories(categories);
                                    }
                                }}
                                onChange={(event, value) => {
                                    if (value) {
                                        const matched = categories.filter(cat =>
                                            cat.catname.toLowerCase() === value.toLowerCase()
                                        );
                                        setFilteredCategories(matched);
                                    } else {
                                        setFilteredCategories(categories);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Search..."
                                        variant="outlined"
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            width: 240,
                                            '& .MuiOutlinedInput-root': {
                                                height: 40,
                                                fontSize: 14,
                                                borderRadius: 2,
                                                backgroundColor: '#fdf4ec',
                                                borderColor: '#a0522d',
                                            },
                                        }}
                                    />
                                )}
                            />
                        </Box>

                        {/* Form Header */}
                        <Typography variant="h4" fontWeight="bold" color="#5e3d26" gutterBottom>
                            Add Category
                        </Typography>

                        {/* Form */}
                        <form onSubmit={handleCategorySubmit}>
                            <TextField
                                fullWidth
                                label="Category Name"
                                value={catname}
                                onChange={(e) => setCatName(e.target.value)}
                                margin="normal"
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    },
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Description"
                                value={catdescription}
                                onChange={(e) => setCatDescription(e.target.value)}
                                margin="normal"
                                multiline
                                rows={3}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    },
                                }}
                            />

                            {/* Buttons */}
                            <Stack direction="row" spacing={2} mt={2} flexWrap="wrap">
                                {/* Upload Button */}
                                <Button
                                    variant="outlined"
                                    component="label"
                                    sx={{
                                        color: '#a0522d',
                                        borderColor: '#a0522d',
                                        borderRadius: 2,
                                        '&:hover': {
                                            backgroundColor: '#a0522d',
                                            color: '#fff',
                                        },
                                    }}
                                >
                                    {catimage ? catimage.name : 'Upload Image'}
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={(e) => setCatImage(e.target.files[0])}
                                    />
                                </Button>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#a0522d',
                                        color: '#fff',
                                        borderRadius: 2,
                                        '&:hover': {
                                            backgroundColor: '#8b4513',
                                        },
                                    }}
                                >
                                    {isEditing ? 'Update Category' : 'Add Category'}
                                </Button>

                                {/* Cancel Button */}
                                {isEditing && (
                                    <Button
                                        variant="text"
                                        color="secondary"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditCatId(null);
                                            setCatName('');
                                            setCatDescription('');
                                            setCatImage(null);
                                        }}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </Stack>
                        </form>

                        {/* All Categories Header */}
                        <Typography variant="h5" mt={6} mb={2} fontWeight="bold" color="#5e3d26">
                            All Categories
                        </Typography>

                        {/* Cards */}
                        <Grid container spacing={3}>
                            {filteredCategories.map((cat) => (
                                <Grid
                                    item
                                    key={cat._id}
                                    xs={6}
                                    sm={4}
                                    md={3}
                                    sx={{ display: 'flex', justifyContent: 'center' }}
                                >
                                    <Card
                                        sx={{
                                            width: '100%',
                                            maxWidth: 272,
                                            height: 310,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                            borderRadius: 2,
                                            transition: 'transform 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'scale(1.03)',
                                            },
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="150"
                                            image={`${baseurl}/uploads/${cat.catimage}`}
                                            alt={cat.catname}
                                        />
                                        <CardContent
                                            sx={{
                                                flexGrow: 1,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                                                {cat.catname}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    height: 40,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {cat.catdescription}
                                            </Typography>
                                        </CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pb: 2 }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                sx={{
                                                    color: '#a0522d',
                                                    borderColor: '#a0522d',
                                                    '&:hover': {
                                                        backgroundColor: '#a0522d',
                                                        color: '#fff',
                                                    },
                                                }}
                                                onClick={() => startEditingCategory(cat)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={() => handleDeleteCategory(cat._id)}
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {activeSection === "product" && (
                    <Box maxWidth={900} mx="auto" px={2} py={3} bgcolor="#fff" borderRadius={2} boxShadow={2}>

                        {/* Search Bar */}
                        <Box display="flex" alignItems="center" gap={2} mb={3}>
                            <Autocomplete
                                freeSolo
                                options={productNames}
                                inputValue={searchTerm}
                                onInputChange={(event, newInputValue) => {
                                    setSearchTerm(newInputValue);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Search..."
                                        variant="outlined"
                                        sx={{
                                            width: 240,
                                            '& .MuiOutlinedInput-root': {
                                                height: 40,
                                                fontSize: 14,
                                                borderRadius: 2,
                                                backgroundColor: '#fdf4ec',
                                            },
                                        }}
                                    />
                                )}
                            />
                        </Box>

                        {/* Form Title */}
                        <Typography variant="h4" fontWeight="bold" color="#5e3d26" gutterBottom>
                            Add Product
                        </Typography>

                        {/* Form */}
                        <form onSubmit={handleProductSubmit}>
                            {[{
                                label: "Product Name", value: productname, onChange: setProductName
                            }, {
                                label: "Price", type: "number", value: productprice, onChange: setProductPrice, inputProps: { min: 0 }
                            }, {
                                label: "Description", value: productdescription, onChange: setProductDescription, multiline: true, rows: 3
                            }, {
                                label: "Quantity", type: "number", value: productquantity, onChange: setProductQuantity, inputProps: { min: 0 }
                            }, {
                                label: "GST (%)", type: "number", value: productgst, onChange: setProductGst, inputProps: { min: 0, max: 100 }
                            }, {
                                label: "Product Color", value: productcolor, onChange: setProductColor
                            }].map((field, i) => (
                                <TextField
                                    key={i}
                                    fullWidth
                                    label={field.label}
                                    type={field.type || 'text'}
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    margin="normal"
                                    multiline={field.multiline}
                                    rows={field.rows}
                                    inputProps={field.inputProps}
                                    required
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            ))}

                            {/* Fabric */}
                            <TextField
                                select
                                fullWidth
                                label="Product Fabric"
                                value={productfabric}
                                onChange={(e) => setProductFabric(e.target.value)}
                                margin="normal"
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    },
                                }}
                            >
                                {fabricOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* Offer */}
                            <TextField
                                fullWidth
                                type="number"
                                label="Offer Percentage (%)"
                                value={offerpercentage}
                                onChange={(e) => setOfferPercentage(e.target.value)}
                                margin="normal"
                                inputProps={{ min: 0, max: 100 }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2} }}
                            />

                            <TextField
                                fullWidth
                                type="date"
                                label="Valid Till"
                                value={validTill}
                                onChange={(e) => setValidTill(e.target.value)}
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ min: new Date().toISOString().split("T")[0] }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2} }}
                            />

                            {/* Category Select */}
                            <FormControl fullWidth margin="normal" required>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={catId}
                                    onChange={(e) => setCatId(e.target.value)}
                                    label="Category"
                                    sx={{borderRadius: 2 }}
                                >
                                    {categories.map((cat) => (
                                        <MenuItem value={cat._id} key={cat._id}>
                                            {cat.catname}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Upload Image */}
                            <Stack direction="row" spacing={2} mt={3} flexWrap="wrap">
                                {/* Upload Image Button */}
                                <Button
                                    variant="outlined"
                                    component="label"
                                    sx={{
                                        color: '#a0522d',
                                        borderColor: '#a0522d',
                                        borderRadius: 2,
                                        '&:hover': {
                                            backgroundColor: '#a0522d',
                                            color: '#fff',
                                        },
                                    }}
                                >
                                    {productimage ? productimage[0]?.name || "Images Selected" : "Upload Product Image"}
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => setProductImage(e.target.files)}
                                    />
                                </Button>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#a0522d',
                                        color: '#fff',
                                        borderRadius: 2,
                                        '&:hover': {
                                            backgroundColor: '#8b4513',
                                        },
                                    }}
                                >
                                    {isEditingProduct ? "Update Product" : "Add Product"}
                                </Button>

                                {/* Cancel Button */}
                                {isEditingProduct && (
                                    <Button
                                        variant="text"
                                        color="secondary"
                                        onClick={() => {
                                            setIsEditingProduct(false);
                                            setEditProductId(null);
                                            setProductName("");
                                            setProductPrice("");
                                            setProductDescription("");
                                            setProductQuantity("");
                                            setProductGst("");
                                            setProductColor("");
                                            setProductFabric("");
                                            setOfferPercentage("");
                                            setValidTill("");
                                            setCatId("");
                                            setProductImage(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </Stack>

                        </form>

                        {/* Success Message */}
                        {successMessage && (
                            <Typography variant="body1" color="success.main" sx={{ mt: 2, fontWeight: "bold" }}>
                                {successMessage}
                            </Typography>
                        )}

                        {/* Product List */}
                        <Typography variant="h5" mt={6} mb={2} fontWeight="bold" color="#5e3d26">
                            All Products
                        </Typography>

                        <Grid container spacing={3}>
                            {products
                                .filter((prod) =>
                                    prod.productname.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((prod) => (
                                    <Grid
                                        item
                                        key={prod._id}
                                        xs={6}
                                        sm={4}
                                        md={3}
                                        sx={{ display: 'flex', justifyContent: 'center' }}
                                    >
                                        <Card
                                            sx={{
                                                width: '100%',
                                                maxWidth: 272,
                                                height: 560,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                                borderRadius: 2,
                                                transition: 'transform 0.2s ease-in-out',
                                                '&:hover': {
                                                    transform: 'scale(1.03)',
                                                },
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                height="250"
                                                image={
                                                    prod.productimages && prod.productimages.length > 0
                                                        ? `${baseurl}/uploads/${prod.productimages[0]}`
                                                        : "/default-image.jpg"
                                                }
                                                alt={prod.productname}
                                            />

                                            <CardContent sx={{ flexGrow: 1, textAlign: 'left' }}>
                                                <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                                                    {prod.productname}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        height: 40,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                    }}
                                                >
                                                    {prod.productdescription}
                                                </Typography>

                                                <Typography variant="body2">Price: ₹{prod.productprice}</Typography>
                                                <Typography variant="body2">Qty: {prod.productquantity}</Typography>
                                                <Typography variant="body2">GST: {prod.productgst}%</Typography>
                                                {prod.offer?.offerpercentage > 0 && (
                                                    <Typography variant="body2">
                                                        Offer: {prod.offer.offerpercentage}% off
                                                    </Typography>
                                                )}
                                                {prod.offer?.validTill && new Date(prod.offer.validTill) >= new Date() && (
                                                    <Typography variant="body2">
                                                        Valid Till: {new Date(prod.offer.validTill).toLocaleDateString()}
                                                    </Typography>
                                                )}
                                                <Typography variant="body2">Category: {prod.cat_id?.catname || "No category"}</Typography>
                                                <Typography variant="body2">Color: {prod.productcolor}</Typography>
                                                <Typography variant="body2">Fabric: {prod.productfabric}</Typography>
                                            </CardContent>

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pb: 2 }}>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        color: '#a0522d',
                                                        borderColor: '#a0522d',
                                                        '&:hover': {
                                                            backgroundColor: '#a0522d',
                                                            color: '#fff',
                                                        },
                                                    }}
                                                    onClick={() => startEditingProduct(prod)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleDeleteProduct(prod._id)}
                                                >
                                                    Delete
                                                </Button>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                        </Grid>
                    </Box>
                )}

                {activeSection === "contact" && (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>Name </b></TableCell>
                                    <TableCell><b>Email</b></TableCell>
                                    <TableCell><b>Phone</b></TableCell>
                                    <TableCell><b>Message</b></TableCell>
                                    <TableCell><b>Date & Time</b></TableCell>
                                    <TableCell><b>Delete</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {contacts.map((contact) => (
                                    <TableRow key={contact._id}>
                                        <TableCell>{contact.name}</TableCell>
                                        <TableCell>{contact.email}</TableCell>
                                        <TableCell>{contact.phone}</TableCell>
                                        <TableCell style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                            {contact.messege}
                                        </TableCell>
                                        <TableCell>{new Date(contact.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleDeleteContact(contact._id)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {activeSection === "users" && (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>Name</b></TableCell>
                                    <TableCell><b>Email</b></TableCell>
                                    <TableCell><b>Phone</b></TableCell>
                                    <TableCell><b>Created At</b></TableCell>
                                    {/* //<TableCell><b>Delete</b></TableCell> // */}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.phone}</TableCell>
                                        <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                            {/* <IconButton
                                                onClick={() => handleDeleteUser(user._id)}
                                                color="error"
                                            >
                                                <DeleteIcon /> */}
                                            {/* </IconButton> */}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {activeSection === "orders" && (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            All Orders
                        </Typography>

                        {/* Filters Row */}
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            alignItems="flex-start"
                            justifyContent="space-between"
                            flexWrap="wrap"
                            sx={{ mb: 3 }}
                        >
                            <TextField
                                type="date"
                                label="From Date"
                                InputLabelProps={{ shrink: true }}
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                size="small"
                            />
                            <TextField
                                type="date"
                                label="To Date"
                                InputLabelProps={{ shrink: true }}
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                size="small"
                            />

                            <FormControl size="small" sx={{ minWidth: 160 }}>
                                <InputLabel>Payment</InputLabel>
                                <Select
                                    value={paymentFilter}
                                    label="Payment"
                                    onChange={(e) => setPaymentFilter(e.target.value)}
                                >
                                    <MenuItem value="all">All</MenuItem>
                                    <MenuItem value="COD">COD</MenuItem>
                                    <MenuItem value="Razorpay">Razorpay</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl size="small" sx={{ minWidth: 160 }}>
                                <InputLabel>Sort By</InputLabel>
                                <Select
                                    value={sortOption}
                                    label="Sort By"
                                    onChange={(e) => setSortOption(e.target.value)}
                                >
                                    <MenuItem value="latest">Latest</MenuItem>
                                    <MenuItem value="oldest">Oldest</MenuItem>
                                    <MenuItem value="amountHigh">Amount High → Low</MenuItem>
                                    <MenuItem value="amountLow">Amount Low → High</MenuItem>
                                </Select>
                            </FormControl>

                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setFromDate("");
                                    setToDate("");
                                    setPaymentFilter("all");
                                    setSortOption("latest");
                                }}
                                sx={{ height: 40 }}
                            >
                                Clear Filters
                            </Button>
                        </Stack>

                        {/* Summary */}
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Total Sales: {filteredOrders.length} | Total Revenue: ₹{totalFilteredRevenue.toFixed(2)}
                        </Typography>

                        {/* Orders Table */}
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>User</strong></TableCell>
                                    <TableCell><strong>Phone</strong></TableCell>
                                    <TableCell><strong>Payment</strong></TableCell>
                                    <TableCell><strong>Payment ID</strong></TableCell>
                                    <TableCell><strong>Order ID</strong></TableCell>
                                    <TableCell><strong>Total</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Items</strong></TableCell>
                                    <TableCell><strong>Date & Time</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredOrders.map((order) => (
                                    <TableRow
                                        key={order._id}
                                        sx={{
                                            backgroundColor: order.status === "cancelled" ? "#ffdddd" : "inherit",
                                        }}
                                    >
                                        <TableCell>{order.username}</TableCell>
                                        <TableCell>{order.userphone}</TableCell>
                                        <TableCell>{order.paymentMode}</TableCell>
                                        <TableCell>{order.paymentId || "N/A"}</TableCell>
                                        <TableCell>{order._id}</TableCell>
                                        <TableCell>₹{order.total}</TableCell>
                                        <TableCell>
                                            <Typography
                                                sx={{
                                                    color: order.status === "cancelled" ? "red" : (order.status === "delivered" ? "green" : "orange"),
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {order.status.toUpperCase()}
                                            </Typography>

                                            {order.status !== "delivered" && order.status !== "cancelled" && (
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    sx={{ mt: 1 }}
                                                    onClick={() => handleMarkAsDelivered(order._id)}
                                                >
                                                    Mark as delivered
                                                </Button>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {order.items.map((item, i) => (
                                                <Box key={i} mb={1}>
                                                    <Typography variant="body2"><strong>{item.productname}</strong></Typography>
                                                    <Typography variant="body2">Qty: {item.productquantity}</Typography>
                                                    <Typography variant="body2">Price: ₹{item.productprice} | GST: {item.productgst}%</Typography>
                                                    <Typography variant="body2">Offer: {item.offer?.offerpercentage || "N/A"}%</Typography>
                                                    <Typography variant="body2">
                                                        Valid Till:{" "}
                                                        {item.offer?.validTill
                                                            ? new Date(item.offer.validTill).toLocaleDateString()
                                                            : "N/A"}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </TableCell>
                                        <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                )}


            </Box>
        </Box>
    );
}
