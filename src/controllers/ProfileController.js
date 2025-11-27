const { getInforUser, updateInforUser, deleteUserAccount } = require('../services/userService');
const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = process.env.SECRET_KEY;

class ProfileController {
    getUser = async (req, res) => {
        const userId = req.user?.id; // Use token's user ID
        // console.log('userId', userId);
        // console.log('Decoded user from token:', req.user);

        if (!userId) {
            return res.status(400).json({
                errorCode: -1,
                errorMessage: 'Id not found!',
            });
        }

        try {
            const result = await getInforUser(userId);

            return res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                errorCode: -1,
                errorMessage: 'Error from server!',
            });
        }
    };

    updateUser = async (req, res) => {
        const userId = req.user?.id; // Use token's user ID

        if (!userId) {
            return res.status(400).json({
                errorCode: -1,
                errorMessage: 'Id not found!',
            });
        }

        try {
            const result = await updateInforUser(userId, req.body);

            return res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                errorCode: -1,
                errorMessage: 'Error from server!',
            });
        }
    };

    deleteUser = async (req, res) => {
        const userId = req.user?.id; // Use token's user ID

        if (!userId) {
            return res.status(400).json({
                errorCode: -1,
                errorMessage: 'Id not found!',
            });
        }

        try {
            await deleteUserAccount(userId);

            return res.status(200).json({
                errorCode: 0,
                errorMessage: 'User deleted successfully!',
            });
        } catch (error) {
            res.status(500).json({
                errorCode: -1,
                errorMessage: 'Error from server!',
            });
        }
    };

    logoutUser = async (req, res) => {
        try {
            res.clearCookie('token', {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
            });

            return res.status(200).json({
                code: 0,
                message: 'Logged out successfully!',
            });
        } catch (error) {
            res.status(500).json({
                errorCode: -1,
                errorMessage: 'Error from server!',
            });
        }
    };
}

module.exports = new ProfileController();
