const Product = require('../models/Product');
const User = require('../models/User');
const { scrapeProduct } = require('../services/scraperService');

exports.addProduct = async (req, res) => {
    try {
        const { url, userEmail } = req.body;
        const user = await User.findOne({ email: userEmail });
        if (!user) return res.status(404).json({ error: "User not found." });

        // --- DUPLICATE CHECK ---
        const existingProduct = await Product.findOne({ user: user._id, url: url });
        if (existingProduct) {
            return res.status(200).json({
                message: "Product already tracked",
                status: "exists"
            });
        }

        // --- SCRAPE PRODUCT ---
        const scrapedData = await scrapeProduct(url);

        // Ensure price is valid before saving
        if (!scrapedData.price) {
            return res.status(400).json({ error: "Failed to scrape price. Please check the URL." });
        }

        const newProduct = new Product({
            user: user._id,
            url,
            ...scrapedData,
            currentPrice: scrapedData.price,
            priceHistory: [{ price: scrapedData.price, date: new Date() }]
        });

        await newProduct.save();
        res.status(201).json({ message: "Product added!", product: newProduct });
    } catch (error) {
        console.error("Add Product Error:", error.message);
        // Return 400 if it's a scraping error
        res.status(400).json({ error: error.message || "Failed to add product" });
    }
};

exports.getProducts = async (req, res) => {
    const user = await User.findOne({ email: req.query.userEmail });
    if (!user) return res.json([]);
    const products = await Product.find({ user: user._id }).sort({ lastChecked: -1 });
    res.json(products);
};

exports.deleteProduct = async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
};
// backend/controllers/productController.js

// ... (kalin thibuna addProduct code eka me uda thiyenna one) ...

// Popular Drops (Price adu unu ewa) ganna function eka
exports.getPopularProducts = async (req, res) => {
    try {
        // Okkoma products gannawa
        const allProducts = await Product.find().sort({ lastChecked: -1 });

        // Logic: Kalin milata wada dan mila adu ewa filter karanawa
        const popularDrops = allProducts.filter(product => {
            if (!product.priceHistory || product.priceHistory.length < 1) return false;
            const initialPrice = product.priceHistory[0].price;
            return product.currentPrice < initialPrice;
        });

        // Drop unu ewa nattam, anthimata add karapu 10 denawa (Empty nowenna)
        const responseData = popularDrops.length > 0 ? popularDrops : allProducts.slice(0, 12);

        res.json(responseData);
    } catch (error) {
        console.error("Popular Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch popular items" });
    }
};

exports.getAllTrackedItems = async (req, res) => {
    try {
        const products = await Product.find().populate('user', 'name email').sort({ lastChecked: -1 });
        res.json(products);
    } catch (error) {
        console.error("Get All Tracked Items Error:", error);
        res.status(500).json({ error: "Failed to fetch all tracked items" });
    }
};