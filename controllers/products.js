import { ProductsModel } from "../models/mysql/products.js";


export class ProductsController {
    static async getAll(req, res) {
        const products = await ProductsModel.getAll()

        if (!products) return res.status(200).json([])

        return res.json(products)
    }
}