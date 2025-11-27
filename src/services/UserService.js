const { connection } = require('../config/connectDB');
const bcrypt = require('bcryptjs');

const getInforUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const [results] = await connection.execute(
                `SELECT Id, roleId, email, firstName, lastName, userName, dateOfBirthYearMonth, create_date FROM users WHERE Id = ?`,
                [parseInt(userId)],
            );
            if (results.length === 0) {
                return resolve({
                    errorCode: -1,
                    errorMessage: 'User not found!',
                });
            }
            return resolve({
                errorCode: 0,
                errorMessage: 'Successfully',
                data: results[0],
            });
        } catch (error) {
            reject(error);
        }
    });
};

const updateInforUser = (userId, userData) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Get user existing data
            const [existingUser] = await connection.execute(
                `SELECT email, password, firstName, roleId, lastName, userName, dateOfBirthYearMonth FROM users WHERE Id =?`,
                [parseInt(userId)],
            );
            if (existingUser.length === 0) {
                return resolve({
                    errorCode: 1,
                    errorMessage: 'User not found!',
                });
            }

            // Merge existing data with new data
            const updateUser = {
                ...existingUser[0],
                ...userData,
            };
            // Only hash password if it exists in the update
            let hashedPassword = updateUser.password;
            if (userData.password) {
                const saltRounds = 10;
                hashedPassword = await bcrypt.hash(updateUser.password, saltRounds);
            }

            const [results] = await connection.execute(
                `UPDATE users SET email = ?, password = ?, firstName = ?, roleId = ?, lastName = ?, userName = ?, dateOfBirthYearMonth = ? WHERE Id = ?`,
                [
                    updateUser.email,
                    hashedPassword,
                    updateUser.firstName,
                    updateUser.roleId,
                    updateUser.lastName,
                    updateUser.userName,
                    updateUser.dateOfBirthYearMonth,
                    parseInt(userId),
                ],
            );

            if (results.affectedRows === 0) {
                return resolve({
                    errorCode: -1,
                    errorMessage: 'Update failed!',
                });
            }

            return resolve({
                errorCode: 0,
                errorMessage: 'Update successfully!',
                data: updateUser,
            });
        } catch (error) {
            reject(error);
        }
    });
};

const deleteUserAccount = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const [results] = await connection.execute(`DELETE FROM users WHERE Id = ?`, [parseInt(userId)]);

            if (results.affectedRows === 0) {
                return resolve({
                    errorCode: -1,
                    errorMessage: 'Delete failed!',
                });
            }

            return resolve({
                errorCode: 0,
                errorMessage: 'Delete successfully!',
            });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { getInforUser, updateInforUser, deleteUserAccount };
