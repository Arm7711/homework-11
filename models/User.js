import { Model, DataTypes } from 'sequelize';
import md5 from 'md5';
import sequelize from '../clients/db.sequelize.mysql.js';

const { USER_SECRET } = process.env;

class User extends Model {
  async comparePassword(plainPassword) {
    return this.password === md5(md5(plainPassword) + USER_SECRET);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [3, 100],
      },
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
      },
    },

    profilePicture: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,

    hooks: {
      async beforeCreate(user) {
        user.password = md5(md5(user.password) + USER_SECRET);
      },

    },
  }
);

export default User;
