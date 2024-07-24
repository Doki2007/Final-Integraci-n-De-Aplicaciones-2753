const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const Client = require('../models/client');
const clientRoutes = require('../routes/clientRoutes');

const app = express();
app.use(bodyParser.json());
app.use('/api/clients', clientRoutes);
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

  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Client CRUD', () => {
  it('should create a client', async () => {
    const res = await request(app)
      .post('/api/clients')
      .send({
        nombre: 'Test Client',
        email: 'testclient@example.com',
        telefono: '123456789',
        direccion: 'Test Address',
        password: 'testpassword'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('email', 'testclient@example.com');
  });

  it('should get all clients', async () => {
    const res = await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should get a client by id', async () => {
    const res = await request(app)
      .get('/api/clients/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('idcliente', 1);
  });

  it('should update a client', async () => {
    const res = await request(app)
      .put('/api/clients/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Updated Client',
        email: 'updatedclient@example.com'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('nombre', 'Updated Client');
  });

  it('should delete a client', async () => {
    const res = await request(app)
      .delete('/api/clients/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(204);
  });
});
