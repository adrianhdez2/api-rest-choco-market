import { UserModel } from "../models/mysql/user.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import cloudinary from '../configs/cloudinary.js'
import { deleteCloudinaryResource } from "../utils/deleteResource.js"

export class UserController {

    static async getByToken(req, res) {  // --> Obtener los datos del usuario si el token existe
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

    static async verifyUserToken(req, res) { // --> Validar que el token de usuario exista
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

    static async updatePassword(req, res) {  // --> Actualizar contraseña de usuario
        const { token } = req.params
        const { password, passwordConfirm } = req.body
        if (password !== passwordConfirm) return res.status(401).json({ error: "Las contraseñas no coinciden" })

        try {
            const decoded = jwt.verify(token, process.env.KEY)
            const id = decoded.id
            const hashedPassword = await bcrypt.hash(password, 10)
            const user = UserModel.updatePasswordById({ id, hashedPassword })

            if (!user) return res.status(401).json({ error: "Error al reestableceer la contraseña" })

            return res.json({ status: true, message: "Se actualizó la contraseña" })

        } catch (error) {
            res.status(401).json({ error: "El token de usuario ha expirado" })
        }
    }

    static async uploadProfilePhoto(req, res) { // --> Subir imagen de usuario
        const token = req.cookies.token

        if (!token) return res.status(501).json({ error: "No hay usuario" })

        if (req.files === undefined || req.files === null) return res.status(400).json({ error: "No hay fotos seleccionadas" })

        const options = {
            folder: 'users',
            resource_type: 'image',
            format: 'webp'
        }

        const file = req.files.img_user

        cloudinary.uploader.upload(file.tempFilePath, options, async (err, result) => {
            if (err) return res.status(500).json({ error: "Ocurrió un error al guardar el archivo" })

            const decoded = jwt.verify(token, process.env.KEY)
            const id = decoded.id

            const url = result.secure_url
            const id_public = result.public_id

            const userInf = await UserModel.getById({ id })

            const public_id_picture = userInf.public_id_picture

            if (public_id_picture !== 'default') {
                await deleteCloudinaryResource(public_id_picture)
            }

            const user = await UserModel.updatePhotoUser({ url, id_public, id })

            if (!user) return res.status(400).json({ error: "Error al actualizar la imagen" })


            return res.json({ status: true, message: "Se actualizó la imagen" })
        })
    }
}