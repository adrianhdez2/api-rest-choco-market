import { AuthModel } from "../models/mysql/auth.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config()

export class AuthController {
    static async getLoginToken(req, res) {  // --> Obtener el token al hacer el login
        const { email, password } = req.body
        const user = await AuthModel.getUserByEmail({ email })

        if (!user) return res.status(404).json({ error: 'Email not found' })

        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch) return res.status(401).json({ error: 'Invalid password' })

        const token = jwt.sign({ id: user.user_id }, process.env.KEY, { expiresIn: '10d' })
        res.cookie("token", token, { httpOnly: true, maxAge: 10 * 24 * 60 * 60 * 1000, secure: true })
        return res.status(200).json({ token })
    }

    static async logOut(req, res) {
        try {
            const token = req.cookies.token
            if (token) {
                res.clearCookie("token");
                return res.json({ status: true, message: 'Se cerró la sesión' })
            }

            return res.json({ status: false, message: 'Error al cerrar sesión' })
        } catch (error) {
            return res.json(error)
        }
    }

    static async sendEmail(req, res) {
        const { email } = req.body
        const user = await AuthModel.getUserByEmail({ email })

        if (!user) return res.status(401).json({ error: 'Email not found' })

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
    }
}