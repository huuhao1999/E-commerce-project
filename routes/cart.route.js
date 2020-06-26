var express = require('express');
var router = express.Router()
var Cart = require('../models/cart');
var mPro = require('../models/product');

router.post("/promote-validation", (req, res, next)=>{
    if (!req.session.cart) {
      return res.render('vwCart/cart', {
        products: null
      });
    }
    var cart = new Cart(req.session.cart);
    
    res.render('vwCart/cart', {
      title: 'NodeJS Shopping Cart',
      products: cart.getItems(),
      totalPrice: req.body.coupon==="N2434-X9D7W-8PF6X"?cart.totalPrice * 0.8:cart.totalPrice
      // totalPrice: cart.checkCoupon()
    });
});

router.get('/add/:id', async function(req, res, next) {

    var productId = req.params.id;
  
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    var x=await mPro.getDetailById(productId);
   
    var product={id:x[0].ProID,price:x[0].Price,Proname: x[0].ProName,Tiny:x[0].TinyDes};
   
    cart.add(product, productId);
    req.session.cart = cart;
    console.log(cart.getItems());
    console.log(req.session.authUser);
    res.redirect('/products/'+productId);
  
   
  });
  router.get('/cart', function(req, res, next) {
    if (!req.session.cart) {
      return res.render('vwCart/cart', {
        products: null
      });
    }
    var cart = new Cart(req.session.cart);
    res.render('vwCart/cart', {
      title: 'NodeJS Shopping Cart',
      products: cart.getItems(),
      totalPrice: cart.totalPrice
      // totalPrice: cart.checkCoupon()
    });
  });

router.get('/remove/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.remove(productId);
    req.session.cart = cart;
    res.redirect('/cart');
  });
  module.exports = router;
  