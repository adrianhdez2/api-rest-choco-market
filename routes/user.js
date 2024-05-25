const express = require('express')
const router = express.Router();
const db = require('../db')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
    const query = "SELECT id, names, email, password, token, type FROM users WHERE email = ?";
    const { email, password } = req.body;

    db.query(query, [email], async (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error del servidor" });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const user = data[0];
        const validatePassword = await bcrypt.compare(password, user.password)

        if (!validatePassword) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        const token = jwt.sign({ id: user.id }, user.token, { expiresIn: '24h' });
        res.status(200).json({ token });
    });
});

router.post('/register', async (req, res) => {
    const { names, lastnameP, lastnameM, email, password, passwordConfirm } = req.body;
    if (password !== passwordConfirm) return res.status(401).json({ error: "Las contraseñas no coinciden" });

    const queryEmail = "SELECT * FROM users WHERE email = ?"

    db.query(queryEmail, [email], async (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error del servidor" });
        }

        if (data.length > 0) {
            return res.status(401).json({ error: "Parece que este correo ya existe" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const secret = crypto.randomBytes(64).toString('hex');

        const query = 'INSERT INTO users (names, apellidoP, apellidoM, email, password, token) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [names, lastnameP, lastnameM, email, hashedPassword, secret], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.status(200).json({ message: 'User registered successfully' });
        });
    })


});

router.get('/:id', (req, res) => {
    const { id } = req.params;

    const query = "SELECT names, type, pathIMG FROM users WHERE id = ?"

    db.query(query, [id], async (err, data) => {
        if (err) return res.status(500).json({ error: err });

        res.status(200).json(data[0])
    })
});

module.exports = router;