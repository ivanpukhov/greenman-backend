const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./utilities/database');
const orderDB = require('./utilities/orderDatabase');

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});


sequelize.sync().then(result => {
    orderDB.sync().then(() => {
        console.log('База данных заказов синхронизирована.');
    }).catch(err => {
        console.error('Ошибка синхронизации базы данных заказов:', err);
    });
    app.listen(3000, '0.0.0.0', () => {
        console.log('Сервер запущен на порту 3000 и доступен по адресу http://0.0.0.0:3000');
    });
}).catch(err => {
    console.error('Ошибка при синхронизации с базой данных:', err);
});
