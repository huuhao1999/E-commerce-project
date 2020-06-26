const express = require("express");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const userModel = require("../models/account.M");
const restrict = require("../middlewares/auth.mdw");
const VerifiEmail = require("../models/EmailVerification");
//const cUser = require("../controllers/user.C");
const router = express.Router();
const passport = require("passport");
router.get("/register", async(req, res) => {
    res.render("vwAccount/register");
});
router.get("/register1", async(req, res) => {
    res.render("vwCart/demo");
});
router.get("/login", (req, res) => {
    if (req.session.isAuthenticated == true) {
        res.redirect("/account/profile");
    } else {
        res.render("vwAccount/login");
    }
});
router.get("/login/forgotPassword", (req, res) => {
    res.render("vwAccount/forgotPassword");
});
router.get("/profile", restrict, (req, res) => {
    res.render("vwAccount/profile");
});

router.get("/update", restrict, (req, res) => {
    res.render("vwAccount/update");
});
router.get("/changePassword", restrict, (req, res) => {
    res.render("vwAccount/changePassword");
});
router.get("/register/OTP", (req, res) => {
    res.render("vwAccount/OTP");
});
router.get("/login/forgotPassword/OTP", (req, res) => {
    res.render("vwAccount/OTP");
});
router.get("/login/infoFB", (req, res) => {
    res.render("vwAccount/infoFB");
});
router.get("/login/infoGG", (req, res) => {
    res.render("vwAccount/infoGG");
});
//Quên mật khẩu
router.post("/login/forgotPassword", async(req, res) => {
    const user = await userModel.singleByUsername(req.body.f_Username);
    if (user == null) {
        console.log("Tài khoản không tồn tại.");
        return res.redirect("/account/login");
    }
    //Tạo OTP
    var OTP = Math.floor(Math.random() * 10000) + 1;
    req.session.OTP = OTP;
    req.session.f_Username = req.body.f_Username;
    req.session.f_Password = req.body.f_Password;
    //GỬi OTP
    const send_Email = await VerifiEmail.EmailVerification(user.f_Email, OTP);
    if (send_Email) {
        console.log("Can't send OTP to Email(forgot password)");
        return res.redirect("/account/login/forgotPassword");
    } else {
        console.log("Sent OTP(forgot password)");
        return res.redirect("/account/login/forgotPassword/OTP");
    }
});
//OTP xác nhận email quên MK
router.post("/login/forgotPassword/OTP", async(req, res) => {
    if (req.body.f_OTP == req.session.OTP) {
        const entity = req.session;
        var N = 10;
        entity.f_Password = bcrypt.hashSync(entity.f_Password, N);

        const result = await userModel.changePassword(entity);
        if (result) {
            console.log("Lấy lại tài khoản  thành công");
            return res.redirect("/account/login");
        } else {
            console.log("lấy lại toàn khoản thất lại");
            return res.render("vwAccount/forgotPassword");
        }
    } else {
        console.log("OTP sai.!!!!");
        return res.redirect("/account/login/forgotPassword/OTP");
    }
});
// update thông tin user
router.post("/update", async(req, res) => {
    const dob = req.body.dob;
    // const dob = moment(req.body.dob, "DD/MM/YYYY").format("YYYY-MM-DD");
    const entity = req.body;
    entity.f_DOB = dob;
    delete entity.raw_password;
    if (
        req.body["g-recaptcha-response"] === undefined ||
        req.body["g-recaptcha-response"] === "" ||
        req.body["g-recaptcha-response"] === null
    ) {
        return res.redirect("/account/update");
    }
    if (
        entity.f_Name === "" ||
        entity.f_DOB === "" ||
        entity.f_phone === "" ||
        entity.f_address === ""
    ) {
        return res.redirect("/account/update");
    }
    entity.f_Username = req.session.authUser.f_Username;
    console.log(req.session.authUser.id);
    delete entity.dob;
    delete entity["g-recaptcha-response"];
    const result = await userModel.UpdateInformationUser(entity);
    if (result) {
        req.session.authUser.f_Name = entity.f_Name;
        req.session.authUser.f_DOB = entity.f_DOB;
        req.session.authUser.f_address = entity.f_address;
        req.session.authUser.f_phone = entity.f_phone;
        res.redirect("/account/profile");
    } else {
        res.render("vwAccount/update");
    }
});
//thay đổi mật khẩu
router.post("/changePassword", async(req, res) => {
    const user = await userModel.singleByUsername(
        req.session.authUser.f_Username
    );
    const rs = bcrypt.compareSync(req.body.Old_password, user.f_Password);
    if (rs === false)
        return res.render("vwAccount/changePassword", {
            err_message: "Change failed"
        });
    const N = 10;
    const New_hash = bcrypt.hashSync(req.body.raw_Password, N);
    const entity = req.body;
    entity.f_Password = New_hash;
    entity.f_Username = req.session.authUser.f_Username;
    delete entity.raw_password;

    if (
        req.body["g-recaptcha-response"] === undefined ||
        req.body["g-recaptcha-response"] === "" ||
        req.body["g-recaptcha-response"] === null
    ) {
        return res.redirect("/account/changePassword");
    }
    delete entity["g-recaptcha-response"];

    const result = await userModel.changePassword(entity);
    if (result) {
        res.redirect("/");
    } else {
        res.render("vwAccount/changePassword");
    }
});
//đăng kí tài khoản
router.post("/register", async(req, res) => {
    const N = 10;
    const hash = bcrypt.hashSync(req.body.raw_password, N);

    const dob = req.body.dob;
    // const dob = moment(req.body.dob, "DD/MM/YYYY").format("YYYY-MM-DD");
    const entity = req.body;

    entity.f_Password = hash;
    entity.f_Permission = 0;
    entity.f_DOB = dob;
    entity.f_Evaluate = 0;
    delete entity.raw_password;
    if (
        req.body["g-recaptcha-response"] === undefined ||
        req.body["g-recaptcha-response"] === "" ||
        req.body["g-recaptcha-response"] === null
    ) {
        return res.redirect("/account/register");
    }

    //check user name và email
    const user = await userModel.singleByUsername(req.body.f_Username);
    if (user != null) {
        console.log("Username Exists");
        return res.redirect("/account/register");
    }
    const email = await userModel.singleByEmail(req.body.f_Email);
    if (email != null) {
        console.log("Email Exists");
        return res.redirect("/account/register");
    }
    //console.log(`++++++++account route add entity`, entity['g-recaptcha-response']);
    delete entity.dob;
    delete entity["g-recaptcha-response"];
    console.log(entity);

    if (
        entity.f_Username === "" ||
        entity.f_Password === "" ||
        entity.f_Name === "" ||
        entity.f_Email === "" ||
        entity.f_DOB === "" ||
        entity.f_phone === "" ||
        entity.f_address === ""
    ) {
        return res.redirect("/account/register");
    }
    req.session.User_register = entity;
    var OTP = Math.floor(Math.random() * 10000) + 1;
    req.session.OTP = OTP;
    const send_Email = await VerifiEmail.EmailVerification(entity.f_Email, OTP);
    if (send_Email) {
        console.log("Can't send OTP to Email");
        return res.redirect("/account/register");
    } else {
        console.log("Sent OTP");
        return res.redirect("/account/register/OTP");
    }

    //----------------------
});
//OTP xác nhận email
router.post("/register/OTP", async(req, res) => {
    if (req.body.f_OTP == req.session.OTP) {
        console.log(req.session.User_register);
        const result = await userModel.add(req.session.User_register);
        if (result) {
            console.log("Đăng kí thành công");
            return res.redirect("/account/login");
        } else {
            console.log("Đăng kí thất bại do add data");
            return res.render("vwAccount/register");
        }
    } else {
        console.log("OTP sai.!!!!");
        return res.render("vwAccount/register");
    }
});
//Đăng nhập
router.post("/login", async(req, res) => {
    const user = await userModel.singleByUsername(req.body.f_Username);
    if (user === null) {
        console.log("Invalid username or password.");
        return res.redirect("/account/login");
    }
    if (
        req.body["g-recaptcha-response"] === undefined ||
        req.body["g-recaptcha-response"] === "" ||
        req.body["g-recaptcha-response"] === null
    ) {
        return res.redirect("/account/login");
    }
    const rs = bcrypt.compareSync(req.body.f_Password, user.f_Password);
    if (rs === false)
        return res.render("vwAccount/login", {
            
            err_message: "Login failed"
        });
    delete user.f_Password;
    req.session.isAuthenticated = true;
    req.session.authUser = user;

    const url = req.query.retUrl || "/";
    res.redirect(url);
});

