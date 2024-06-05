import connection from "../../configs/dbConnection.js"

export class ProductsModel {
    static async getAll() {
        const [products] = await connection.query('SELECT * FROM products')
        
        if (products.length === 0) return null

        return products
    }
}