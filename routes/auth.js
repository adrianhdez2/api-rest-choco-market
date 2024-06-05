import { AuthController } from '../controllers/auth.js'
import { Router } from 'express'

export const authRouter = Router()

authRouter.post('/login', AuthController.getLoginToken)  // --> Login de usuario
authRouter.post('/logout', AuthController.logOut)  // --> Cerrar sesión de usuario
authRouter.post('/forgot-password', AuthController.sendEmail) // --> Enviar email para reestablecer contraseña
authRouter.post('/register', AuthController.createNewUser) // --> Crear nuevo usuario
authRouter.post('/delete', AuthController.deleteUser) // --> Eliminar cuenta de usuario
authRouter.get('/validate', AuthController.sendEmailOTP) // --> Enviar código de verificación OTP
authRouter.post('/verifyEmail', AuthController.sendEmailValidation) // --> Enviar correo para validación de email
authRouter.post('/email/verify/:token', AuthController.verifyEmailToken) // --> Verificar el correo eletrónico mediante token
authRouter.get('/verifiedEmail', AuthController.getVerified) // --> Obtener validación del email de usuario