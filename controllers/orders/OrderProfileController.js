const OrderProfile = require('../../models/orders/OrderProfile'); // Путь к модели OrderProfile
const User = require('../../models/orders/User'); // Путь к модели User

const OrderProfileController = {
    // Создание нового профиля заказа
    async createOrderProfile(req, res) {
        try {
            const { userId, name, addressIndex, city, street, houseNumber } = req.body;

            // Проверка существования пользователя
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            const orderProfile = await OrderProfile.create({
                userId,
                name,
                addressIndex,
                city,
                street,
                houseNumber
            });

            res.status(201).json(orderProfile);
        } catch (error) {
            res.status(500).json({ message: 'Ошибка при создании профиля заказа', error });
        }
    },

    // Получение всех профилей заказов пользователя
    async getOrderProfiles(req, res) {
        try {
            const { userId } = req.params;
            const orderProfiles = await OrderProfile.findAll({ where: { userId } });
            res.json(orderProfiles);
        } catch (error) {
            res.status(500).json({ message: 'Ошибка при получении профилей заказов', error });
        }
    },

    // Обновление профиля заказа
    async updateOrderProfile(req, res) {
        try {
            const { profileId } = req.params;
            const updatedData = req.body;

            const updated = await OrderProfile.update(updatedData, { where: { id: profileId } });

            if (updated[0] > 0) {
                const updatedProfile = await OrderProfile.findByPk(profileId);
                res.json(updatedProfile);
            } else {
                res.status(404).json({ message: 'Профиль заказа не найден' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Ошибка при обновлении профиля заказа', error });
        }
    },

    // Удаление профиля заказа
    async deleteOrderProfile(req, res) {
        try {
            const { profileId } = req.params;
            const deleted = await OrderProfile.destroy({ where: { id: profileId } });

            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Профиль заказа не найден' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Ошибка при удалении профиля заказа', error });
        }
    }
};

module.exports = OrderProfileController;
