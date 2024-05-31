import { AuthModel } from "../models/mysql/auth.js"
import { UserModel } from "../models/mysql/user.js"
import jwt from 'jsonwebtoken'

export class UserController {
    static async getById(req, res) {  // --> Obtener el usuario por el ID
        const { id } = req.params
        const user = await UserModel.getById({ id })

        if (user) return res.json(user)

        res.status(404).json({ error: 'User not found' })
    }

    static async getByToken(req, res) {
        const token = req.cookies.token
        const { status } = req.body

        if (!token || !status) return res.status(401).json({ error: "Token no disponible" });

        try {
            const decoded = jwt.verify(token, process.env.KEY)
            const id = decoded.id

            const user = await UserModel.getById({ id })

            if (!user) return res.status(401).json({ error: "Usuario no disponible" });

            res.status(200).json(user)

        } catch (error) {
            res.status(401).json({ error: "El token de usuario no existe" });
        }
    }

    static async verifyUserToken(req, res) {
        try {
            const token = req.cookies.token
            if (!token) {
                return res.json({ status: false, message: 'No hay sesión iniciada' })
            }

            return res.json({ status: true, message: "Authorized" });
        } catch (error) {
            return res.json(error)
        }
    }

    static async updatePassword(req, res) {
        const { token } = req.params
        const { password, passwordConfirm } = req.body
        if (password !== passwordConfirm) return res.status(401).json({ error: "Las contraseñas no coinciden" })

        try {
            const decoded = jwt.verify(token, process.env.KEY)
            const id = decoded.id
            const hashedPassword = await bcrypt.hash(password, 10)
            const user = UserModel.updatePasswordById({ id, hashedPassword })
        } catch (error) {
            res.status(401).json({ error: "El token de usuario ha expirado" })
        }
    }
}