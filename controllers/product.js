const mCat = require("../models/category");
const mPro = require("../models/product");
const mUser = require("../models/user.model");
const moment = require("moment");
const db = require("../database/mysql");
module.exports = {
    getAll: async(req, res) => {
        try {
            const cats = await mCat.all();

            const products = await mPro.all();

            var CatIDofProduct = 1;
            for (let product of products) {
                CatIDofProduct = product.CatID;
                product.CatName = cats[CatIDofProduct - 1].CatName;
            }

            // console.log(`cat`, cats[3]);
            // console.log("+++", products)
            res.render("vwAdmin/VwManagerProduct/qlsp", {
                title: "Danh sách sản phẩm",
                layout: "admin",
                products: products,
      
            });
        } catch (error) {
            console.log("Error Controller Products getAll: ", error);
        }
    },
   
    getByProId: async(req, res) => {
        const proId = parseInt(req.params.id);
        try {
            const product = await mPro.getDetailById(proId);
            const catId = product[0].CatID;
            const pro5=await mPro.allByCatId(catId);
            var totalentity='';

            if(req.session.isAuthenticated)
            {
                if(req.session.cart!=null)
                {
             
                totalentity='Đã thêm vào Cart: '+req.session.cart.totalItems;
                }
            }

            //Kiểm tra đăng nhập chưa khi click vào button đấu giá
            product[0].isAuthenticated = req.session.isAuthenticated;
            const checkRatedPoint = false;
            res.render("vwProducts/detail", {
                title: "Chi tiết sản phẩm",
                product: product,
                psRelative: pro5,
                totalentity: totalentity

            });
        } catch (error) {
            console.log("Error Controller Product getByProId", error);
        }
    },
    AddPro: async function(req, res) {
        var entity = {};
        
   





        var name_category=req.body.list_category;
       res.render("vwAdmin/VwManagerProduct/upload_file");
       entity.ProID=await mPro.getMaxProID()+1;
       entity.ProName = req.body.product_name;
       entity.ProName=entity.ProName.split("'").join("''");
       console.log(entity.ProName);
       entity.TinyDes = req.body.product_tinydes;
       entity.TinyDes=entity.TinyDes.split("'").join("''");
       entity.FullDes = req.body.product_fulldes;
       entity.FullDes=entity.FullDes.split("'").join("''");
       entity.Price = req.body.price;
       entity.CatID =await mCat.getCategoryID(name_category) ;
       entity.Quantity=req.body.quantily;
       const ProID = mPro.addProduct(entity);
       return ProID;


    }
};