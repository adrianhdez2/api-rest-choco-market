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

export class AuthModel {
    static async getUserByEmail({ email }) {  // --> Obtener usuario por email

        const [user] = await connection.query(
            'SELECT user_id, email, password FROM users WHERE email = ? ',
            [email]
        )

        if (user.length === 0) return null

        return user[0]
    }
}