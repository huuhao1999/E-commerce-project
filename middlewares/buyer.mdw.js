const permission = require("../config/default.json").permission;

module.exports = (req, res, next) => {
    if (req.session.authUser.f_Permission != permission.buyer)
    // return res.redirect(`/account/login?retUrl=${req.originalUrl}`);
        return res.render(`vwError/404`, { layout: false });

    next();
};