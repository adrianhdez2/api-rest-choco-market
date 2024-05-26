const express = require('express')
const router = express.Router()
const db = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
dotenv.config()

// const secret = crypto.randomBytes(64).toString('hex')

router.post('/login', (req, res) => {
    const query = "SELECT id, email, password FROM users WHERE email = ?"
    const { email, password } = req.body

    db.query(query, [email], async (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error del servidor" })
        }

        if (data.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" })
        }

        const user = data[0]
        const validatePassword = await bcrypt.compare(password, user.password)

        if (!validatePassword) {
            return res.status(401).json({ error: "Contraseña incorrecta" })
        }


        const token = jwt.sign({ id: user.id }, process.env.KEY, { expiresIn: '24h' })
        res.cookie("token", token, { httpOnly: true, maxAge: 360000, secure: true})
        return res.status(200).json({ token })
    })
})

router.post('/register', async (req, res) => {
    const { names, lastnameP, lastnameM, email, password, passwordConfirm } = req.body
    if (password !== passwordConfirm) return res.status(401).json({ error: "Las contraseñas no coinciden" })

    const queryEmail = "SELECT * FROM users WHERE email = ?"

    db.query(queryEmail, [email], async (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error del servidor" })
        }

        if (data.length > 0) {
            return res.status(401).json({ error: "Parece que este correo ya existe" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const query = 'INSERT INTO users (names, apellidoP, apellidoM, email, password) VALUES (?, ?, ?, ?, ?)'
        db.query(query, [names, lastnameP, lastnameM, email, hashedPassword], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err })
            }
            res.status(200).json({ message: 'User registered successfully' })
        })
    })
})

router.get('/:id', (req, res) => {
    const { id } = req.params

    const query = "SELECT names, type, pathIMG FROM users WHERE id = ?"

    db.query(query, [id], async (err, data) => {
        if (err) return res.status(500).json({ error: err })

        res.status(200).json(data[0])
    })
})

router.post('/forgot-password', (req, res) => {
    const { email } = req.body

    const sql = "SELECT id, email FROM users WHERE email = ?"

    db.query(sql, [email], async (err, data) => {
        if (err) return res.status(500).json({ error: err })

        if (data.length === 0) {
            return res.status(401).json({ error: "Este correo no existe" })
        }
        const user = data[0]
        const token = jwt.sign({ id: user.id }, process.env.KEY, { expiresIn: '5m' })

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL,
                pass: process.env.PASS
            }
        })

        var mailOptions = {
            from: process.env.MAIL,
            to: email,
            subject: 'Reestablecer contraseña',
            text: `http://localhost:5173/resetPassword/${token}`
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return res.status(401).json({ error: error })
            } else {
                return res.json({ status: true, message: "Se envió correctamente" })
            }
        })
    })
})

router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params
    const { password, passwordConfirm } = req.body

    if (password !== passwordConfirm) return res.status(401).json({ error: "Las contraseñas no coinciden" })

    try {
        const decoded = await jwt.verify(token, process.env.KEY)
        const id = decoded.id
        const hashedPassword = await bcrypt.hash(password, 10)
        const sql = "UPDATE users SET password = ? WHERE id = ?"

        db.query(sql, [hashedPassword, id], (err, data) => {
            if (err) return res.status(500).json({ error: err })

            return res.json({ status: true, message: "Se actualizó la contraseña" })
        })
    } catch (error) {
        res.status(401).json({ error: "El token de usuario ha expirado" })
    }
})

const verifyUser = async (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token) {
            return res.json({ status: false, message: 'No hay sesión iniciada' })
        }
        const decoded = jwt.verify(token, process.env.KEY)
        next()
    } catch (error) {
        return res.json(error)
    }
}

router.get('/verify', verifyUser, (req, res) => {
    return res.json({ status: true, message: "Authorized" });
});


router.get('/logout', (req, res) => {
    res.clearCookie("token");
    res.json({ message: 'Logout successful' });
});


module.exports = router;