const express = require('express')
const mysql = require('mysql')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1111',
    database: 'db-choco'
})

app.post('/login', (req, res) => {
    const sql = "SELECT * FROM users WHERE username = ? OR password = ?"
    const values = [
        req.body.matricula,
        req.body.password
    ]
    db.query(sql, values, (err, data) => {
        if (err) return res.json("Credenciales invalidas")

        return res.json(data)
    })
})

app.listen(8000, () => {
    console.log("En linea...");
})