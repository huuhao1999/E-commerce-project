const restrict = require('../middlewares/auth.mdw');

const isAdmin = require("../middlewares/admin.mdw");
const isbuyer = require("../middlewares/buyer.mdw");
module.exports = function (app) {
  app.use('/', require('../routes/home.route'));
  app.use('/account', require('../routes/account.route'));
  app.use("/admin", restrict, isAdmin, require("../routes/admin/home.route"));
  app.use("/buy", restrict, isbuyer, require("../routes/buyer.route"));
  app.use("/products", require("../routes/product.route"));
  app.use("/cat", require("../routes/category.route"));
  app.use('/',restrict, require('../routes/cart.route'));
  app.use('/',restrict, require('../routes/payment.route'));
};

