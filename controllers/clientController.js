const bcrypt = require('bcrypt');
const Client = require('../models/client');

exports.createClient = async (req, res) => {
    try {
        const { password, email, ...rest } = req.body;

        // Validar si el email ya existe
        const existingClient = await Client.findOne({ where: { email } });
        if (existingClient) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el cliente
        const client = await Client.create({ ...rest, email, password: hashedPassword });
        res.status(201).json(client);
    } catch (error) {
        console.error(error); // Agregar esta línea para depuración
        res.status(400).json({ error: error.message });
    }
};

exports.getAllClients = async (req, res) => {
    try {
        const clients = await Client.findAll();
        res.status(200).json(clients);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getClientById = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (client) {
            res.status(200).json(client);
        } else {
            res.status(404).json({ message: 'Client not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateClient = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (client) {
            await client.update(req.body);
            res.status(200).json(client);
        } else {
            res.status(404).json({ message: 'Client not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteClient = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (client) {
            await client.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Client not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
