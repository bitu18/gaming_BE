const express = require('express');
const router = express.Router();

const profileController = require('../controllers/ProfileController');
const verifyToken = require('../middlewares/verifyToken');

router.get('/get-user', verifyToken, profileController.getUser);
router.put('/update-user', verifyToken, profileController.updateUser);
router.delete('/delete-user', verifyToken, profileController.deleteUser);
router.post('/logout', profileController.logoutUser);

module.exports = router;
