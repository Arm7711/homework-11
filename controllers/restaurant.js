import { Restaurant as DiningPlace } from '../models/index.js';
import Item from "../models/Products.js";
import StorageUtil from "../services/utils.js";

export const createRestaurant = async (req, res) => {
  const uploadedFile = req.file;
  const imagePath = StorageUtil.getFilePath(uploadedFile);

  try {
    const dataToCreate = { ...req.body, coverImage: imagePath };

    const created = await DiningPlace.create(dataToCreate);

    const payload = await DiningPlace.findByPk(created.id, {
      attributes: { exclude: ['location'] }
    });

    return res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: payload,
    });
  } catch (err) {
    if (imagePath) StorageUtil.deleteFile(imagePath);

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAllRestaurants = async (req, res) => {
  try {
    const { cuisineType, priceRange } = req.query;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    const filters = {};
    cuisineType && (filters.cuisineType = cuisineType);
    priceRange && (filters.priceRange = priceRange);

    const offset = (page - 1) * limit;

    const result = await DiningPlace.findAndCountAll({
      where: filters,
      limit,
      offset,
      attributes: { exclude: ['location'] },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      total: result.count,
      page,
      totalPages: Math.ceil(result.count / limit),
      data: result.rows
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const getRestaurantById = async (req, res) => {
  try {
    const id = req.params.id;

    const payload = await DiningPlace.findByPk(id, {
      include: { model: Item, as: 'products' },
      attributes: { exclude: ['location'] },
    });

    if (payload === null) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    return res.json({
      status: 'ok',
      data: payload
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

export const updateRestaurant = async (req, res) => {
  const uploadedFile = req.file;

  try {
    const id = req.params.id;

    const record = await DiningPlace.findByPk(id);

    if (record === null) {
      if (uploadedFile) StorageUtil.deleteFile(uploadedFile.path);

      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (uploadedFile) {
      const nextImage = StorageUtil.getFilePath(uploadedFile);

      if (record.coverImage) {
        StorageUtil.deleteFile(record.coverImage);
      }

      req.body.coverImage = nextImage;
    }

    DiningPlace.setLocationFields(req.body);

    await record.update(req.body);

    const payload = await DiningPlace.findByPk(id, {
      attributes: { exclude: ['location'] }
    });

    return res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      data: payload
    });
  } catch (err) {
    if (uploadedFile) StorageUtil.deleteFile(uploadedFile.path);

    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const deleteRestaurant = async (req, res) => {
  try {
    const id = req.params.id;

    const record = await DiningPlace.findByPk(id);

    if (record === null) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    const image = record.coverImage;

    await record.destroy();

    if (image) StorageUtil.deleteFile(image);

    return res.json({
      status: 'ok',
      message: 'Restaurant deleted'
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

export const findNearbyRestaurants = async (req, res) => {
  try {
    const query = req.query;

    const nearby = await DiningPlace.findNearby({
      latitude: query.latitude,
      longitude: query.longitude,
      radius: query.radius,
      page: query.page,
      limit: query.limit,
      cuisineType: query.cuisineType,
      minRating: query.minRating
    });

    return res.json({
      status: 'ok',
      data: nearby
    });
  } catch (err) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};
