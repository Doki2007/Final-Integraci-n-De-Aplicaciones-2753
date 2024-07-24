const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('categoria', {
    idcategoria: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING,
    },
}, 
{
    timestamps: false
});

module.exports = Category;
