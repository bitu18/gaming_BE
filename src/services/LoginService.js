const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connection } = require('../config/connectDB');
const sendCodeToEmail = require('../config/sendEmail');

const JWT_SECRET_KEY = process.env.SECRET_KEY;

let handleUserLoginByGmail = async (email, password) => {
    try {
        let userData = {};
        // Check valid email
        let isValidEmail = await checkUserEmail(email);

        if (isValidEmail) {
            let [rows] = await connection.query(`SELECT * FROM users WHERE email = ?`, [email]);
            // Check password
            if (rows.length > 0) {
                let user = rows[0];

                // If login by Google with no password
                if (!user.password) {
                    userData.errorCode = 4;
                    userData.errorMessage = 'Wrong Password!'; // This account login by Google before
                }

                let checkPassword = bcrypt.compareSync(password, user.password);
                if (checkPassword) {
                    // Create token
                    const token = jwt.sign({ id: user.Id, email: user.email, roleId: user.roleId }, JWT_SECRET_KEY, {
                        expiresIn: '1d',
                    });

                    userData.errorCode = 0;
                    userData.errorMessage = `Login Successfully`;
                    delete user.password; // delete password field when user login successfully
                    userData.user = user; // include safe user data
                    // userData.token = token;
                } else {
                    userData.errorCode = 2;
                    userData.errorMessage = `Wrong password`;
                }
            } else {
                userData.errorCode = 3;
                userData.errorMessage = `User not found!`;
            }

            // email user is not exist
        } else {
            userData.errorCode = 1;
            userData.errorMessage = 'Account not found under that email. Please use it to sign up.';
        }
        return userData;
    } catch (error) {
        throw error;
    }
};

let handleUserLoginByGoogle = async (googleId, email) => {
    try {
        let userData = {};

        // Check valid email
        let isValidEmail = await checkUserEmail(email);

        if (isValidEmail) {
            let [rows] = await connection.query(`SELECT * FROM users WHERE email = ?`, [email]);
            if (rows.length > 0) {
                let user = rows[0];

                if (!user.googleId) {
                    userData.errorCode = 4;
                    userData.errorMessage = `Not found GoogleId`;
                } else if (user.googleId !== googleId) {
                    userData.errorCode = 5;
                    userData.errorMessage = `Google ID does not match`;
                } else {
                    const token = jwt.sign({ id: user.Id, email: user.email, role: user.roleId }, JWT_SECRET_KEY, {
                        expiresIn: '1d',
                    });

                    userData.errorCode = 0;
                    userData.errorMessage = `Login successfully`;
                    delete user.password;
                    userData.user = user;
                    userData.token = token;
                }
            } else {
                userData.errorCode = 3;
                userData.errorMessage = `User not found!`;
            }
        } else {
            userData.errorCode = 4;
            userData.errorMessage = `Account not found under that email. Please use it to sign up`;
        }

        return userData;
    } catch (error) {
        throw error;
    }
};

// let checkUserEmail = async (email) => {
//     try {
//         const [results] = await connection.execute(`SELECT email FROM users WHERE email = ?`, [email]);

//         return results.length > 0;
//     } catch (error) {
//         throw error;
//     }
// };

const checkUserEmail = async (email) => {
    const [rows] = await connection.execute(`SELECT Id, roleId, email FROM users WHERE email = ? LIMIT 1`, [email]);
    return rows.length > 0 ? rows[0] : null;
};

let checkVerifyEmail = async (email) => {
    try {
        const [results] = await connection.query(
            `SELECT email FROM email_verification WHERE email = ? AND codeVerification IS NULL`,
            [email],
        );

        return results.length > 0;
    } catch (error) {
        throw error;
    }
};

let verifyCode = (email, code) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!code) {
                return resolve({ errorCode: -5, errorMessage: 'Missing code!' });
            }

            const [results] = await connection.query(
                `SELECT codeVerification, expiration_time FROM email_verification WHERE email = ?`,
                [email],
            );

            if (!results.length) {
                return resolve({ errorCode: -2, errorMessage: 'Email not found' });
            }
            const { codeVerification, expiration_time } = results[0]; // get code from DB

            if (Date.now() > new Date(expiration_time).getTime()) {
                await connection.query(
                    `UPDATE email_verification SET codeVerification = NULL, expiration_time = NULL WHERE email = ?`,
                    [email],
                );
                return resolve({ errorCode: -4, errorMessage: 'Code expired!' });
            }

            if (code !== codeVerification) {
                return resolve({
                    errorCode: -3,
                    errorMessage: 'Code is incorrect!',
                });
            }

            // Clear code after user finish verify correct
            await connection.query(
                `UPDATE email_verification SET codeVerification = NULL, expiration_time = NULL WHERE email = ?`,
                [email],
            );

            return resolve({
                errorCode: 0,
                errorMessage: 'Code verified successfully!',
            });
        } catch (error) {
            reject(error);
        }
    });
};

