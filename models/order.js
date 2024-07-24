const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const client = require('./client')
const Order = sequelize.define('ordens', {
    idorden: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    idcliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: client,
            key: 'idcliente'
        }
    },
    productos: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    total: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
}, 
{
    timestamps: false
});

module.exports = Order;
