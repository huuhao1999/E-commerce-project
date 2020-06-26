const express = require("express");
const paypal = require('paypal-rest-sdk');
const config1 = require('./../config/keypaypal');
const config = require("./../config/default.json");
const { decodeBase64 } = require("bcryptjs");
const db = require("../utils/db");
const moment = require("moment");

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': config1.client_id,
    'client_secret': config1.client_secret
});
const router = express.Router();
router.post('/pay', (req, res) => {
     var x=Number(req.session.cart.totalPrice);
    const k = parseInt(x/23000, 10);
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Khóa học bạn đã mua",
                    "sku": "001",
                    "price":k,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": k
            },
            "description": "Hat for the best team ever"
        }]
    };

    paypal.payment.create(create_payment_json, function(error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });

});


router.get('/success' , (req ,res ) => {
    console.log(req.query); 

    var cart = req.session.cart;
    var user = req.session.authUser;
    console.log(user);
    var entity={};
    var date = new Date();
    entity.OrderDate=moment(date, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
    console.log("user.id = ", user.id);
    entity.UserID=user.id;
    console.log("UserID = ", entity.UserID);
    entity.Total=cart.totalPrice;
    db.add('orders',entity);
    req.session.cart=null;

    res.render('payment/success'); 
})


router.get('/payment' , (req ,res ) => {
    res.render('payment/home'); 
})

router.get('/cancel', (req, res) => { res.render('payment/cancel')});


//vnpay
// router.get('/create_payment_url', function (req, res, next) {
//     var dateFormat = require('dateformat');
//     var date = new Date();

//     var desc = 'Thanh toan don hang thoi gian: ' + dateFormat(date, 'yyyy-mm-dd HH:mm:ss');
//     res.render('order', {title: 'Tạo mới đơn hàng', amount: req.session.cart.totalPrice, description: desc})
// });
router.post('/create_payment_url', function (req, res, next) {
    config = require("../config/default.json");
    var ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var config = require('config');
    var dateFormat = require('dateformat');

    
    var tmnCode = config.get('vnp_TmnCode');
    var secretKey = config.get('vnp_HashSecret');
    var vnpUrl = config.get('vnp_Url');
    var returnUrl = config.get('vnp_ReturnUrl');

    var date = new Date();

    var createDate = dateFormat(date, 'yyyymmddHHmmss');
    var orderId = dateFormat(date, 'HHmmss');
    var amount = req.session.cart.totalPrice;
    var bankCode = req.body.bankCode;
    
    var orderInfo = req.body.orderDescription;
    var orderType = req.body.orderType;
    var locale = req.body.language;
    if(locale === null || locale === ''){
        locale = 'vn';
    }
    var currCode = 'VND';
    var vnp_Params = {};
    vnp_Params['vnp_Version'] = '2';//
    vnp_Params['vnp_Command'] = 'pay';//s
    vnp_Params['vnp_TmnCode'] = tmnCode;//
    // vnp_Params['vnp_Merchant'] = ''
    vnp_Params['vnp_Locale'] = 'vn';//
    vnp_Params['vnp_CurrCode'] = 'VND';//   
    vnp_Params['vnp_TxnRef'] = orderId;//
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan hoa don';//
    vnp_Params['vnp_OrderType'] = 'topup';//
    vnp_Params['vnp_Amount'] = amount * 100;//
    vnp_Params['vnp_ReturnUrl'] = returnUrl;//
    vnp_Params['vnp_IpAddr'] = ipAddr;//
    vnp_Params['vnp_CreateDate'] = createDate;//
    if(bankCode !== null && bankCode !== ''){
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    var querystring = require('qs');
    var signData = secretKey + querystring.stringify(vnp_Params, { encode: false });

    var sha256 = require('sha256');

    var secureHash = sha256(signData);

    vnp_Params['vnp_SecureHashType'] =  'SHA256';
    vnp_Params['vnp_SecureHash'] = secureHash;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: true });

    var cart = req.session.cart;
    var user = req.session.authUser;
    console.log(user);
    var entity={};
    entity.OrderDate=moment(date, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
    console.log("user.id = ", user.id);
    entity.UserID=user.id;
    console.log("UserID = ", entity.UserID);
    entity.Total=cart.totalPrice;
    req.session.cart=null;
    db.add('orders',entity);


    //Neu muon dung Redirect thi dong dong ben duoi
    //res.status(200).json({code: '00', data: vnpUrl})
    //Neu muon dung Redirect thi mo dong ben duoi va dong dong ben tren
    res.redirect(vnpUrl)
}); 
router.get('/vnpay_ipn', function (req, res, next) {
    var vnp_Params = req.query;
    var secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    var config = require('config');
    var secretKey = config.get('vnp_HashSecret');
    var querystring = require('qs');
    var signData = secretKey + querystring.stringify(vnp_Params, { encode: false });
    
    var sha256 = require('sha256');

    var checkSum = sha256(signData);

    if(secureHash === checkSum){
        var orderId = vnp_Params['vnp_TxnRef'];
        var rspCode = vnp_Params['vnp_ResponseCode'];
        //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
        var cart = req.session.cart;
        var user = req.session.authUser;
        var entity={};
            entity.OrderDate=moment(date, "YYYY-MM-DD HH:MM:SS").format("YYYY-MM-DD HH:MM:SS");
            entity.UserID=user.UserID;
            entity.Total=cart.totalPrice;
        db.add('orders',entity);
        //     var data = {OrderDate: moment(date, "YYYY-MM-DD HH:MM:SS").format("YYYY-MM-DD HH:MM:SS"),UserID: user.UserID,Total: cart.totalPrice};
        //     let sql = "INSERT INTO orders SET ?";
        //     let query = db.query(sql, data, (err, results) => {
        //       console.log('Thanh Cong');
        //       if(err) throw err;
        //       res.redirect('/home');
        //   });
          
        res.status(200).json({RspCode: '00', Message: 'success'})
    }
    else {
        res.status(200).json({RspCode: '97', Message: 'Fail checksum'})
    }
});

function sortObject(o) {
    var sorted = {},
        key, a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
}
router.get('/vnpay_return', function (req, res, next) {
    var vnp_Params = req.query;

    var secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    var config = require('config');
    var tmnCode = config.get('vnp_TmnCode');
    var secretKey = config.get('vnp_HashSecret');

    var querystring = require('qs');
    var signData = secretKey + querystring.stringify(vnp_Params, { encode: false });

    var sha256 = require('sha256');

    var checkSum = sha256(signData);

    if(secureHash === checkSum){
        //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

        res.render('success', {code: vnp_Params['vnp_ResponseCode']})
    } else{
        res.render('success', {code: '97'})
    }
});

module.exports = router;