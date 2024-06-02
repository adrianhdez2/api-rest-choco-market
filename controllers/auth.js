import { AuthModel } from "../models/mysql/auth.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import cloudinary from "../configs/clodinary.js"

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

    static async logOut(req, res) {  // --> Cerrar sesión de usuario
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

    static async sendEmail(req, res) {  // --> Enviar correo electrónico de reestablecimiento de contraseña
        try {
            const { email } = req.body
            const user = await AuthModel.getUserByEmail({ email })

            if (!user) return res.status(401).json({ error: 'Email not found' })

            const token = jwt.sign({ id: user.user_id }, process.env.KEY, { expiresIn: '5m' })

            await AuthModel.sendEmail({ email, token })

            res.json({ status: true, message: "Se envió correctamente" });
        } catch (error) {
            return res.status(401).json({ error: "Ocurrió un error al enviar el correo" })
        }

    }

    static async createNewUser(req, res) { // --> Crear un nuevo usuario
        const { names, lastnameP, lastnameM, email, password, passwordConfirm } = req.body
        if (password !== passwordConfirm) return res.status(401).json({ error: "Las contraseñas no coinciden" })

        const user = await AuthModel.getUserByEmail({ email })

        if (user) return res.status(401).json({ error: "Este correo ya existe" })

        const hashedPassword = await bcrypt.hash(password, 10)
        const currentDate = new Date()
        const registerDate = currentDate.toISOString()
        const user_id = crypto.randomUUID()
        const picture = 'http://localhost:5173/users/default.png'
        const public_id_picture = 'default'

        const query = await AuthModel.createUser({ user_id, names, lastnameP, lastnameM, email, hashedPassword, picture, public_id_picture, registerDate })

        if (!query) return res.status(401).json({ error: "Error al guardar los datos" })

        return res.status(200).json({ status: true, message: "Se creo el usuario correctamente" })
    }

    static async deleteUser(req, res) { // --> Eliminar la cuenta de usuario
        const token = req.cookies.token

        if (!token) return res.status(401).json({ error: "Usuario no valido" })

        const decoded = jwt.verify(token, process.env.KEY)
        const id = decoded.id

        const userInf = await AuthModel.getById({ id })

        if (!userInf) return res.status(401).json({error: "No hay usuario"})

        const public_id_picture = userInf.public_id_picture

        if (public_id_picture !== 'default') {
            cloudinary.api.delete_resources(public_id_picture, { type: 'upload', resource_type: 'image' }, (error, results) => {
                if (error) {
                    console.log(error)
                } else {
                    console.log(results);
                }
            })
        }

        const user = AuthModel.deleteAccount({ id })

        if (!user) return res.status(401).json({ error: "El usuario no existe" })

        res.clearCookie("token");

        return res.json({ status: true, message: "Se eliminó correctamente" })
    }
}
