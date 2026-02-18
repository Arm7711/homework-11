import { DataTypes, Model } from 'sequelize';
import sequelize from '../clients/db.sequelize.mysql.js';

class Product extends Model {}

Product.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        restaurantId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: { len: [2, 255] }
        },
        description: {
            type: DataTypes.TEXT
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: { min: 0 }
        },
        category: {
            type: DataTypes.STRING(100)
        },
        isAvailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        images: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null
        }
    },
    {
        sequelize,
        modelName: 'Product',
        tableName: 'products',
        underscored: true,
        timestamps: true
    }
);

export const associateProduct = (models) => {
    Product.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant'
    });
};

export default Product;