let handleCheckEmailExisted = async (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            let isExisted = await checkUserEmail(email);
            if (isExisted) {
                return resolve({
                    errorCode: -2,
                    errorMessage: 'Do you already have an account?',
                });
            }

            return resolve({
                errorCode: 0,
                errorMessage: 'Email is available',
            });
        } catch (error) {
            reject(error);
        }
    });
};

let handleSendCode = async (email, code, expirationTime) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!email) {
                return resolve({
                    errorCode: -2,
                    errorMessage: 'Missing email!',
                });
            }
            await connection.query(
                `
                INSERT INTO email_verification (email, codeVerification, expiration_time)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE codeVerification = VALUES(codeVerification), expiration_time = VALUES(expiration_time)
                `,
                [email, code, expirationTime],
            );

            await sendCodeToEmail(email, code);

            resolve({ errorCode: 0, errorMessage: 'Code sent successfully' });
        } catch (error) {
            reject(error);
        }
    });
};

let handleCreateNewUserByEmail = (data) => {
    const { roleId, email, password, firstName, lastName, userName, dateOfBirthYearMonth, signupMethod } = data;
    return new Promise(async (resolve, reject) => {
        try {
            if (!password) {
                return resolve({
                    errorCode: -1,
                    errorMessage: 'Missing password!',
                });
            }
            if (!signupMethod) {
                return resolve({
                    errorCode: -2,
                    errorMessage: 'Missing signup method!',
                });
            }

            // Check email is already existed or not
            let isUserExist = await checkUserEmail(email);
            if (isUserExist) {
                return resolve({ errorCode: -3, errorMessage: 'Email is already in existed' });
            }

            // Check email is verficated or not
            let isVerified = await checkVerifyEmail(email);
            if (!isVerified) {
                return resolve({ errorCode: -4, errorMessage: 'Email is not verified yet!' });
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const [result] = await connection.query(
                `INSERT INTO users (roleId, email, password, firstName, lastName, userName, dateOfBirthYearMonth, signupMethod)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [roleId, email, hashedPassword, firstName, lastName, userName, dateOfBirthYearMonth, signupMethod],
            );

            // Get the inserted user's ID
            const insertedUserId = result.insertId;

            // Create token
            const token = jwt.sign({ id: insertedUserId, email: email, roleId: roleId }, JWT_SECRET_KEY, {
                expiresIn: '24h',
            });

            resolve({ errorCode: 0, errorMessage: 'User create successfully', token });
        } catch (error) {
            reject(error);
        }
    });
};

let handleCreateNewUserByGoogle = async (data) => {
    const { roleId, email, googleId, firstName, lastName, userName, dateOfBirthYearMonth, signupMethod } = data;
    return new Promise(async (resolve, reject) => {
        try {
            if (!googleId) {
                return resolve({ errorCode: -1, errorMessage: 'GoogleId not found!' });
            }
            if (!signupMethod) {
                return resolve({
                    errorCode: -2,
                    errorMessage: 'Missing signup method!',
                });
            }

            let isUserExist = await checkUserEmail(email);
            if (isUserExist) {
                return resolve({ errorCode: -3, errorMessage: 'Email is already in existed' });
            }

            // Insert without password
            const [result] = await connection.query(
                `INSERT INTO users (roleId, email, googleId, firstName, lastName, userName, dateOfBirthYearMonth, signupMethod) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [roleId, email, googleId, firstName, lastName, userName, dateOfBirthYearMonth, signupMethod],
            );

            // Get the inserted user's ID
            const insertedUserId = result.insertId;

            // Create token
            const token = jwt.sign({ id: insertedUserId, email: email, roleId: roleId }, JWT_SECRET_KEY, {
                expiresIn: '24h',
            });

            resolve({
                errorCode: 0,
                errorMessage: 'User create successfully',
                token,
                // data: {
                //     id: insertedUserId,
                //     email,
                //     roleId,
                // },
            });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    handleUserLoginByGmail,
    handleUserLoginByGoogle,
    handleCheckEmailExisted,
    handleCreateNewUserByEmail,
    handleCreateNewUserByGoogle,
    handleSendCode,
    verifyCode,
};
