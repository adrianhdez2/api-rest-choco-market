import { Router } from 'express'
import { UserController } from '../controllers/user.js'

export const usersRuter = Router()

usersRuter.post('/user', UserController.getByToken) // --> Obtener los datos del usuario
usersRuter.get('/verify', UserController.verifyUserToken) // --> Validar el token del usuario
usersRuter.post('/user/:token', UserController.updatePassword) // --> Restablecer contraseña por medio de token
usersRuter.post('/upload', UserController.uploadProfilePhoto) // --> Actualizar imagen de usuario