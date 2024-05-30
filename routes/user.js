const express = require('express')
const router = express.Router()
const db = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
const crypto = require('node:crypto')
const cloudinary = require('../cloudinaryConfig');
dotenv.config()

// const secret = crypto.randomBytes(64).toString('hex')

router.post('/upload', (req, res) => {
    if (req.files === null) {
        return res.status(400).json({ msg: 'No file uploaded' });
    }

    const options = {
        folder: 'users'
    }

    const file = req.files.img_user;

    cloudinary.uploader.upload(file.tempFilePath, options, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({
            fileName: file.name,
            url: result.secure_url
        });
    });
});


router.post('/login', (req, res) => {
    const query = "SELECT user_id, email, password FROM users WHERE email = ?"
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


        const token = jwt.sign({ id: user.user_id }, process.env.KEY, { expiresIn: '10d' })
        res.cookie("token", token, { httpOnly: true, maxAge: 10 * 24 * 60 * 60 * 1000, secure: true })
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
        const date = new Date()
        const registerData = `${date.getFullYear()}-${date.getMonth() < 10 ? '0' + (date.getMonth() + 1) : date.getMonth()}-${date.getDate()}`
        const user_id = crypto.randomUUID()

        const query = 'INSERT INTO users (user_id, full_name, last_name_p, last_name_m, email, registration_date, password) VALUES (?, ?, ?, ?, ?, ?, ?)'
        db.query(query, [user_id, names, lastnameP, lastnameM, email, registerData, hashedPassword], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err })
            }
            res.status(200).json({ message: 'User registered successfully' })
        })
    })
})

router.post('/user', (req, res) => {
    const token = req.cookies.token;
    const { status } = req.body

    if (!token || !status) return res.status(401).json({ error: "Usuario no disponible" });

    try {
        const decoded = jwt.verify(token, process.env.KEY);
        const id = decoded.id;

        const query = "SELECT user_id, full_name, last_name_p, last_name_m, phone, email, user_role, picture FROM users WHERE user_id = ?";
        db.query(query, [id], (err, data) => {
            if (err) return res.status(500).json({ error: err });

            res.status(200).json(data[0]);
        });

    } catch (error) {
        res.status(401).json({ error: "El token de usuario no existe" });
    }
})

router.post('/forgot-password', (req, res) => {
    const { email } = req.body

    const sql = "SELECT user_id, email FROM users WHERE email = ?"

    db.query(sql, [email], async (err, data) => {
        if (err) return res.status(500).json({ error: err })

        if (data.length === 0) {
            return res.status(401).json({ error: "Este correo no existe" })
        }
        const user = data[0]
        const token = jwt.sign({ id: user.user_id }, process.env.KEY, { expiresIn: '5m' })
        const year = new Date()

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
            html: `
            <!DOCTYPE html>
            <html lang="es">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reestablecer contraseña</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
            
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border: 1px solid #dddddd;
                    }
            
                    .email-header {
                        text-align: center;
                        padding: 10px 0;
                        background-color: #f68e41;
                        color: #ffffff;
                    }
            
                    .email-header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
            
                    .email-body {
                        padding: 20px;
                        color: #333333;
                    }
            
                    .email-body h2 {
                        font-size: 20px;
                        margin-top: 0;
                    }
            
                    .email-body p {
                        font-size: 16px;
                        line-height: 1.5;
                    }
            
                    .email-footer {
                        text-align: center;
                        padding: 10px;
                        background-color: #f4f4f4;
                        font-size: 14px;
                        color: #888888;
                    }
            
                    .button {
                        display: inline-block;
                        padding: 10px 20px;
                        color: #ffffff;
                        background-color: #f68e41;
                        text-decoration: none;
                        border-radius: 5px;
                        margin-bottom: 10px;
                    }
            
                    .button:visited {
                        color: #ffffff;
                    }
            
                    small {
                        display: block;
                        margin-bottom: 30px;
                    }
                </style>
            </head>
            
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <h1>Choco Market</h1>
                    </div>
                    <div class="email-body">
                        <h2>Hola,</h2>
                        <p>Hemos recibido una solicitud para restablecer la contraseña de su cuenta. Si no envió la solicitud, omita
                            este
                            correo electrónico y continúe
                            utilizando su contraseña actual.</p>
                        <p> Para restablecer su contraseña, haga clic en el siguiente botón en 5 minutos:</p>
                        <a href="http://localhost:5173/resetPassword/${token}" class="button">Reestablecer contraseña</a>
                        <small>Si tienes dudas, sientete libre de responder este correo. ¡Estamos aqui para ayudarte!</small>
                        <p>Atte. Choco Market</p>
                    </div>
                    <div class="email-footer">
                        <p>&copy; ${year.getFullYear()} Choco Market. Todos los derechos reservados.</p>
                        <p><a href="http://localhost:5173/" style="color: #0073e6; text-decoration: none;">Choco Market</a>
                        </p>
                    </div>
                </div>
            </body>
            
            </html>
            `
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
        const sql = "UPDATE users SET password = ? WHERE user_id = ?"

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