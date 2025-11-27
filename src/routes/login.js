const express = require('express');
const router = express.Router();

const loginController = require('../controllers/LoginController');

router.post('/login-by-gmail', loginController.handleLoginByGmail);
router.post('/login-by-google', loginController.handleLoginByGoogle);
router.post('/check-email-exists', loginController.handleCheckEmailExists);
router.post('/create-new-user-by-gmail', loginController.handleCreateUserByEmail);
router.post('/create-new-user-by-google', loginController.handleCreateUserByGoogle);
router.post('/send-code', loginController.handleSendCodeVerification);
router.post('/verify-code', loginController.handleVerifyCode);

module.exports = router;
