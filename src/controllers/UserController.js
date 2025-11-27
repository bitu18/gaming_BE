const { createNewUser, getUserById, updateUser, deleteUser } = require('../services/CRUDservices');

class UserController {
    // [POST] /createUser
    create = async (req, res) => {
        const data = req.body;
        const createUser = await createNewUser(data);

        res.redirect('/');
    };

    // [GET] /editUser/id/:Id
    edit = async (req, res) => {
        const Id = req.params.Id;
        const getUser = await getUserById(Id);

        res.render('edit', { getUser });
    };

    // [PUT] /editUser/:Id
    update = async (req, res) => {
        const { Id, firstName, lastName, email, password } = req.body;
        const updateUserById = await updateUser(Id, firstName, lastName, email, password);

        res.redirect('/');
    };

    // [GET] /deleteUser/id/:Id
    deleteConfirm = async (req, res) => {
        const Id = req.params.Id;
        const showConfirm = await getUserById(Id);

        res.render('delete', { showConfirm });
    };

    // [DELETE] /deleteUser/:id
    destroy = async (req, res) => {
        const Id = req.params.Id;
        await deleteUser(Id);
        res.redirect('/');
    };
}

module.exports = new UserController();
