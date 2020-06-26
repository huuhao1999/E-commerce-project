module.exports = function Cart(cart) {
    this.items = cart.items || {};
    this.totalItems = cart.totalItems || 0;
    this.totalPrice = cart.totalPrice || 0;

    this.add = function(item, id) {
        var cartItem = this.items[id];
        if (!cartItem) {
            cartItem = this.items[id] = {item: item, quantity: 0, price: 0};
        }
        cartItem.quantity++;
        cartItem.price = cartItem.item.price * cartItem.quantity;
        this.totalItems++;
        this.totalPrice += cartItem.item.price;
    };

    this.remove = function(id) {
        this.totalItems -= this.items[id].quantity;
        this.totalPrice -= this.items[id].price;
        delete this.items[id];
    };
    
    this.getItems = function() {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
    // this.checkCoupon = function(){
    //     var bl = false;
    //     var arr = ["BT79Q-G7N6G-PGBYW","N2434-X9D7W-8PF6X"]
    //     let coupon = document.getElementById("coupon").value;
    //     for (var i in arr){
    //         if (coupon === i){
    //             bl = true;
    //             break;
    //         }
    //     }
    //    if (bl === true){
    //         return  this.totalPrice * 0.8;
    //    }
    //    return this.totalPrice
    // }
};