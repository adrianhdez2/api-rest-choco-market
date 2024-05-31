import { AuthController } from '../controllers/auth.js'
import { Router } from 'express'

export const authRouter = Router()

authRouter.post('/login', AuthController.getLoginToken)
authRouter.post('/logout', AuthController.logOut)
authRouter.post('/forgot-password', AuthController.sendEmail)