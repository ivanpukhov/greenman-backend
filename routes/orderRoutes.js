const express = require('express');
const orderController = require('../controllers/orders/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/add', orderController.addOrder); // Не защищён
router.get('/', authMiddleware, adminMiddleware, orderController.getAllOrders);
router.get('/:id', authMiddleware, adminMiddleware, orderController.getOrderById);
router.put('/:id', authMiddleware, adminMiddleware, orderController.updateOrder);
router.delete('/:id', authMiddleware, adminMiddleware, orderController.deleteOrder);
router.put('/:id/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);
router.put('/:id/trackingNumber', authMiddleware, adminMiddleware, orderController.addTrackingNumber);
router.get('/user/:userId', authMiddleware, orderController.getOrdersByUserId);

module.exports = router;
