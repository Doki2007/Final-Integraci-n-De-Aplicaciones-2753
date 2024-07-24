const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');
const Category = require('../models/category');
const categoryRoutes = require('../routes/categoryRoutes');
const authenticateToken = require('../middleware/auth');

const app = express();
app.use(bodyParser.json());
app.use('/api/categories', categoryRoutes);

let token;
let sequelize;

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret';
  token = jwt.sign({ id: 1, email: 'test@example.com' }, 
    process.env.JWT_SECRET, { expiresIn: '1h' });

  sequelize = new Sequelize('sqlite::memory:', {
    logging: false
  });

  Category.init({
    idcategoria: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    descripcion: {
      type: Sequelize.STRING,
    },
  }, {
    sequelize,
    modelName: 'categoria',
    timestamps: false
  });

  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Category CRUD', () => {
  it('should create a category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Test Category',
        descripcion: 'Test Description'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('nombre', 'Test Category');
  });

  it('should get all categories', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should get a category by id', async () => {
    const res = await request(app)
      .get('/api/categories/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('idcategoria', 1);
  });

  it('should update a category', async () => {
    const res = await request(app)
      .put('/api/categories/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Updated Category',
        descripcion: 'Updated Description'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('nombre', 'Updated Category');
  });

  it('should delete a category', async () => {
    const res = await request(app)
      .delete('/api/categories/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(204);
  });
});
