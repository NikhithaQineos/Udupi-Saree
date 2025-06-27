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
    AppBar,
    Toolbar,
    Divider,
    useMediaQuery,
    useTheme,
    Stack
} from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import Autocomplete from "@mui/material/Autocomplete";
import { FormLabel, RadioGroup, Radio, FormControlLabel, Checkbox, FormGroup } from "@mui/material";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

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
    const [offers, setOffers] = useState([]);
    const [offerTargetType, setOfferTargetType] = useState("product"); // or "category"
    const [offerTargetId, setOfferTargetId] = useState("");
    const [offerType, setOfferType] = useState("percentage"); // or "rupees"
    const [offerValue, setOfferValue] = useState("");
    const [offerValidTill, setOfferValidTill] = useState("");
    const [selectedTargetIds, setSelectedTargetIds] = useState([]);
    const [selectAllProducts, setSelectAllProducts] = useState(false);
    const [selectAllCategories, setSelectAllCategories] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    useEffect(() => {
        if (offerTargetType === "category") {
            const allIds = categories.map((cat) => cat._id);
            const allSelected = allIds.every((id) => selectedTargetIds.includes(id));
            setSelectAllCategories(allSelected);
        }
    }, [selectedTargetIds, categories, offerTargetType]);

    useEffect(() => {
        if (offerTargetType === "product") {
            const allIds = products.map((p) => p._id);
            const allSelected = allIds.every((id) => selectedTargetIds.includes(id));
            setSelectAllProducts(allSelected);
        }
    }, [selectedTargetIds, products, offerTargetType]);

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");

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
    const [validFrom, setValidFrom] = useState("");
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
        fetchOffers();
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
        setValidFrom(product.offer?.validFrom ? product.offer.validFrom.split("T")[0] : "");


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
        formData.append("offerpercentage", offerpercentage);
        if (validFrom) formData.append("validFrom", new Date(validFrom).toISOString());
        if (validTill) formData.append("validTill", new Date(validTill).toISOString());
        formData.append("cat_id", catId);

        if (productimage && productimage.length > 0) {
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

    const fetchOffers = async () => {
        try {
            const res = await axios.get(`${baseurl}/api/list`);
            console.log("Offers fetched:", res.data.offers); // Debug log
            setOffers(res.data.offers || []);
        } catch (err) {
            console.error("Error fetching offers:", err);
        }
    };

    const getEffectivePrice = (product) => {
        let price = product.productprice;
        const today = new Date();

        if (
            product.offer &&
            product.offer.validFrom &&
            product.offer.validTill &&
            new Date(product.offer.validFrom) <= today &&
            new Date(product.offer.validTill) >= today
        ) {
            price -=
                product.offer.offerpercentage > 0
                    ? price * (product.offer.offerpercentage / 100)
                    : 0;
        }

        // 2. Offer model-level category/product offer
        const applicableOffer = offers.find((offer) => {
            return (
                offer.validFrom &&
                offer.validTill &&
                new Date(offer.validFrom) <= today &&
                new Date(offer.validTill) >= today &&
                (
                    (offer.targetType === "product" && offer.targetId === product._id) ||
                    (offer.targetType === "category" && offer.targetId === product.cat_id?._id)
                )
            );
        });

        if (applicableOffer) {
            if (applicableOffer.offerType === "percentage") {
                price -= price * (applicableOffer.offerValue / 100);
            } else if (applicableOffer.offerType === "rupees") {
                price -= applicableOffer.offerValue;
            }
        }
        return price.toFixed(2);
    };

    const handleTargetChange = async (e, id) => {
        const isChecked = e.target.checked;
        const today = new Date();

        try {
            const offersRes = await axios.get(`${baseurl}/api/list`);
            const activeOffers = offersRes.data.offers || [];

            if (offerTargetType === "category") {
                const isCategoryOffered = activeOffers.some(
                    (offer) =>
                        offer.targetType === "category" &&
                        new Date(offer.validTill) >= today &&
                        offer.targetIds.includes(id)
                );
                const productRes = await axios.get(`${baseurl}/api/getproductbycatid/${id}`);
                const productsInCategory = productRes.data.products || [];
                const anyProductHasOffer = productsInCategory.some((product) =>
                    activeOffers.some(
                        (offer) =>
                            offer.targetType === "product" &&
                            new Date(offer.validTill) >= today &&
                            offer.targetIds.includes(product._id)
                    )
                );

                if (isChecked) {
                    if (isCategoryOffered) {
                        setDialogMessage("This category already has an active offer.");
                        setDialogOpen(true);
                        return;
                    }

                    if (anyProductHasOffer) {
                        setDialogMessage("A product under this category already has an active offer.");
                        setDialogOpen(true);
                        return;
                    }

                    setSelectedTargetIds([...selectedTargetIds, id]);
                } else {
                    setSelectedTargetIds(selectedTargetIds.filter((tid) => tid !== id));
                }
            }

            if (offerTargetType === "product") {
                const isProductOffered = activeOffers.some(
                    (offer) =>
                        offer.targetType === "product" &&
                        new Date(offer.validTill) >= today &&
                        offer.targetIds.includes(id)
                );

                const productRes = await axios.get(`${baseurl}/api/getproductbyid/${id}`);
                const productData = productRes.data.products;
                const categoryId = productData?.cat_id;

                const isCategoryOffered = activeOffers.some(
                    (offer) =>
                        offer.targetType === "category" &&
                        new Date(offer.validTill) >= today &&
                        offer.targetIds.includes(categoryId)
                );

                if (isChecked) {
                    if (isProductOffered) {
                        setDialogMessage("This product already has an active offer.");
                        setDialogOpen(true);
                        return;
                    }

                    if (isCategoryOffered) {
                        setDialogMessage("The category of this product already has an active offer.");
                        setDialogOpen(true);
                        return;
                    }

                    setSelectedTargetIds([...selectedTargetIds, id]);
                } else {
                    setSelectedTargetIds(selectedTargetIds.filter((tid) => tid !== id));
                }
            }
        } catch (error) {
            console.error("Error during offer check:", error);
        }
    };

    useEffect(() => {
        setValidFrom(new Date().toISOString().split("T")[0]);
    }, []);

    const drawerContent = (
        <Box>
            <Box sx={{ p: 3, textAlign: "center", fontWeight: "bold", fontSize: 24 }}>
                Admin Panel
            </Box>
            <Divider sx={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
            <List>
                {["category", "product", "contact", "users", "orders"].map((section) => (
                    <ListItem key={section} disablePadding>
                        <ListItemButton
                            selected={activeSection === section}
                            onClick={() => {
                                setActiveSection(section);
                                if (isMobile) setMobileOpen(false); // close drawer on mobile after selecting
                            }}
                            sx={{
                                backgroundColor: activeSection === section ? "#b78c6a" : "transparent",
                                color: activeSection === section ? "#fff" : "inherit",
                                "&:hover": {
                                    backgroundColor: "#fff",
                                    color: "#b78c6a",
                                    "& .MuiListItemText-root": {
                                        color: "#b78c6a",
                                    },
                                },
                            }}
                        >
                            <ListItemText
                                primary={{
                                    category: "Categories",
                                    product: "Products",
                                    contact: "User Queries",
                                    users: "User Details",
                                    orders: "User Orders",
                                }[section]}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
                <ListItemButton
                    selected={activeSection === "offer"}
                    onClick={() => {
                        setActiveSection("offer");
                        if (isMobile) setMobileOpen(false);
                    }}
                >
                    <ListItemText primary="Offer" />
                </ListItemButton>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            {/* AppBar with menu icon on mobile */}
            {isMobile && (
                <AppBar
                    position="fixed"
                    sx={{
                        width: "100%",
                        bgcolor: "#b78c6a",
                    }}
                >
                    <Toolbar>
                        <IconButton color="inherit" edge="start" onClick={handleDrawerToggle}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
                            Admin Panel
                        </Typography>
                    </Toolbar>
                </AppBar>
            )}

            {/* Permanent Drawer on desktop */}
            {!isMobile && (
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
                    {drawerContent}
                </Drawer>
            )}

            {/* Temporary Drawer on mobile */}
            {isMobile && (
                <Drawer
                    variant="temporary"
                    anchor="left"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }} // better mobile performance
                    sx={{
                        "& .MuiDrawer-paper": {
                            width: drawerWidth,
                            boxSizing: "border-box",
                            background: "#b78c6a",
                            color: "#fff",
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: "#f5f6fa",
                    p: 4,
                    minHeight: "100vh",
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    mt: isMobile ? 8 : 0, // add top margin on mobile for AppBar
                    overflowY: "auto",
                }}
            >
                {activeSection === "category" && (
                    <Box
                        maxWidth={1200}
                        mx="auto"
                        px={{ xs: 1, sm: 2 }}
                        py={{ xs: 2, sm: 3 }}
                        bgcolor="#fff"
                        borderRadius={2}
                        boxShadow={2}
                    >
                        {/* Search Bar */}
                        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="center" gap={2} mb={3}>
                            <Autocomplete
                                freeSolo
                                options={categoryNames}
                                inputValue={searchTerm}
                                onInputChange={(event, newInputValue) => {
                                    setSearchTerm(newInputValue);
                                    if (newInputValue.trim() === "") setFilteredCategories(categories);
                                }}
                                onChange={(event, value) => {
                                    if (value) {
                                        const matched = categories.filter(cat => cat.catname.toLowerCase() === value.toLowerCase());
                                        setFilteredCategories(matched);
                                    } else setFilteredCategories(categories);
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
                                            width: { xs: '100%', sm: 240 },
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
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />

                            {/* Buttons */}
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2} flexWrap="wrap">
                                <Button
                                    variant="outlined"
                                    component="label"
                                    sx={{
                                        color: '#a0522d',
                                        borderColor: '#a0522d',
                                        borderRadius: 2,
                                        width: { xs: '100%', sm: 'auto' },
                                        '&:hover': { backgroundColor: '#a0522d', color: '#fff' },
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

                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#a0522d',
                                        color: '#fff',
                                        borderRadius: 2,
                                        width: { xs: '100%', sm: 'auto' },
                                        '&:hover': { backgroundColor: '#8b4513' },
                                    }}
                                >
                                    {isEditing ? 'Update Category' : 'Add Category'}
                                </Button>

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
                                        sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
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
                        <Box sx={{ width: '100%', overflowX: 'auto' }}>
                            <Grid container spacing={3}>
                                {filteredCategories.map((cat) => (
                                    <Grid
                                        item
                                        key={cat._id}
                                        xs={12}
                                        sm={6}
                                        md={4}
                                        lg={3}
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
                                                '&:hover': { transform: 'scale(1.03)' },
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                height="150"
                                                image={`${baseurl}/uploads/${cat.catimage}`}
                                                alt={cat.catname}
                                            />
                                            <CardContent sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                                                        '&:hover': { backgroundColor: '#a0522d', color: '#fff' },
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
                    </Box>
                )}

                {activeSection === "product" && (
                    <Box
                        maxWidth={1200}  // Allow wider space on large screens
                        mx="auto"
                        px={{ xs: 1, sm: 2 }}
                        py={{ xs: 2, sm: 3 }}
                        bgcolor="#fff"
                        borderRadius={2}
                        boxShadow={2}
                    >
                        {/* Search Bar */}
                        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="center" gap={2} mb={3}>
                            <Autocomplete
                                freeSolo
                                options={productNames}
                                inputValue={searchTerm}
                                onInputChange={(event, newInputValue) => setSearchTerm(newInputValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Search..."
                                        variant="outlined"
                                        sx={{
                                            width: { xs: '100%', sm: 240 },
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
                            {/* Dynamic fields */}
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
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />

                            <TextField
                                fullWidth
                                type="date"
                                label="Valid From"
                                value={validFrom}
                                onChange={(e) => setValidFrom(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ min: new Date().toISOString().split("T")[0] }}
                                sx={{ marginTop: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />

                            {/* Category Select */}
                            <FormControl fullWidth margin="normal" required>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={catId}
                                    onChange={(e) => setCatId(e.target.value)}
                                    label="Category"
                                    sx={{ borderRadius: 2 }}
                                >
                                    {categories.map((cat) => (
                                        <MenuItem value={cat._id} key={cat._id}>
                                            {cat.catname}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Upload & Buttons */}
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={3} flexWrap="wrap">
                                <Button
                                    variant="outlined"
                                    component="label"
                                    sx={{
                                        color: '#a0522d',
                                        borderColor: '#a0522d',
                                        borderRadius: 2,
                                        width: { xs: '100%', sm: 'auto' },
                                        '&:hover': { backgroundColor: '#a0522d', color: '#fff' },
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

                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#a0522d',
                                        color: '#fff',
                                        borderRadius: 2,
                                        width: { xs: '100%', sm: 'auto' },
                                        '&:hover': { backgroundColor: '#8b4513' },
                                    }}
                                >
                                    {isEditingProduct ? "Update Product" : "Add Product"}
                                </Button>

                                {isEditingProduct && (
                                    <Button
                                        variant="text"
                                        color="secondary"
                                        onClick={() => resetProductForm()}
                                        sx={{ width: { xs: '100%', sm: 'auto' } }}
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

                        <Box sx={{ width: '100%', overflowX: 'auto' }}>
                            <Grid container spacing={3}>
                                {products
                                    .filter((prod) => prod.productname.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((prod) => (
                                        <Grid
                                            item
                                            key={prod._id}
                                            xs={12}
                                            sm={6}
                                            md={4}
                                            lg={3}
                                            sx={{ display: 'flex', justifyContent: 'center' }}
                                        >
                                            <Card
                                                sx={{
                                                    width: '100%',
                                                    maxWidth: 280,
                                                    height: 550,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                                    transition: 'transform 0.2s ease-in-out',
                                                    '&:hover': { transform: 'scale(1.03)' },
                                                }}
                                            >
                                                <CardMedia
                                                    component="img"
                                                    height="250"
                                                    image={prod.productimages?.[0] ? `${baseurl}/uploads/${prod.productimages[0]}` : "/default-image.jpg"}
                                                    alt={prod.productname}
                                                />

                                                <CardContent sx={{ flexGrow: 1, overflow: 'hidden', textAlign: 'left' }}>
                                                    <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                                                        {prod.productname}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{
                                                        height: 40,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                    }}>
                                                        {prod.productdescription}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Price: ₹<span style={{ textDecoration: "line-through" }}>{prod.productprice}</span>{" "}
                                                        <span style={{ color: "#b78c6a", fontWeight: "bold" }}>₹{getEffectivePrice(prod, offers)}</span>
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">Qty: {prod.productquantity}</Typography>
                                                    <Typography variant="body2" color="text.secondary">GST: {prod.productgst}%</Typography>
                                                    <Typography variant="body2" color="text.secondary">Category: {prod.cat_id?.catname || "No category"}</Typography>
                                                    <Typography variant="body2" color="text.secondary">Color: {prod.productcolor}</Typography>
                                                    <Typography variant="body2" color="text.secondary">Fabric: {prod.productfabric}</Typography>
                                                </CardContent>

                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pb: 2 }}>
                                                    <Button variant="outlined" color="primary" size="small" onClick={() => startEditingProduct(prod)}>
                                                        Edit
                                                    </Button>
                                                    <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteProduct(prod._id)}>
                                                        Delete
                                                    </Button>
                                                </Box>
                                            </Card>
                                        </Grid>
                                    ))}
                            </Grid>
                        </Box>
                    </Box>
                )}

                {activeSection === "contact" && (
                    <Box p={{ xs: 2, sm: 3 }}>
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            User Queries
                        </Typography>

                        <Box sx={{ width: "100%", overflowX: "auto" }}>
                            <TableContainer component={Paper} sx={{ minWidth: 700 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><b>Name</b></TableCell>
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
                                                <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word", maxWidth: 300 }}>
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
                        </Box>
                    </Box>
                )}

                {activeSection === "users" && (
                    <Box p={{ xs: 2, sm: 3 }}>
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            User Details
                        </Typography>

                        <Box sx={{ width: "100%", overflowX: "auto" }}>
                            <TableContainer component={Paper} sx={{ minWidth: 600 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><b>Name</b></TableCell>
                                            <TableCell><b>Email</b></TableCell>
                                            <TableCell><b>Phone</b></TableCell>
                                            <TableCell><b>Created At</b></TableCell>
                                            {/* <TableCell><b>Delete</b></TableCell> */}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user._id}>
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.phone}</TableCell>
                                                <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Box>
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
                                fullWidth
                            />
                            <TextField
                                type="date"
                                label="To Date"
                                InputLabelProps={{ shrink: true }}
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                size="small"
                                fullWidth
                            />

                            <FormControl size="small" fullWidth sx={{ minWidth: 160 }}>
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

                            <FormControl size="small" fullWidth sx={{ minWidth: 160 }}>
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
                                sx={{ height: 40, whiteSpace: "nowrap" }}
                            >
                                Clear Filters
                            </Button>
                        </Stack>

                        {/* Summary */}
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Total Sales: {filteredOrders.length} | Total Revenue: ₹{totalFilteredRevenue.toFixed(2)}
                        </Typography>

                        {/* Responsive Orders Table */}
                        <Box sx={{ width: "100%", overflowX: "auto" }}>
                            <Table size="small" sx={{ minWidth: 900 }}>
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
                                                        <Typography variant="body2">
                                                            Offer:{" "}
                                                            {item.offer
                                                                ? item.offer.offerType === "percentage"
                                                                    ? `${item.offer.offerValue}%`
                                                                    : `₹${item.offer.offerValue}`
                                                                : "N/A"}
                                                        </Typography>
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
                    </Box>
                )}

                {activeSection === "offer" && (
                    <Box p={{ xs: 2, sm: 3 }}>
                        <Typography
                            variant="h5"
                            gutterBottom
                            sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                        >
                            Create Offer
                        </Typography>

                        {/* Offer Target Selection */}
                        <Box mt={{ xs: 2, sm: 3 }}>
                            <FormControl component="fieldset" fullWidth>
                                <FormLabel component="legend">Apply Offer To</FormLabel>
                                <RadioGroup
                                    row
                                    value={offerTargetType}
                                    onChange={(e) => {
                                        setOfferTargetType(e.target.value);
                                        setSelectedTargetIds([]);
                                        setApplyToAll(false);
                                    }}
                                >
                                    <FormControlLabel value="category" control={<Radio />} label="Category" />
                                    <FormControlLabel value="product" control={<Radio />} label="Product" />
                                </RadioGroup>
                            </FormControl>
                        </Box>

                        {/* Category Selection */}
                        {offerTargetType === "category" && (
                            <Box mt={{ xs: 2, sm: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Select Categories
                                </Typography>

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={selectAllCategories}
                                            onChange={async (e) => {
                                                const isChecked = e.target.checked;
                                                const today = new Date();
                                                const offersRes = await axios.get(`${baseurl}/api/list`);
                                                const activeOffers = offersRes.data.offers || [];

                                                if (isChecked) {
                                                    const validCategoryIds = [];

                                                    for (let cat of categories) {
                                                        const catOffered = activeOffers.some(
                                                            (offer) =>
                                                                offer.targetType === "category" &&
                                                                new Date(offer.validTill) >= today &&
                                                                offer.targetIds.includes(cat._id)
                                                        );

                                                        const productRes = await axios.get(`${baseurl}/api/getproductbycatid/${cat._id}`);
                                                        const hasProductOffer = productRes.data.products.some((prod) =>
                                                            activeOffers.some(
                                                                (offer) =>
                                                                    offer.targetType === "product" &&
                                                                    new Date(offer.validTill) >= today &&
                                                                    offer.targetIds.includes(prod._id)
                                                            )
                                                        );

                                                        if (!catOffered && !hasProductOffer) {
                                                            validCategoryIds.push(cat._id);
                                                        }
                                                    }

                                                    if (validCategoryIds.length === 0) {
                                                        setDialogMessage("All categories or their products already have active offers.");
                                                        setDialogOpen(true);
                                                        return;
                                                    }

                                                    setSelectAllCategories(true);
                                                    setSelectedTargetIds(validCategoryIds);
                                                } else {
                                                    setSelectAllCategories(false);
                                                    setSelectedTargetIds([]);
                                                }
                                            }}
                                        />
                                    }
                                    label="Select All Categories"
                                />

                                <Box
                                    mt={2}
                                    maxHeight="200px"
                                    overflow="auto"
                                    border={1}
                                    borderColor="#ddd"
                                    p={2}
                                    borderRadius={2}
                                    width="100%"
                                >
                                    <FormGroup>
                                        {categories.map((cat) => (
                                            <FormControlLabel
                                                key={cat._id}
                                                control={
                                                    <Checkbox
                                                        checked={selectedTargetIds.includes(cat._id)}
                                                        onChange={(e) => handleTargetChange(e, cat._id)}
                                                    />
                                                }
                                                label={cat.catname}
                                            />
                                        ))}
                                    </FormGroup>
                                </Box>
                            </Box>
                        )}

                        {/* Product Selection */}
                        {offerTargetType === "product" && (
                            <Box mt={{ xs: 2, sm: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Select Products
                                </Typography>

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={selectAllProducts}
                                            onChange={async (e) => {
                                                const isChecked = e.target.checked;
                                                const today = new Date();
                                                const offersRes = await axios.get(`${baseurl}/api/list`);
                                                const activeOffers = offersRes.data.offers || [];

                                                if (isChecked) {
                                                    const validProductIds = [];

                                                    for (let prod of products) {
                                                        const isProductOffered = activeOffers.some(
                                                            (offer) =>
                                                                offer.targetType === "product" &&
                                                                new Date(offer.validTill) >= today &&
                                                                offer.targetIds.includes(prod._id)
                                                        );

                                                        const isCategoryOffered = activeOffers.some(
                                                            (offer) =>
                                                                offer.targetType === "category" &&
                                                                new Date(offer.validTill) >= today &&
                                                                offer.targetIds.includes(prod.cat_id?._id)
                                                        );

                                                        if (!isProductOffered && !isCategoryOffered) {
                                                            validProductIds.push(prod._id);
                                                        }
                                                    }

                                                    if (validProductIds.length === 0) {
                                                        setDialogMessage("All products or their categories already have active offers.");
                                                        setDialogOpen(true);
                                                        return;
                                                    }

                                                    setSelectAllProducts(true);
                                                    setSelectedTargetIds(validProductIds);
                                                } else {
                                                    setSelectAllProducts(false);
                                                    setSelectedTargetIds([]);
                                                }
                                            }}
                                        />
                                    }
                                    label="Select All Products"
                                />

                                <Box
                                    mt={2}
                                    maxHeight="200px"
                                    overflow="auto"
                                    border={1}
                                    borderColor="#ddd"
                                    p={2}
                                    borderRadius={2}
                                    width="100%"
                                >
                                    <FormGroup>
                                        {products.map((prod) => (
                                            <FormControlLabel
                                                key={prod._id}
                                                control={
                                                    <Checkbox
                                                        checked={selectedTargetIds.includes(prod._id)}
                                                        onChange={(e) => handleTargetChange(e, prod._id)}
                                                    />
                                                }
                                                label={prod.productname}
                                            />
                                        ))}
                                    </FormGroup>
                                </Box>
                            </Box>
                        )}

                        {/* Offer Details */}
                        <Grid container spacing={2} mt={{ xs: 2, sm: 3 }}>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Offer Type</InputLabel>
                                    <Select
                                        value={offerType}
                                        onChange={(e) => setOfferType(e.target.value)}
                                        label="Offer Type"
                                    >
                                        <MenuItem value="percentage">Percentage</MenuItem>
                                        <MenuItem value="rupees">Rupees</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Offer Value"
                                    type="number"
                                    value={offerValue}
                                    onChange={(e) => setOfferValue(e.target.value)}
                                    fullWidth
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Valid From"
                                    type="date"
                                    value={validFrom}
                                    onChange={(e) => setValidFrom(e.target.value)}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    label="Valid Till"
                                    type="date"
                                    value={offerValidTill}
                                    onChange={(e) => setOfferValidTill(e.target.value)}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{
                                        min: new Date().toISOString().split("T")[0],
                                    }}
                                />
                            </Grid>
                        </Grid>

                        {/* Submit Offer */}
                        <Box mt={{ xs: 3, sm: 4 }}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={async () => {
                                    try {
                                        const payload = {
                                            targetType: offerTargetType,
                                            offerType,
                                            offerValue: Number(offerValue),
                                            validFrom: new Date(validFrom).toISOString(),
                                            validTill: new Date(offerValidTill).toISOString(),
                                            targetIds: selectedTargetIds,
                                        };

                                        const response = await axios.post(`${baseurl}/api/create`, payload);
                                        fetchOffers();
                                        alert("Offer created successfully");

                                        setSelectedTargetIds([]);
                                        setSelectAllProducts(false);
                                        setSelectAllCategories(false);
                                        setOfferType("percentage");
                                        setOfferValue("");
                                        setOfferValidTill("");
                                    } catch (err) {
                                        const backendMessage =
                                            err?.response?.data?.message ||
                                            err?.message ||
                                            "Something went wrong while creating the offer.";
                                        alert(backendMessage);
                                    }
                                }}
                            >
                                Create Offer
                            </Button>
                        </Box>

                        {/* Dialog */}
                        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
                            <DialogTitle>Offer Already Running</DialogTitle>
                            <DialogContent>
                                <DialogContentText>{dialogMessage}</DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setDialogOpen(false)} autoFocus>
                                    OK
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* All Offers Table */}
                        <Box mt={{ xs: 4, sm: 5 }}>
                            <Typography variant="h6" gutterBottom>
                                All Offers
                            </Typography>

                            <Box sx={{ width: "100%", overflowX: "auto" }}>
                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 800 }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Target Type</TableCell>
                                                <TableCell>Target Names</TableCell>
                                                <TableCell>Offer Type</TableCell>
                                                <TableCell>Offer Value</TableCell>
                                                <TableCell>Valid From</TableCell>
                                                <TableCell>Valid Till</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {offers.map((offer) => (
                                                <TableRow key={offer._id}>
                                                    <TableCell>{offer.targetType}</TableCell>
                                                    <TableCell>
                                                        {(offer.targetNames || []).length > 0
                                                            ? offer.targetNames.join(", ")
                                                            : "N/A"}
                                                    </TableCell>
                                                    <TableCell>{offer.offerType}</TableCell>
                                                    <TableCell>
                                                        {offer.offerType === "percentage"
                                                            ? `${offer.offerValue}%`
                                                            : `₹${offer.offerValue}`}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(offer.validFrom).toLocaleDateString("en-GB")}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(offer.validTill).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            size="small"
                                                            onClick={async () => {
                                                                if (window.confirm("Are you sure you want to delete this offer?")) {
                                                                    try {
                                                                        await axios.delete(`${baseurl}/api/delete/${offer._id}`);
                                                                        fetchOffers();
                                                                    } catch (err) {
                                                                        console.error("Delete failed:", err);
                                                                        alert("Failed to delete offer");
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}