router.post("/logout", (req, res) => {
    req.session.isAuthenticated = false;
    req.session.authUser = null;
    res.redirect(req.headers.referer);
});
//Đăng nhập FB

router.get(
    "/auth/facebook",
    passport.authenticate("facebook", { scope: "email" })
);
router.post("/login/infoFB", async(req, res) => {
    const entity = req.body;
    entity.f_Username = req.session.FB.id;
    var N = Math.floor(Math.random() * 1000) + 1;
    entity.f_Password = bcrypt.hashSync("10" + N, 10);
    entity.f_Evaluate = 0;
    entity.f_Permission = 0;
    // req.session.authUser = entity;
    const result = await userModel.add(entity);
    if (result) {
        // req.session.isAuthenticated = true;
        console.log("Đăng kí thành công");
        return res.redirect("/account/login");
    } else {
        console.log("Đăng kí thất bại do add data");
        return res.render("vwAccount/register");
    }
    res.redirect("/");
});


//ĐĂNG NHẬP GOOGLE
router.get("/auth/google", passport.authenticate("google", { scope: "email" }));
router.post("/login/infoGG", async(req, res) => {
    const entity = req.body;
    entity.f_Username = req.session.GG.id;
    var N = Math.floor(Math.random() * 1000) + 1;
    entity.f_Email = req.session.GG.emails[0].value;
    entity.f_Password = bcrypt.hashSync("10" + N, 10);
    entity.f_Evaluate = 0;
    entity.f_Permission = 0;
    // req.session.authUser = entity;
    console.log(entity);
    const result = await userModel.add(entity);
    if (result) {
        // req.session.isAuthenticated = true;

        console.log("Đăng kí thành công");
        return res.redirect("/account/login");
    } else {
        console.log("Đăng kí thất bại do add data");
        return res.render("vwAccount/register");
    }
    res.redirect("/");
});
module.exports = router;