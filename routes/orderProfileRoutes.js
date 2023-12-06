const express = require('express');
const OrderProfileController = require('../controllers/orders/OrderProfileController'); // Путь к OrderProfileController

const router = express.Router();

router.post('/', OrderProfileController.createOrderProfile);
router.get('/user/:userId', OrderProfileController.getOrderProfiles);
router.put('/:profileId', OrderProfileController.updateOrderProfile);
router.delete('/:profileId', OrderProfileController.deleteOrderProfile);

module.exports = router;
