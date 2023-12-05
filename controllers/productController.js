const Product = require('../models/Product');
const ProductType = require('../models/ProductType');

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
            const {name} = req.params;
            const products = await Product.findAll({
                where: {name: {[Op.like]: `%${name}%`}}
            });
            res.json(products);
        } catch (err) {
            res.status(500).json({error: err.message});
        }
    },

    // Поиск продуктов по болезни
    searchProductsByDisease: async (req, res) => {
        try {
            const {disease} = req.params;
            const products = await Product.findAll({
                where: Sequelize.where(Sequelize.fn('JSON_CONTAINS', Sequelize.col('diseases'), Sequelize.literal(`'["${disease}"]'`)), true)
            });
            res.json(products);
        } catch (err) {
            res.status(500).json({error: err.message});
        }
    }
};

module.exports = productController;
