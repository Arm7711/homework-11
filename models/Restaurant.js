import { DataTypes, Model, Sequelize } from 'sequelize';
import sequelize from '../clients/db.sequelize.mysql.js';

class Restaurant extends Model {

  static setLocationFields(payload) {
    const hasCoords = payload.latitude != null && payload.longitude != null;

    if (hasCoords) {
      const lat = Number(payload.latitude);
      const lon = Number(payload.longitude);

      payload.location = {
        type: 'Point',
        coordinates: [lon, lat]
      };
    }
  }

  static async findNearby({
    latitude,
    longitude,
    radius,
    page = 1,
    limit = 10,
    cuisineType,
    minRating,
    unit = 'km'
  }) {

    const lat = Number(latitude);
    const lon = Number(longitude);
    const distanceLimit = Number(radius);

    const paginationOffset = (page - 1) * limit;

    const conditions = { isOpen: true };

    cuisineType && (conditions.cuisineType = cuisineType);

    if (minRating != null) {
      conditions.rating = {
        [Sequelize.Op.gte]: Number(minRating)
      };
    }

    const distanceExpr = Sequelize.fn(
      'ST_Distance_Sphere',
      Sequelize.fn('POINT', Sequelize.col('longitude'), Sequelize.col('latitude')),
      Sequelize.fn('POINT', lon, lat)
    );

    return this.findAll({
      attributes: {
        include: [[distanceExpr, 'distance']]
      },
      where: {
        ...conditions,
        [Sequelize.Op.and]: [
          Sequelize.where(distanceExpr, '<=', distanceLimit)
        ]
      },
      order: [[distanceExpr, 'ASC']],
      limit: Number(limit),
      offset: Number(paginationOffset)
    });
  }
}

Restaurant.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { len: [3, 255] }
    },

    description: { type: DataTypes.TEXT },

    cuisineType: { type: DataTypes.STRING(100) },

    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
      validate: { min: -90, max: 90 }
    },

    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
      validate: { min: -180, max: 180 }
    },

    location: {
      type: DataTypes.GEOMETRY('POINT', 4326),
      allowNull: false
    },

    rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0,
      validate: { min: 0, max: 5 }
    },

    priceRange: {
      type: DataTypes.ENUM('$', '$$', '$$$', '$$$$'),
      defaultValue: '$$'
    },

    phone: { type: DataTypes.STRING(20) },

    isOpen: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    coverImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null
    },
  },
  {
    sequelize,
    modelName: 'Restaurant',
    tableName: 'restaurants',
    underscored: true,
    timestamps: true,
    hooks: {
      beforeValidate: (instance) => {
        const ready =
          instance.latitude != null &&
          instance.longitude != null;

        if (ready) {
          const lat = Number(instance.latitude);
          const lon = Number(instance.longitude);

          instance.location = {
            type: 'Point',
            coordinates: [lon, lat]
          };
        }
      }
    }
  }
);

export const associateRestaurant = (models) => {
  Restaurant.hasMany(models.Product, {
    foreignKey: 'restaurantId',
    as: 'products'
  });
};

export default Restaurant;
