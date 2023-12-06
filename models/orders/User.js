const Sequelize = require('sequelize');
const orderDB = require('../../utilities/orderDatabase');
const Order = require("./Order");
const OrderProfile = require("./OrderProfile");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const User = orderDB.define('user', {
    id: {
        type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true
    }, phoneNumber: {
        type: Sequelize.STRING, unique: true, allowNull: false
    }, password: {
        type: Sequelize.STRING, allowNull: false
    }
});

User.beforeCreate(async (user, options) => {
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashedPassword;
});

User.beforeUpdate(async (user, options) => {
    if (user.changed('password')) {
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        user.password = hashedPassword;
    }
});

User.hasMany(Order, {foreignKey: 'userId'});
User.hasMany(OrderProfile, {foreignKey: 'userId'});
Order.belongsTo(User, {foreignKey: 'userId'});
OrderProfile.belongsTo(User, {foreignKey: 'userId'});



module.exports = User;
