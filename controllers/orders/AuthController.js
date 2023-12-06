const bcrypt = require('bcrypt');
const User = require('../../models/orders/User'); // Убедитесь, что путь к модели User верный
const jwtUtility = require('../../utilities/jwtUtility'); // Убедитесь, что путь к утилите JWT верный

const AuthController = {
    // Метод для регистрации пользователя
    async register(req, res) {
        try {
            const { phoneNumber, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);

            // Проверка на уникальность номера телефона
            const existingUser = await User.findOne({ where: { phoneNumber } });
            if (existingUser) {
                return res.status(409).json({ message: 'Пользователь с таким номером телефона уже существует' });
            }

            const user = await User.create({
                phoneNumber,
                password: hashedPassword
            });

            const token = jwtUtility.generateToken(user.id);

            res.status(201).json({ user, token });
        } catch (error) {
            res.status(500).json({ message: 'Ошибка при регистрации пользователя', error });
        }
    },

    // Метод для авторизации пользователя
    async login(req, res) {
        try {
            const { phoneNumber, password } = req.body;
            const user = await User.findOne({ where: { phoneNumber } });

            if (!user) {
                return res.status(401).json({ message: 'Неправильный номер телефона или пароль' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Неправильный номер телефона или пароль' });
            }

            const token = jwtUtility.generateToken(user.id);

            res.json({ user, token });
        } catch (error) {
            res.status(500).json({ message: 'Ошибка при входе в систему', error });
        }
    }
};

module.exports = AuthController;
