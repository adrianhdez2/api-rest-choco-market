import connection from "../../configs/dbConnection.js"

export class UserModel {
    static async getById({ id }) {  // --> Obtener usuario por ID a la BD
        const [user] = await connection.query(
            'SELECT * FROM users WHERE user_id = ? ',
            [id]
        )

        if (user.length === 0) return null

        return user[0]
    }

    static async updatePasswordById({ id, hashedPassword }) {  // --> Actualizar contraseña por ID a la BD
        const [user] = await connection.query(
            'UPDATE users SET password = ? WHERE user_id = ?',
            [hashedPassword, id]
        )
        return user
    }

    static async updatePhotoUser({ url, id_public, id }) {
        const [user] = await connection.query(
            'UPDATE users SET picture = ?, public_id_picture = ? WHERE user_id = ?',
            [url, id_public, id]
        );

        return user
    }
}