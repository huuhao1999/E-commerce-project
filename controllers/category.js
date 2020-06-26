const mCat = require("../models/category");
const Trinh = require("../models/category.model"); //sua cho nay
const mPro = require("../models/product");
const mUser = require("../models/user.model");
const config = require("../config/default.json");
const moment = require("moment");


var temp;
module.exports = {
    getAll: async(req, res) => {
        try {
            const cats = await mCat.all();
            //const products = await mPro.all();
            for (let cat of cats) {
                cat.isActive = false;
            }
            const ps = await mPro.allByCatId("1");
            cats[0].isActive = true;
            console.log(cats);
            res.render("vwProducts/allByCat", {
                title: "Online Auction"
            });
        } catch (error) {
            console.log("Error Controller Category getAll: ", error);
        }
    },
    getTop: async(req, res) => {
        try {
            // Top 5 sản phẩm gần kết thúc
            var isadmin=true;
            const psByTimeout = await mPro.all();
            var pro5=new Array(psByTimeout[0],psByTimeout[1],psByTimeout[2],psByTimeout[3],psByTimeout[4]);
            var pro10=new Array(psByTimeout[5],psByTimeout[6],psByTimeout[7],psByTimeout[8],psByTimeout[9]);
            var pro15=new Array(psByTimeout[17],psByTimeout[18],psByTimeout[19],psByTimeout[16],psByTimeout[20]);
            
            var getPros = await Trinh.Get5Prod();//Sua cho nay

            res.render("home", {
                title: "Store",
                showList: true,
                pro5: pro5,
                pro10:pro10,
                pro15:pro15,
                isadmin:isadmin,
                ListProd: getPros,
                messageError: req.flash('error'),
                messageOK: req.flash('OK')
            });
        } catch (error) {
            console.log("Error Controller Category getByCatId", error);
        }
    },
    getByCatId: async(req, res) => {
        try {
            for (const c of res.locals.lcCategories) {
                if (c.CatID === +req.params.id) {
                    c.isActive = true;
                }
            }

            const catId = parseInt(req.params.id);
            const limit = config.paginate.limit;

            const page = req.query.page || 1;
            const offset = (page - 1) * config.paginate.limit;

            const [total, rows] = await Promise.all([
                mPro.countByCat(catId),
                mPro.pageByCat(catId, offset)
            ]);

            for (var i = 0; i < rows.length; i++) {
                const user = await mUser.getDetailById(rows[i].UserID);
                // console.log(user[0]);

                rows[i].TimeFinish = moment(
                    rows[i].TimeFinish,
                    "YYYY-MM-DD HH:MM:SS"
                ).format("YYYY-MM-DD HH:MM:SS");
                if(temp==1)
                rows[i].UserName = user[0].f_Username;
            }

            let nPages = Math.floor(total / limit);
            if (total % limit > 0) nPages++;
            const page_numbers = [];

            for (i = 1; i <= nPages; i++) {
                page_numbers.push({
                    catId: catId,
                    value: i,
                    isCurrentPage: i === +page
                });
            }
            // console.log(page_numbers);
            const navs = {};

            if (page > 1) {
                navs.prev = page - 1;
            }
            if (page < nPages) {
                navs.next = page + 1;
            }

            res.render("vwProducts/allByCat", {
                title: "Online Auction",
                products: rows,
                catId: catId,
                empty: rows.length === 0,
                page_numbers,
                navs: navs
            });
        } catch (error) {
            console.log("Error Controller Category getByCatId", error);
        }
    },
    getByCatIdPaging: async(req, res) => {
        const id = parseInt(req.params.id);
        const page = parseInt(req.query.page) || 1;
        const cats = await mCat.all();
        const rs = await mPro.allByCatIdPaging(id, page);
        for (let cat of cats) {
            cat.isActive = false;
            if (cat.CatID === id) {
                cat.isActive = true;
            }
        }
        const pages = [];
        for (let i = 0; i < rs.pageTotal; i++) {
            pages[i] = { value: i + 1, active: i + 1 === page };
        }
        const navs = {};
        if (page > 1) {
            navs.prev = page - 1;
        }
        if (page < rs.pageTotal) {
            navs.next = page + 1;
        }
        res.render("product/gridView", {
            title: "Products",
            cats: cats,
            ps: rs.products,
            pages: pages,
            navs: navs
        });
    }
};