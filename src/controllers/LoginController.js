const {
    handleUserLoginByGmail,
    handleUserLoginByGoogle,
    handleCheckEmailExisted,
    handleCreateNewUserByEmail,
    handleCreateNewUserByGoogle,
    handleSendCode,
    verifyCode,
} = require('../services/LoginService');

class LoginController {
    handleLoginByGmail = async (req, res) => {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({
                code: -1,
                message: 'Missing inputs parameter!',
            });
        }

        let userData = await handleUserLoginByGmail(email, password);

        // Set token in HttpOnly cookie
        if (userData.token) {
            res.cookie('token', userData.token, {
                httpOnly: true, // can't be accessed from JavaScript
                secure: false, // set to true in production (HTTPS)
                sameSite: 'lax', // prevents CSRF in most cases,  or 'none' if cross-site and using HTTPS
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            });
        }

        res.status(200).json({
            code: userData.errorCode,
            message: userData.errorMessage,
            user: userData.user ? userData.user : {},
        });
    };

    handleLoginByGoogle = async (req, res) => {
        const { googleId, email } = req.body;

        if (!googleId || !email) {
            return res.status(400).json({
                code: -1,
                message: 'Missing Google account information!',
            });
        }

        let userData = await handleUserLoginByGoogle(googleId, email);

        if (userData.token) {
            // Set token in HttpOnly cookie
            res.cookie('token', userData.token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
            });
        }

        res.status(200).json({
            code: userData.errorCode,
            message: userData.errorMessage,
            user: userData.user ? userData.user : {},
            token: userData.token ? userData.token : null,
        });
    };

    handleCheckEmailExists = async (req, res) => {
        const email = req.body?.email;

        if (!email) {
            return res.status(400).json({
                errorCode: -1,
                errorMessage: 'Missing input parameter!',
            });
        }

        let isChecked = await handleCheckEmailExisted(email);

        return res.status(200).json(isChecked);
    };

    handleSendCodeVerification = async (req, res) => {
        const { email } = req.body;
        try {
            const codeVerification = Math.floor(100000 + Math.random() * 900000); // 6 digit-code
            const expirationTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

            const data = await handleSendCode(email, codeVerification, expirationTime);
            return res.status(200).json(data);
        } catch (error) {
            return res.status(200).json({
                errorCode: -1,
                errorMessage: 'Error from server!',
            });
        }
    };

    handleVerifyCode = async (req, res) => {
        const { email, code } = req.body;

        try {
            const verification = await verifyCode(email, code);
            return res.status(200).json(verification);
        } catch (error) {
            return res.status(200).json({
                errorCode: -1,
                errorMessage: 'Error from server!',
            });
        }
    };

    handleCreateUserByEmail = async (req, res) => {
        const data = req.body;
        try {
            const result = await handleCreateNewUserByEmail(data);

            if (result.errorCode === 0 && result?.token) {
                // Set token in HttpOnly cookie
                res.cookie('token', result?.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000,
                });
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(200).json({
                errorCode: -1,
                errorMessage: 'Error from server!',
            });
        }
    };

    handleCreateUserByGoogle = async (req, res) => {
        const data = req.body;
        try {
            const result = await handleCreateNewUserByGoogle(data);

            if (result.errorCode === 0 && result?.token) {
                // Set token in HttpOnly cookie
                res.cookie('token', result?.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000,
                });
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(200).json({
                errorCode: -1,
                errorMessage: 'Error from server!',
            });
        }
    };
}

module.exports = new LoginController();
