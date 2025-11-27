const express = require('express');
const router = express.Router();

const userController = require('../controllers/UserController');

router.post('/create', userController.create);
router.get('/editUser/id/:Id', userController.edit);
router.put('/editUser/:Id', userController.update);

router.get('/deleteUser/id/:Id', userController.deleteConfirm);
router.delete('/deleteUser/:Id', userController.destroy);

module.exports = router;
