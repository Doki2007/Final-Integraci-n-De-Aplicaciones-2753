const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const Order = require('../models/order');
const Client = require('../models/client');
const orderRoutes = require('../routes/orderRoutes');

const app = express();
app.use(bodyParser.json());
app.use('/api/orders', orderRoutes);
let token;
let sequelize;

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret';
  token = jwt.sign({ id: 1, email: 'test@example.com' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  sequelize = new Sequelize('sqlite::memory:', {
    logging: false
  });

  Client.init({
    idcliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'clientes',
    timestamps: false
  });

  Order.init({
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
        model: Client,
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
  }, {
    sequelize,
    modelName: 'ordens',
    timestamps: false
  });

  Client.hasMany(Order, { foreignKey: 'idcliente' });
  Order.belongsTo(Client, { foreignKey: 'idcliente' });

  await sequelize.sync({ force: true });

  // Crea un cliente para las pruebas
  await Client.create({
    idcliente: 1,
    nombre: 'Test Client',
    email: 'testclient@example.com',
    telefono: '123456789',
    direccion: 'Test Address',
    password: 'testpassword'
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Order CRUD', () => {
  it('should create an order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        idcliente: 1,
        productos: 'Test Product',
        cantidad: 1,
        total: 100.0
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('productos', 'Test Product');
  });

  it('should get all orders', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should get an order by id', async () => {
    const res = await request(app)
      .get('/api/orders/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('idorden', 1);
  });

  it('should update an order', async () => {
    const res = await request(app)
      .put('/api/orders/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productos: 'Updated Product',
        cantidad: 2,
        total: 200.0
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('productos', 'Updated Product');
  });

  it('should delete an order', async () => {
    const res = await request(app)
      .delete('/api/orders/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(204);
  });
});
