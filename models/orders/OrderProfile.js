const Sequelize = require('sequelize');
const orderDB = require('../../utilities/orderDatabase'); // Путь к вашему файлу подключения


const OrderProfile = orderDB.define('orderProfile', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    addressIndex: {
        type: Sequelize.STRING,
        allowNull: false
    },
    city: {
        type: Sequelize.STRING,
        allowNull: false
    },
    street: {
        type: Sequelize.STRING,
        allowNull: false
    },
    houseNumber: {
        type: Sequelize.STRING,
        allowNull: false
    }
    // Дополнительные поля при необходимости
});

module.exports = OrderProfile;
