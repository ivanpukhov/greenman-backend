const meiliSearchClient = require('./meiliSearchClient'); // Путь к вашему MeiliSearch клиенту
const Product = require('../models/Product'); // Путь к вашей модели продукта

async function indexProducts() {
    try {
        // Получение всех продуктов из базы данных
        const products = await Product.findAll({
            include: [{ all: true }] // Если у вас есть связанные модели, их тоже можно загрузить
        });

        // Подготовка продуктов для индексации
        const formattedProducts = products.map(product => product.toJSON());

        // Очистка существующего индекса (опционально)
        await meiliSearchClient.index('products').deleteAllDocuments();

        // Индексация продуктов
        await meiliSearchClient.index('products').addDocuments(formattedProducts);

        console.log('Все продукты проиндексированы в MeiliSearch');
    } catch (error) {
        console.error('Ошибка при индексации продуктов:', error);
    }
}

indexProducts();
