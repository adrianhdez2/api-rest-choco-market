import connection from "../../configs/dbConnection.js"
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import { sendPersonalEmail } from "../../utils/sendEmail.js"

dotenv.config()

export class AuthModel {
    static async getById({ id }) {  // --> Obtener usuario por ID a la BD
        const [user] = await connection.query(
            'SELECT * FROM users WHERE user_id = ? ',
            [id]
        )

        if (user.length === 0) return null

        return user[0]
    }

    static async getUserByEmail({ email }) {  // --> Obtener usuario por email
        const [user] = await connection.query('SELECT user_id, email, password FROM users WHERE email = ? ', [email])
        if (user.length === 0) return null
        return user[0]
    }

    static async createUser({  // --> Crear nuevo usuario en la base de datos
        user_id,
        names,
        lastnameP,
        lastnameM,
        email,
        hashedPassword,
        picture,
        public_id_picture,
        registerDate
    }) {
        const [user] = await connection.query(
            'INSERT INTO users (user_id, full_name, last_name_p, last_name_m, email, password, picture, public_id_picture, registration_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [user_id, names, lastnameP, lastnameM, email, hashedPassword, picture, public_id_picture, registerDate]
        )

        return user
    }

    static async sendEmail({ email, token }) {
        const year = new Date()

        const body = `
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

        await sendPersonalEmail(email, 'Reestablecer contraseña', body)
    }

    static async sendEmailValidation({ email, tokenSend }) {
        const year = new Date()

        const body = `
        <!DOCTYPE html>
        <html lang="es">
        
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verificar correo electrónico</title>
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
                    <p> Para verificar su correo electrónico, haga click en el siguiente enlace:</p>
                    <a href="http://localhost:5173/verify/${tokenSend}" class="button">Verificar correo electrónico</a>
                    <small>Este enlace solo es valido por 5 minutos.</small>
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

        await sendPersonalEmail(email, 'Verificar correo electrónico', body)
    }

    static async sendOTP({ email, otp }) { // --> Enviar código de verificación por email
        const year = new Date()

        const body = `
        <!DOCTYPE html>
        <html lang="es">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Código de verificación</title>
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

                .email-body h3 {
                    font-size: 20px;
                    margin-top: 0;
                }

                .email-footer {
                    text-align: center;
                    padding: 10px;
                    background-color: #f4f4f4;
                    font-size: 14px;
                    color: #888888;
                }

                .otp {
                    text-align: center;
                    padding: 20px 10px;
                    letter-spacing: 10px;
                    font-size: 32px;
                    font-weight: 400;
                }

                small {
                    display: block;
                    margin-bottom: 5px;
                }
            </style>
        </head>

        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>Choco Market</h1>
                </div>
                <div class="email-body">
                    <h3>Usa el siguiente código para actualizar tu contraseña</h3>
                    <h4>Valido solo por 5 minutos.</h4>
                    <small>Por seguridad, nunca compartas tus códigos con nadie.</small>

                    <p class="otp">${otp}</p>

                    <small>Si no envió la solicitud, omita este correo electrónico.</small>
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
        await sendPersonalEmail(email, 'Cambia tu contraseña con tu código de verificación', body)
    }

    static async deleteAccount({ id }) { // --> Eliminar usuario de la base de datos por ID
        const [user] = await connection.query('DELETE from users WHERE user_id = ?', [id])
        return user
    }

    static async saveOTP({ email, otp, expires_at }) {
        const [user] = await connection.query(
            'INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)',
            [email, otp, expires_at]
        )
        return user
    }

    static async getOTP({ email, otp }) {
        const [user] = await connection.query(
            'SELECT * FROM otps WHERE email = ? AND otp = ?',
            [email, otp]
        )
        if (user.length === 0) return null
        return user[0]
    }

    static async deleteOTP({ email, otp }) {
        const [user] = await connection.query(
            'DELETE FROM otps WHERE email = ? AND otp = ?',
            [email, otp]
        )
        return user
    }

    static async verifyEmailById({ id }) { // --> Actualizar el estado de verificación de email
        const verified = 1
        const [user] = await connection.query(
            'UPDATE users SET verified = ? WHERE user_id = ?',
            [verified, id]
        )
        return user
    }

    static async getVerifiedById({ id }) {
        const [user] = await connection.query(
            'SELECT email, verified FROM users WHERE user_id = ?',
            [id]
        )

        return user[0]
    }
}