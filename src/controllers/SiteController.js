const { getAllUsers } = require('../services/CRUDservices');

class SiteController {
    // [GET] /home
    home = async (req, res) => {
        let results = await getAllUsers();
        return res.render('home', { results });
    };

    // [GET] /search
    search(req, res) {
        res.render('search');
    }
}

module.exports = new SiteController();
