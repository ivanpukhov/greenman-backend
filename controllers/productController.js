const Product = require('../models/Product');
const ProductType = require('../models/ProductType');
const meiliSearchClient = require('../utilities/meiliSearchClient');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const productController = {
    // Добавление нового продукта

    addProduct: async (req, res) => {
        try {
            const { name, description, applicationMethodChildren, applicationMethodAdults, diseases, contraindications, types } = req.body;
            let videoUrl = req.file ? req.file.path : null;

            const product = await Product.create({
                name,
                description,
                applicationMethodChildren,
                applicationMethodAdults,
                diseases,
                contraindications,
                videoUrl
            });

            if (types && types.length > 0) {
                await Promise.all(types.map(async (type) => {
                    await ProductType.create({...type, productId: product.id});
                }));
            }
            try {
                await meiliSearchClient.index('products').addDocuments([product.toJSON()]);
            } catch (meiliError) {
                console.error('Ошибка индексации в MeiliSearch:', meiliError);
            }

            res.status(201).json(product);
            res.status(201).json(product);
        } catch (err) {
            res.status(400).json({error: err.message});
        }
    },

    getProductsByIdsAndTypes: async (req, res) => {
        try {
            const idsAndTypes = req.body.ids; // Пример: [{ productId: 1, typeIndex: 0 }, { productId: 2, typeIndex: 1 }]
            const productsInfo = await Promise.all(idsAndTypes.map(async item => {
                const product = await Product.findByPk(item.productId, {
                    include: [{
                        model: ProductType,
                        as: 'types'
                    }]
                });

                if (!product || !product.types[item.typeIndex]) {
                    return null;
                }

                return {
                    id: product.id,
                    name: product.name,
                    type: product.types[item.typeIndex]
                };
            }));

            res.json(productsInfo.filter(info => info !== null));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },



    getAllProducts: async (req, res) => {
        try {
            const products = await Product.findAll({
                include: [{model: ProductType, as: 'types'}]
            });
            res.json(products);
        } catch (err) {
            res.status(500).json({error: err.message});
        }
    },

    getProductById: async (req, res) => {
        try {
            const product = await Product.findByPk(req.params.id, {
                include: [{model: ProductType, as: 'types'}]
            });
            if (product) {
                res.json(product);
            } else {
                res.status(404).json({error: 'Продукт не найден'});
            }
        } catch (err) {
            res.status(500).json({error: err.message});
        }
    },

    // Обновление продукта
    updateProduct: async (req, res) => {
        try {
            const {name, description, applicationMethod, diseases, contraindications} = req.body;
            let videoUrl = req.file ? req.file.path : null;


            const updated = await Product.update({
                name,
                description,
                applicationMethod,
                diseases,
                contraindications,
                videoUrl
            }, {where: {id: req.params.id}});
            if (updated[0] > 0) {
                const updatedProduct = await Product.findByPk(req.params.id);
                // Обновление в MeiliSearch
                try {
                    await meiliSearchClient.index('products').updateDocuments([updatedProduct.toJSON()]);
                } catch (meiliError) {
                    console.error('Ошибка обновления индекса в MeiliSearch:', meiliError);
                }
                res.json(updatedProduct);
            } else {
                res.status(404).json({error: 'Продукт не найден'});
            }
        } catch (err) {
            res.status(500).json({error: err.message});
        }
    },

    // Удаление продукта
    deleteProduct: async (req, res) => {
        try {
            const deleted = await Product.destroy({where: {id: req.params.id}});
            if (deleted) {
                // Удаление из MeiliSearch
                try {
                    await meiliSearchClient.index('products').deleteDocument(req.params.id);
                } catch (meiliError) {
                    console.error('Ошибка удаления из индекса MeiliSearch:', meiliError);
                }
                res.status(204).send();
            } else {
                res.status(404).json({error: 'Продукт не найден'});
            }
        } catch (err) {
            res.status(500).json({error: err.message});
        }
    },

    // Поиск продуктов по названию
    searchProductsByName: async (req, res) => {
        try {
            const { name } = req.params;
            const searchResults = await meiliSearchClient.index('products').search(name, {
                attributesToRetrieve: ['name', 'description', 'id'],
                limit: 20,
                attributesToSearchOn: ['name'] // Ограничение поиска только по названию
            });

            res.json(searchResults.hits);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка поиска: ' + err.message });
        }
    },

    // Поиск продуктов по болезни
    searchProductsByDisease: async (req, res) => {
        try {
            const { disease } = req.params; // Получение названия болезни из параметров запроса

            // Выполнение поиска с помощью MeiliSearch
            const searchResults = await meiliSearchClient.index('products').search(disease, {
                attributesToRetrieve: ['name', 'description', 'diseases', 'id'],
                limit: 20,
                attributesToSearchOn: ['diseases'] // Ограничение поиска только по заболеваниям
            });

            // Отправка результатов поиска клиенту
            res.json(searchResults.hits);
        } catch (err) {
            // Обработка возможных ошибок
            res.status(500).json({ error: 'Ошибка поиска: ' + err.message });
        }
    },
};

module.exports = productController;
