const { connection } = require('../config/connectDB');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const getAllUsers = async () => {
    try {
        const [results, fields] = await connection.execute('SELECT * FROM users');
        return results;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error; // Re-throw the error so it can be handled upstream
    }
};

const createNewUser = async (data) => {
    //  You don’t need to include Id in the INSERT because it's now AUTO_INCREMENT.
    try {
        const { firstName, lastName, email, roleId, password } = data;

        const hashPassWordFromBcrypt = await hashUserPassWord(password);

        const [results, fields] = await connection.query(
            `INSERT INTO users (firstName, lastName, email, password, roleId) VALUE (?, ?, ?, ?, ?)`,
            [firstName, lastName, email, hashPassWordFromBcrypt, roleId],
        );
        return;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

const hashUserPassWord = async (password) => {
    try {
        const hashPassword = bcrypt.hashSync(password, salt);
        return hashPassword;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

const getUserById = async (Id) => {
    try {
        const [results, fields] = await connection.query(`SELECT * FROM users WHERE Id = ?`, [Id]);
        return results.length > 0 ? results[0] : {};
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

const updateUser = async (Id, firstName, lastName, email, password) => {
    try {
        const hashPassWordFromBcrypt = await hashUserPassWord(password);

        const [results, fields] = await connection.query(
            `UPDATE users SET firstName = ?, lastName = ?, email = ?, password = ? WHERE Id = ?`,
            [firstName, lastName, email, hashPassWordFromBcrypt, Id],
        );
        return;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

const deleteUser = async (Id) => {
    try {
        const [results, fields] = await connection.query(`DELETE FROM users WHERE Id = ?`, [Id]);
        return;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

module.exports = { getAllUsers, createNewUser, getUserById, updateUser, deleteUser };
