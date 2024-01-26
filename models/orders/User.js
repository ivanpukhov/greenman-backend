const Sequelize = require('sequelize');
const orderDB = require('../../utilities/orderDatabase');
const Order = require("./Order");
const OrderProfile = require("./OrderProfile");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const User = orderDB.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    phoneNumber: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    role: {
        type: Sequelize.STRING,
        defaultValue: 'user' // 'user' или 'admin'
    },
    confirmationCode: {
        type: Sequelize.STRING,
        allowNull: true
    },
    confirmationCodeExpires: {
        type: Sequelize.DATE,
        allowNull: true
    },
    isPhoneConfirmed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    resetPasswordCode: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    resetPasswordExpires: {
        type: Sequelize.DATE,
        allowNull: true,
    }

});

User.beforeCreate(async (user, options) => {
    user.password = await bcrypt.hash(user.password, saltRounds);
});

User.beforeUpdate(async (user, options) => {
    if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, saltRounds);
    }
});


User.hasMany(Order, { foreignKey: 'userId' });
User.hasMany(OrderProfile, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });
OrderProfile.belongsTo(User, { foreignKey: 'userId' });

module.exports = User;
