const db = require("../database/mysql"),
    run = db.errorHandle;
const config = require("../config/default.json");

const tbName = `products`;
const idField = `ProID`;
module.exports = {
    all: async() => {
        try {
            const sql = `SELECT * FROM ${tbName}`;
            const rows = await db.load(sql);

            return rows;
        } catch (error) {
            console.log("Error Model: Product: all", error);
        }
    },
    allByCatId: async id => {
        try {
            const sql = `SELECT * FROM ${tbName} WHERE CatID = ${id} LIMIT 5`;
            const rows = await db.load(sql);
            return rows;
        } catch (error) {
            console.log("Error Model: Product: all User Id", error);
        }
    },
    allByUserId: async id => {
        try {
            const sql = `SELECT * FROM wishlist WHERE UserID = ${id}`;
            const rows = await db.load(sql);
            return rows;
        } catch (error) {
            console.log("Error Model: Product: all Cat Id", error);
        }
    },
    allByCatIdPaging: async(id, page) => {
        let sql = `SELECT count(*) AS total FROM ${tbName} WHERE CatID=${id}`;
        const rs = await db.load(sql);
        const totalP = rs[0].total;
        const pageTotal = Math.floor(totalP / pageSize) + 1;
        const offset = (page - 1) * pageSize;
        sql = `SELECT * FROM ${tbName} WHERE CatID=${id} LIMIT ${pageSize} OFFSET ${offset}`;
        const rows = await db.load(sql);
        return {
            pageTotal: pageTotal,
            product: rows
        };
    },
    async getMaxProID () {
        const sql=`select max(ProID) as max_id from products`;
        const rows=await db.load(sql);
        return rows[0].max_id;
    },
    getDetailById: async id => {
        try {
            const sql = `SELECT * FROM ${tbName} WHERE ProID = ${id}`;
            const rows = await db.load(sql);
            return rows;
        } catch (error) {
            console.log("Error Model: Product: all Pro Id", error);
        }
    },
    countByCat: async catId => {
        const rows = await db.load(
            `select count(*) as total from products where CatID = ${catId}`
        );
        return rows[0].total;
    },
    pageByCat: (catId, offset) =>
        db.load(
            `select * from products where CatID = ${catId} limit ${config.paginate.limit} offset ${offset}`
        ),
        add: async function(entity) {
            try {
                // const sql = `INSERT INTO \`products\` VALUES(NULL, ${OwnerID}, ${OwnerID}, '${ProName}', '${TinyDes}', '${FullDes}', ${StartPrice}, ${Step}, ${PriceToBuy}, ${CatID}, NULL, NULL, now(), addtime(now(),'12:0:0'), ${exten})`;
                const pro = await db.add(`products`, entity);
                return pro;
            } catch (error) {
                console.log('Error Add Product: ', error);
            }
        },
    addProduct: function(entity){
        var sql="insert into products values("+entity["ProID"]+",'"+entity["ProName"]+"','"+entity["TinyDes"]+"','"+entity["FullDes"]+"',"+entity["Price"]+","+entity["CatID"]+","+entity["Quantity"]+")";
        db.load(sql);
    },
    del: id => db.del(tbName, idField, id),

    patch: entity => {
        const condition = { ProID: entity.ProID };
        delete entity.ProID;
        return db.patch("products", entity, condition);
    },
    update: async entity => {
        const [nr, err] = await run(db.update(tbName, idField, entity));
        if (err) {
            console.log("Error Model: Product: update", err);
            throw err;
        }
        return nr;
    },


    deleteOne: async(id, cb) => {
        try {
            const rows = await db.del(tbName, idField, id);
            cb(null, rows);
        } catch (error) {
            cb(error, null);
            console.log("Error Model: Product: all", error);
        }
    },

 
    getTopUser: async id => {
        try {
            const sql = `SELECT u.id, u.f_Username, u.f_Evaluate, b.Price, b.Time FROM biddinglist b, users u WHERE b.ProID=${id} and b.UserID=u.id and b.Status!=2 order by Price desc`;
            const rows = await db.load(sql);
            return rows;
        } catch (error) {
            console.log("Error Model: Product: all Pro Id", error);
        }
    },

    async  TotalIncome() {
        const rows = await db.load(
            `select sum(Total) as TotalIncome from orders`        
        );
        if (rows.length == 0) return null;

        return rows[0];
    },


    async IncomeYear(){
        const rows = await db.load(
            `select sum(Total) as TotalIncome from orders where YEAR(OrderDate) = YEAR(SYSDATE()) `        
        );
        if (rows.length == 0) return null;

        return rows[0];
    },

    async IncomeWeek(){
        const rows = await db.load(
            `select sum(Total) as TotalIncome from orders where WEEK(OrderDate) = WEEK(SYSDATE()) and YEAR(OrderDate) = YEAR(SYSDATE()) `        
        );
        if (rows.length == 0) return null;

        return rows[0];
    },

    async IncomeMonth(){
        const rows = await db.load(
            `select sum(Total) as TotalIncome from orders where MONTH(OrderDate) = MONTH(SYSDATE()) and YEAR(OrderDate) = YEAR(SYSDATE()) `        
        );
        if (rows.length == 0) return null;

        return rows[0];
    },

    async IncomeDaily(){
        const rows = await db.load(
            `select sum(Total) as TotalIncome from orders where DAY(OrderDate) = DAY(SYSDATE()) and YEAR(OrderDate) = YEAR(SYSDATE()) and MONTH(OrderDate) = MONTH(SYSDATE()) `        
        );
        if (rows.length == 0) return null;

        return rows[0];
    },

    async Top5Seller(){
        const rows = await db.load(
            `  select ord.ProID, pro.ProName from orderdetails ord, products pro where ord.proID = pro.proID group by ord.ProID, pro.ProName order by Count(ord.ProID) desc LIMIT 20 OFFSET 20`        
        );
        if (rows.length == 0) return null;
        return rows;
    },

    async GetChartData_Month(){
        const rows = await db.load(
            `   select MONTHNAME(OrderDate) as Mont, sum(Total) as TongTien from orders where Month(OrderDate) <= Month(sysdate()) and Month(OrderDate) >= Month(sysdate()) - 5 group by Month(OrderDate) order by Month(OrderDate)`        
        );
        if (rows.length == 0) return null;
        else{
            //console.log(rows)
            let resultTotal = [];
            let resultMont = [];
            for (var i = 0; i < rows.length; i++ )
            {
                let temp = rows[i].TongTien;
                let temp2 = rows[i].Mont;
                resultTotal.push(temp);
                resultMont.push(temp2);
            }   
            return [resultMont,resultTotal];
        }
        
    },

    async GetChartData_Week(){
        const rows = await db.load(
            `     	select week(OrderDate) as Wek, sum(Total) as TongTien from orders where week(OrderDate) <= week(sysdate())  and week(OrderDate) > week(sysdate()) - 6 group by week(OrderDate) order by week(OrderDate)
            `        
        );
        if (rows.length == 0) return null;
        else{
            let resultTotal = [];
            for (var i = 0; i < rows.length; i++ )
            {
                let temp = rows[i].TongTien;
                resultTotal.push(temp);
            }   
            return resultTotal;
        }
    },

    async GetPieChartData_Cate(){
        const rows = await db.load(
            `     	 select cate.CatName, sum(orde.Price) as Toal  from orderdetails orde INNER JOIN products pro on orde.ProID = pro.ProID INNER JOIN categories cate on pro.CatID = cate.CatID group by cate.CatID,cate.CatName;

            `        
        );
        if (rows.length == 0) return null;
        else{
            let resultTotal = [];
            let resultCate = [];
            for (var i = 0; i < rows.length; i++ )
            {
                let temp = rows[i].Toal;
                let temp2 = rows[i].CatName;
                resultTotal.push(temp);
                resultCate.push(temp2);
            }   
            return [resultCate,resultTotal];
        }
    },

     SelectOrders: async() => {
        const rows = await db.load(
            `select ord.OrderID, ord.OrderDate,us.id as UserID,us.f_Name as UserName,ord.Total,us.f_Permission as Users_Role from orders ord INNER JOIN users us ON ord.UserID = us.id`        
        );
        if (rows.length == 0) return null;
        return rows;
    },
};