const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/category");
var passport = require("passport");
const userModel = require("../models/account.M");
const db = require("../database/mysql");
var mysql = require("mysql");
const config = require("../config/default.json");
const category = require("../models/category");
const cart = require("../models/cart");
const categoryModel = require("../models/category.model");
var connection = mysql.createConnection(config.mysql);
const mailchimp = require("../config/keyMailChimp");
var request = require("superagent");


connection.connect();

router.get("/search", function(req, res) {

    connection.query(
        `select* from products p, categories c where c.CatID=p.CatID and p.ProName like N'%` +
        req.query.key +
        `%'`,
        function(err, rows, fields) {
            if (err) throw err;
            var data = [];
            for (i = 0; i < rows.length; i++) {
                data.push(rows[i].CatName);
                data.push(rows[i].ProName);
            }
            console.log(data);
            res.end(JSON.stringify(data));
        }
    );
});
router.post("/", async function(req, res) {
  
    var carts=req.session.cart;
    setTimeout(carts.item.forEach(cart => {
        console.log(cart);
        
    }),3000);





    var Proname = console.log(req.body.typeahead);
    console.log(req.body.typeahead);
    var sql =
        `select* from products p, categories c where c.CatID=p.CatID and p.ProName like N'%` +
        req.body.typeahead +
        `%'`;
    if(req.body.typeahead=='Khóa Học Tiếng Anh')
    {
        sql=`select* from products p where p.CatID=1`;
    }
    if(req.body.typeahead=='Khóa Học Lập Trình')
    {
        sql=`select* from products p where p.CatID=2`;
    }
    if(req.body.typeahead=='Khóa Học Giao Tiếp')
    {
        sql=`select* from products p where p.CatID=3`;
    }
    if(req.body.typeahead=='Khóa học Bán Hàng')
    {
        sql=`select* from products p where p.CatID=4`;
    }
    if(req.body.typeahead=='Khóa Học Thiết Kế')
    {
        sql=`select* from products p where p.CatID=5`;
    }
    if(req.body.typeahead=='Phong Cách Sống')
    {
        sql=`select* from products p where p.CatID=6`;
    }
    if(req.body.typeahead=='Khác')
    {
        sql=`select* from products p where p.CatID=7`;
    }
    const products = await db.load(sql);
    console.log(products);

    res.render("vwSearch/search", {
        title: req.body.typeahead,
        products: products
    });
    
});
//Router to home


router.get("/", CategoryController.getTop);
// router.get("/",async function(req, res) {// Sua cho nay
//     var getpros = await categoryModel.Get5Prod(); //Sua cho nay
//     res.render("../views/VwHome/index",{ListProd: getpros});// Sua cho nay
// });// Sua cho nay

router.get("/error", (req, res) => {
    res.render("vwAccount/OTP");
});
router.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", {
        failureRedirect: "/login"
    }),
    async function(req, res) {
       
        req.session.FB = req.user;
        const user = await userModel.singleByUsername(req.session.FB.id);
        if (user != null) {
            console.log("Đãng dùng FB này đăng kí rồi");
            req.session.isAuthenticated = true;
            req.session.authUser = user;
            const url = req.query.retUrl || "/";
            res.redirect(url);
        } else {
            res.redirect("/account/login/infoFB");
        }
    }
);
router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login"
    }),
    async function(req, res) {
        req.session.GG = req.user;
        const user = await userModel.singleByUsername(req.session.GG.id);
        if (user != null) {
            console.log("Đãng dùng GG này đăng kí rồi");
            req.session.isAuthenticated = true;
            req.session.authUser = user;
            const url = req.query.retUrl || "/";
            res.redirect(url);
        } else {
            res.redirect("/account/login/infoGG");
        }
    }
);


// ROUTING FOR SUB
router.post('/sub', function (req, res) {
    // save user details to your database.
    console.log(req.body);
    request
          .post('https://' + mailchimp.mailchimpInstance + '.api.mailchimp.com/3.0/lists/' + mailchimp.listUniqueId + '/members/')
          .set('Content-Type', 'application/json;charset=utf-8')
          .set('Authorization', 'Basic ' + new Buffer('anystring:' + mailchimp.mailchimpApiKey ).toString('base64'))
          .send({
            'email_address': req.body.email,
            'status': 'subscribed',
            'merge_fields': {
              'FNAME': req.body.firstName,
              'LNAME': req.body.lastName
            }
          })
              .end(function(err, response) {
                if (response.body.status == "subscribed" || (response.status === 400  || response.status == 200 )) {
                    //console.log(response.status);
                    //console.log(response.body.status);
                    console.log("subscribed");
                    req.flash('OK','Signed up');
                    return res.redirect('/');
                } else {
                    //console.log(response.status);
                    console.log('Failed');
                    req.flash('error','Signed up Failed');
                    return res.redirect('/');
                }
            });
  });


module.exports = router;