const express = require('express');
const AuthController = require('../controllers/orders/AuthController'); // Убедитесь, что путь к AuthController указан верно

const router = express.Router();

// Маршрут для регистрации пользователя
router.post('/register', AuthController.register);

// Маршрут для входа пользователя
router.post('/login', AuthController.login);

// Маршрут для подтверждения телефона пользователя
router.post('/confirm-phone', AuthController.confirmPhone);

// Маршрут для запроса на сброс пароля
router.post('/request-password-reset', AuthController.requestPasswordReset);

// Маршрут для сброса пароля
router.post('/reset-password', AuthController.resetPassword);

router.post('/resend-confirmation-code', AuthController.resendConfirmationCode);

module.exports = router;
