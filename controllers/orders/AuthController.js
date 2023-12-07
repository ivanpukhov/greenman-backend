const bcrypt = require('bcrypt');
const User = require('../../models/orders/User'); // Используйте верный путь к вашей модели User
const jwtUtility = require('../../utilities/jwtUtility');
const sendNotification = require('../../utilities/notificationService');
const Sequelize = require('sequelize');

const AuthController = {
    // Регистрация пользователя
    async register(req, res) {
        try {
            const {phoneNumber, password} = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);

            const existingUser = await User.findOne({where: {phoneNumber}});
            if (existingUser) {
                return res.status(409).json({message: 'Пользователь с таким номером телефона уже существует'});
            }

            const confirmationCode = generateConfirmationCode();
            const confirmationCodeExpires = new Date();
            confirmationCodeExpires.setMinutes(confirmationCodeExpires.getMinutes() + 10);

            await User.create({
                phoneNumber, password: hashedPassword, confirmationCode, confirmationCodeExpires
            });

            sendNotification(phoneNumber, `Ваш код подтверждения: ${confirmationCode}`);
            res.status(201).json({message: 'Пользователь создан, отправлен код подтверждения'});
        } catch (error) {
            res.status(500).json({message: 'Ошибка при регистрации пользователя', error});
        }
    },

    // Подтверждение телефона пользователя
    async confirmPhone(req, res) {
        try {
            const {phoneNumber, confirmationCode} = req.body;
            const user = await User.findOne({where: {phoneNumber}});

            if (!user || new Date() > user.confirmationCodeExpires) {
                return res.status(400).json({message: 'Неверный или устаревший код подтверждения'});
            }

            if (user.confirmationCode !== confirmationCode) {
                return res.status(400).json({message: 'Неверный код подтверждения'});
            }

            user.isPhoneConfirmed = true;
            user.confirmationCode = null;
            user.confirmationCodeExpires = null;
            await user.save();

            const token = jwtUtility.generateToken(user.id);
            res.status(200).json({message: 'Телефон подтвержден', token});
        } catch (error) {
            res.status(500).json({message: 'Ошибка при подтверждении телефона', error});
        }
    },

    // Вход пользователя в систему
    async login(req, res) {
        try {
            const {phoneNumber, password} = req.body;
            const user = await User.findOne({where: {phoneNumber}});

            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({message: 'Неправильный номер телефона или пароль'});
            }

            if (!user.isPhoneConfirmed) {
                if (new Date() > user.confirmationCodeExpires) {
                    user.confirmationCode = generateConfirmationCode();
                    user.confirmationCodeExpires = new Date();
                    user.confirmationCodeExpires.setMinutes(user.confirmationCodeExpires.getMinutes() + 10);
                    await user.save();
                    sendNotification(phoneNumber, `Ваш код подтверждения: ${user.confirmationCode}`);
                }
                return res.status(401).json({message: 'Телефон не подтвержден'});
            }

            const token = jwtUtility.generateToken(user.id);
            res.json({user, token});
        } catch (error) {
            res.status(500).json({message: 'Ошибка при входе в систему', error});
        }
    },

    // Повторная отправка кода подтверждения
    async resendConfirmationCode(req, res) {
        try {
            const {phoneNumber} = req.body;
            const user = await User.findOne({where: {phoneNumber}});

            if (!user || user.isPhoneConfirmed) {
                return res.status(404).json({message: 'Пользователь не найден или уже подтвержден'});
            }

            user.confirmationCode = generateConfirmationCode();
            user.confirmationCodeExpires = new Date();
            user.confirmationCodeExpires.setMinutes(user.confirmationCodeExpires.getMinutes() + 10);
            await user.save();

            sendNotification(phoneNumber, `Ваш код подтверждения: ${user.confirmationCode}`);
            res.status(200).json({message: 'Код подтверждения повторно отправлен'});
        } catch (error) {
            res.status(500).json({message: 'Ошибка при отправке кода подтверждения', error});
        }
    }, async requestPasswordReset(req, res) {
        const {phoneNumber} = req.body;
        const user = await User.findOne({where: {phoneNumber}});

        if (!user) {
            return res.status(404).json({message: 'Пользователь не найден'});
        }

        user.resetPasswordCode = generateConfirmationCode();
        user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 минут
        await user.save();

        sendNotification(phoneNumber, `Ваш код для сброса пароля: ${user.resetPasswordCode}`);
        res.status(200).json({message: 'Код для сброса пароля отправлен'});
    },

// Сброс пароля
    async resetPassword(req, res) {
        const {phoneNumber, resetPasswordCode, newPassword} = req.body;
        const user = await User.findOne({
            where: {
                phoneNumber, resetPasswordCode, resetPasswordExpires: {[Sequelize.Op.gt]: new Date()}
            }
        });

        if (!user) {
            return res.status(400).json({message: 'Неверный код сброса или код истек'});
        }
        const saltRounds = 10;

        user.password = await bcrypt.hash(newPassword, saltRounds);
        user.resetPasswordCode = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({message: 'Пароль успешно сброшен'});
    }
};

function generateConfirmationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = AuthController;
