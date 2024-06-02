import express, { json } from 'express'
import { usersRuter } from './routes/users.js'
import { corsMiddleware } from './middlewares/cors.js'
import { authRouter } from './routes/auth.js'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'

const app = express()

app.use(json())
app.use(cookieParser())
app.disable('x-powered-by')
app.use(corsMiddleware())
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/temp/'
}))
app.use('/users', usersRuter)
app.use('/auth', authRouter)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
})