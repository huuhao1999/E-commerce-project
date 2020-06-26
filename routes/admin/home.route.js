const express = require("express");
const accountM = require("../../models/account.M");
const router = express.Router();
const config = require("../../config/default.json");
const permission = config.permission;
const userController = require("../../controllers/user.C");
const mUser = require("../../models/user.model");
const db = require("../../database/mysql");
const productQuery = require('../../models/product')
const multer = require("multer");
const ProductController = require("../../controllers/product");
const CategoryModels = require("../../models/category");
const fs = require('fs');
const mPro = require("../../models/product");
router.get("/", async (req, res) => {
    const [mont,total] = await productQuery.GetChartData_Month();
    const Weekdata = await productQuery.GetChartData_Week();
    const orders = await productQuery.SelectOrders();
    const Yearly =  await productQuery.IncomeYear();
    const Monthly = await productQuery.IncomeMonth();
    const Weekly = await productQuery.IncomeWeek();
    const Daily = await productQuery.IncomeDaily();
    //console.log(mont);
    //console.log(total);
    res.render("vwAdmin/home", {
        layout: "admin",
        AnnualIncome: Yearly.TotalIncome,
        MonthlyIncome: Monthly.TotalIncome,
        WeeklyIncome: Weekly.TotalIncome,
        DailyIncome: Daily.TotalIncome,
        WeekDatas: JSON.stringify(Weekdata),
        Datas: JSON.stringify(total), 
        Monthss: JSON.stringify(mont),
        order: orders
    });
});
router.get("/qlkh", async (req, res) => {
    const buyer = await mUser.allByPermission(permission.buyer);
    res.render("vwAdmin/VwManagerUser/qlkh", {
        layout: "admin",
        buyer:buyer,
        emptybuyer: buyer.length === 0,
    });
});

router.get("/users/:id", async(req, res) => {
    var idUser=req.params.id;
    const rows = await db.load('select* from users where id='+idUser);
    
    res.render("vwAdmin/VwManagerUser/infoUser", {
        layout: "admin",
        user:rows,
        
    })
    
});
router.get("/qlkh/delete/:id", async(req, res) => {

    var idUserDelete=req.params.id;
    const rows = await db.del('users', 'id', idUserDelete);

    return res.redirect("/admin/qlkh");
});
router.get("/qlsp/edit/:id", async(req, res) => {

    var idUserUpdate=req.params.id;
    const sql = `SELECT * FROM products WHERE ProID = ${idUserUpdate}`;
    var rows=await db.load(sql);

    return res.render("vwAdmin/VwManagerProduct/1234",{sp:rows});
});
router.post("/qlsp/edit/:id", async(req, res) => {

    var idUserUpdate=req.params.id;

    const sql = `SELECT * FROM products WHERE ProID = ${idUserUpdate}`;
    var rowsUpdte=await db.load(sql);
    var rows={}
    rows.ProID=rowsUpdte[0].ProID;
    rows.FullDes=req.body.product_fulldes;
    rows.TinyDes=req.body.product_tinydes;
    rows.Quantity=req.body.quantily;
    rows.ProName=req.body.product_name;
    rows.Price=req.body.price;
    rows.CatID=rowsUpdte[0].CatID;
    console.log(rows);

    var checka= await db.update('products','ProID',rows);    
   
    return res.redirect("/admin/qlsp");




});





router.get("/qlsp", ProductController.getAll);
router.get("/qlsp/delete/:id", async(req, res) => {

    var ProIDDelete=req.params.id;

    const rows = await db.del('products', 'ProID', ProIDDelete);
    try {
        fs.rmdirSync('../../public/sp/'+ProIDDelete); 
    } catch (error) {
      if(error.code==='ENOENT')
      {console.log("không tồn tại")}
      else if(error.code==='ENOTEMPLY')
      {
          console.log("thư mục trống");
      }
      else
      {console.log(error);}
    }
    
    return res.redirect("/admin/qlsp");
   

    
});
router.get("/tk", async(req, res) => {
    const [mont,total] = await productQuery.GetChartData_Month();
    const Wek = await productQuery.GetChartData_Week();
    const [cate, CateTotal] = await productQuery.GetPieChartData_Cate();
    //console.log(mont);
    //console.log(total);
    res.render("vwAdmin/tk", {
        layout: "admin",
        WeekDatas: JSON.stringify(Wek),
        Datas: JSON.stringify(total), 
        Monthss: JSON.stringify(mont),
        Category: JSON.stringify(cate),
        CategoryTotal: JSON.stringify(CateTotal),
    });
});
router.get("/dt", async (req, res) => {
    const orders = await productQuery.SelectOrders();
    res.render("vwAdmin/dt", {
        layout: "admin",
        order: orders
    });
});
router.get("/login", (req, res) => {
    console.log("View admin in here");
    res.render("vwAdmin/login", { layout: false });
});
//Thêm product
router.get("/Addproduct",async function(req, res){
    const cats = await CategoryModels.all();
    res.render("vwAdmin/VwManagerProduct/Addproduct",{
        cats:cats,
    });
});


router.post("/Addproduct", async function(req, res) {
    const ProID =await productQuery.getMaxProID()+1;
    await ProductController.AddPro(req, res);
    //onst sql = `SELECT max(ProID) as'ID' FROM products`;
    //var maxID = await db.loadPIC(sql);
    //var ProID = maxID[0].ID;

    console.log(`++++++++++++++`, ProID);
    const folderName = `./public/sp/${ProID}`;
    var id = 0;
    if (!fs.existsSync(folderName)) fs.mkdirSync(folderName);
    var storage2 = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, folderName);
        },
        filename: function(req, files, cb) {
            if(id==0){
                cb(null, `1.jpg`);
                id = id + 1;
            }
            else{
                cb(null, `1_${id}.jpg`);
                id = id + 1;
            }
        }
    });
    var upload = multer({ storage: storage2 });
    router.post(
        "/uploadimage",
        upload.array("file_picture", 10),
        function(req, res) {
            res.redirect("/admin/qlsp");
        }
    );
});
// Lịch sử mua hàng
router.get("/LSMuaHang", async(req, res) => {
    var sql=`SELECT od.ID as OrderDetailID, u.id as UserID,u.f_Name,p.ProName,o.OrderDate,o.Total FROM orders o,orderdetails od, products p, users u where u.id=o.UserID and p.ProID=od.ProID and od.OrderID=o.OrderID ;
    `;
    const rows = await db.load(sql);

    var emptyOrder=0;
    if(rows==null) emptyOrder=1
    res.render("vwAdmin/LichSuMuaHang", {
        layout: "admin",
        orders: rows,
        emptyOrder:emptyOrder
    });
});



module.exports = router;