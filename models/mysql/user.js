import mysql from 'mysql2/promise'

const DEFAULT_CONFIG = {
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: '1111',
    database: 'db-choco'
}

const connectionString = process.env.DATABASE_URL ?? DEFAULT_CONFIG

const connection = await mysql.createConnection(connectionString)

export class UserModel {
    static async getById({ id }) {  // --> Obtener usuario por ID a la BD
        const [user] = await connection.query(
            'SELECT * FROM users WHERE user_id = ? ',
            [id]
        )

        if (user.length === 0) return null

        return user[0]
    }

    static async updatePasswordById({ id, password }) {
        const [user] = await connection.query(
            'UPDATE users SET password = ? WHERE user_id = ?',
            [password, id]
        )

        console.log(user);
    }
}