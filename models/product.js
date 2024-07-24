const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./category')

const Product = sequelize.define('productos', {
    idproducto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    idcategoria: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Category,
            key: 'idcategoria'
        }
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING,
    },
    precio: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, 
{
    timestamps: false
});

module.exports = Product;
