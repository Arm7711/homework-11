import { Restaurant } from '../models/index.js';
import Product from '../models/Products.js';
import FileHelper from '../services/utils.js';

export const createProduct = async (req, res) => {
    const images = req.files ? req.files.map(file => FileHelper.getFilePath(file)) : [];

    try {
        const restaurantId = Number(req.params.restaurantId);
        const restaurant = await Restaurant.findByPk(restaurantId);

        if (!restaurant) {
            for (const img of images) {
                FileHelper.deleteFile(img);
            }

            return res.status(404).json({
                success: false,
                error: 'Restaurant not found'
            });
        }

        const newProduct = await Product.create({
            ...req.body,
            restaurantId: restaurantId,
            images: images
        });

        return res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: newProduct
        });

    } catch (error) {
        for (const img of images) {
            FileHelper.deleteFile(img);
        }

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getProductsByRestaurant = async (req, res) => {
    try {
        const restaurantId = Number(req.params.restaurantId);
        const restaurant = await Restaurant.findByPk(restaurantId);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const category = req.query.category;
        const isAvailable = req.query.isAvailable;

        const offset = (page - 1) * limit;
        const where = { restaurantId: restaurantId };

        if (category) {
            where.category = category;
        }

        if (isAvailable !== undefined) {
            where.isAvailable = isAvailable === 'true';
        }

        const { count, rows } = await Product.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);

        return res.status(200).json({
            success: true,
            count: rows.length,
            total: count,
            currentPage: page,
            totalPages: totalPages,
            data: rows
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const restaurantId = Number(req.params.restaurantId);
        const productId = Number(req.params.id);

        const restaurant = await Restaurant.findByPk(restaurantId);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        const product = await Product.findOne({
            where: {
                id: productId,
                restaurantId: restaurantId
            },
            include: [
                {
                    model: Restaurant,
                    as: 'restaurant',
                    attributes: { exclude: ['location'] }
                }
            ]
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateProduct = async (req, res) => {
    const newImages = req.files ? req.files.map(file => FileHelper.getFilePath(file)) : [];

    try {
        const restaurantId = Number(req.params.restaurantId);
        const productId = Number(req.params.id);

        const restaurant = await Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            for (const img of newImages) {
                FileHelper.deleteFile(img);
            }
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        const product = await Product.findOne({
            where: { id: productId, restaurantId: restaurantId }
        });

        if (!product) {
            for (const img of newImages) {
                FileHelper.deleteFile(img);
            }
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const oldImages = product.images || [];
        const imagesToSave = newImages.length > 0 ? newImages : oldImages;

        await product.update({
            ...req.body,
            images: imagesToSave
        });

        if (newImages.length > 0) {
            for (const oldImg of oldImages) {
                FileHelper.deleteFile(oldImg);
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });

    } catch (error) {
        for (const img of newImages) {
            FileHelper.deleteFile(img);
        }
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const restaurantId = Number(req.params.restaurantId);
        const productId = Number(req.params.id);

        const restaurant = await Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        const product = await Product.findOne({
            where: { id: productId, restaurantId: restaurantId }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const images = product.images || [];

        await product.destroy();

        for (const img of images) {
            FileHelper.deleteFile(img);
        }

        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
