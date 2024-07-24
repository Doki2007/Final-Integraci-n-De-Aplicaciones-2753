const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const Product = require('../models/product');
const Category = require('../models/category');
const productRoutes = require('../routes/productRoutes');

const app = express();
app.use(bodyParser.json());
app.use('/api/products', productRoutes);

let token;
let sequelize;

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret';
  token = jwt.sign({ id: 1, email: 'test@example.com' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  sequelize = new Sequelize('sqlite::memory:', {
    logging: false
  });

  Category.init({
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
  }, {
    sequelize,
    modelName: 'categoria',
    timestamps: false
  });

  Product.init({
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
  }, {
    sequelize,
    modelName: 'productos',
    timestamps: false
  });

  Category.hasMany(Product, { foreignKey: 'idcategoria' });
  Product.belongsTo(Category, { foreignKey: 'idcategoria' });

  await sequelize.sync({ force: true });

  // Crea una categoría para las pruebas
  await Category.create({
    idcategoria: 1,
    nombre: 'Test Category',
    descripcion: 'Test Description'
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Product CRUD', () => {
  it('should create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        idcategoria: 1,
        nombre: 'Test Product',
        descripcion: 'Test Description',
        precio: 100.0,
        stock: 10
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('nombre', 'Test Product');
  });

  it('should get all products', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should get a product by id', async () => {
    const res = await request(app)
      .get('/api/products/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('idproducto', 1);
  });

  it('should update a product', async () => {
    const res = await request(app)
      .put('/api/products/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Updated Product',
        descripcion: 'Updated Description',
        precio: 200.0,
        stock: 20
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('nombre', 'Updated Product');
  });

  it('should delete a product', async () => {
    const res = await request(app)
      .delete('/api/products/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(204);
  });
});
