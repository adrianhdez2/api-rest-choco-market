import { Router } from 'express'
import { UserController } from '../controllers/users.js'

export const usersRuter = Router()

// usersRuter.get('/:id', UserController.getById)
usersRuter.post('/user', UserController.getByToken)
usersRuter.get('/verify', UserController.verifyUserToken)
usersRuter.patch('/user/:token', UserController.updatePassword)