const express = require('express');
const orderController = require('../controllers/orders/orderController'); // Путь к orderController

const router = express.Router();

router.post('/add', orderController.addOrder);
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);
router.put('/:id/status', orderController.updateOrderStatus);
router.put('/:id/trackingNumber', orderController.addTrackingNumber);
router.get('/user/:userId', orderController.getOrdersByUserId); // Новый маршрут

module.exports = router;
