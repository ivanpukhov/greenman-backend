const Order = require('../../models/orders/Order');
const sendNotification = require('../../utilities/notificationService');

const orderController = {
    // Добавление нового заказа
    addOrder: async (req, res) => {
        try {
            const { customerName, addressIndex, city, street, houseNumber, phoneNumber, deliveryMethod, paymentMethod, products, totalPrice } = req.body;
            const cleanPhoneNumber = phoneNumber.replace('+7', ''); // Удаление +7 из номера телефона

            const newOrder = await Order.create({
                customerName, addressIndex, city, street, houseNumber, phoneNumber: cleanPhoneNumber, deliveryMethod, paymentMethod, products, totalPrice
            });

            // Отправка уведомления о создании заказа
            await sendNotification(cleanPhoneNumber, 'Ваш заказ создан. Ссылка для отслеживания: http://yourserver.com/track-order');

            res.status(201).json(newOrder);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    // Получение всех заказов
    getAllOrders: async (req, res) => {
        try {
            const orders = await Order.findAll();
            res.json(orders);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Получение заказа по ID
    getOrderById: async (req, res) => {
        try {
            const order = await Order.findByPk(req.params.id);
            if (order) {
                res.json(order);
            } else {
                res.status(404).json({ error: 'Заказ не найден' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Обновление заказа
    updateOrder: async (req, res) => {
        try {
            const { customerName, addressIndex, city, street, houseNumber, phoneNumber, deliveryMethod, paymentMethod, products, totalPrice, status } = req.body;
            const cleanPhoneNumber = phoneNumber.replace('+7', '');

            const updated = await Order.update(
                { customerName, addressIndex, city, street, houseNumber, phoneNumber: cleanPhoneNumber, deliveryMethod, paymentMethod, products, totalPrice, status },
                { where: { id: req.params.id } }
            );

            if (updated[0] > 0) {
                const updatedOrder = await Order.findByPk(req.params.id);
                res.json(updatedOrder);
            } else {
                res.status(404).json({ error: 'Заказ не найден' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Удаление заказа
    deleteOrder: async (req, res) => {
        try {
            const deleted = await Order.destroy({ where: { id: req.params.id } });
            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).json({ error: 'Заказ не найден' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Обновление статуса заказа
    updateOrderStatus: async (req, res) => {
        try {
            const { status } = req.body;
            const order = await Order.findByPk(req.params.id);
            const updated = await Order.update({ status }, { where: { id: req.params.id } });

            if (updated[0] > 0) {
                // Отправка уведомления об изменении статуса
                await sendNotification(order.phoneNumber, `Статус вашего заказа изменен на: ${status}`);
                res.json({ message: 'Статус заказа обновлен.' });
            } else {
                res.status(404).json({ error: 'Заказ не найден' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Добавление трек-номера
    addTrackingNumber: async (req, res) => {
        try {
            const { trackingNumber } = req.body;
            const order = await Order.findByPk(req.params.id);
            const updated = await Order.update({ trackingNumber }, { where: { id: req.params.id, status: 'оплачен' } });

            if (updated[0] > 0) {
                // Отправка уведомления о трек-номере
                await sendNotification(order.phoneNumber, `Трек-номер вашего заказа: ${trackingNumber}`);
                res.json({ message: 'Трек-номер добавлен.' });
            } else {
                res.status(404).json({ error: 'Заказ не найден или еще не оплачен.' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = orderController;
