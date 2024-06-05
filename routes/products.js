import { Router } from 'express'
import { ProductsController } from '../controllers/products.js'

export const productsRouter = Router()

productsRouter.get('/', ProductsController.getAll) // --> Obtener todos los productos