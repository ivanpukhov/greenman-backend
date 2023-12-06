const express = require('express');
const AuthController = require('../controllers/orders/AuthController'); // Путь к AuthController

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

module.exports = router;
