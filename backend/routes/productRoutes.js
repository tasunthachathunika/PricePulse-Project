// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Existing Routes
router.post('/', productController.addProduct);
router.get('/', productController.getProducts);
router.delete('/:id', productController.deleteProduct);

// --- ALUTH ROUTE EKA (MEKA ADD KARANNA) ---
router.get('/popular', productController.getPopularProducts);

// GET ALL TRACKED ITEMS (ADMIN ONLY)
router.get('/all', productController.getAllTrackedItems);

module.exports = router;