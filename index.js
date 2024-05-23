const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1111',
    database: 'db-choco'
});

app.post('/login', (req, res) => {
    const sqlUserCheck = "SELECT username, password, token FROM users WHERE username = ?";
    const valuesUserCheck = [req.body.matricula];

    db.query(sqlUserCheck, valuesUserCheck, (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error del servidor" });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const user = data[0];

        if (user.password !== req.body.password) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // Excluir la password de la respuesta
        const { username, token } = user;
        return res.status(200).json({ username, token });
    });
});

app.listen(8000, () => {
    console.log("En línea...");
});
