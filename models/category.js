const db = require("../database/mysql"),
    run = db.errorHandle;

const tbName = "categories",
    idField = "CatID";

module.exports = {
    all: async() => {
        const sql = `SELECT * FROM ${tbName}`;
        const [rows, err] = await run(db.load(sql));

        if (err) {
            console.log("Error Model: Category: all", err);
            throw err;
        }
        return rows;
    },
    allWithDetails: async() => {
        const sql = `SELECT c.CatID, c.CatName, count(p.ProID) as num_of_products
        from ${tbName} c left join products p on c.CatID = p.CatID
        group by c.CatID, c.CatName`;
        const [rows, err] = await run(db.load(sql));

        if (err) {
            console.log("Error Model: Category: allWithDetails", err);
            throw err;
        }
        return rows;
    },
    getCategoryID: async name => {
        var sql="select CatID as id_category from categories where CatName='"+name+"'";
        const rows=await db.load(sql);
        return rows[0].id_category;
    },
    del: async id => {
        const [nr, err] = await run(db.del(tbName, idField, id));
        if (err) {
            console.log("Error Model: Category: del", err);
            throw err;
        }
        return nr;
    },
    update: async entity => {
        const [nr, err] = await run(db.update(tbName, idField, entity));
        if (err) {
            console.log("Error Model: Category: update", err);
            throw err;
        }
        return nr;
    },
    add: async entity => {
        const [id, err] = await run(db.add(tbName, entity));
        if (err) {
            console.log("Error Model: Category: add", err);
            throw err;
        }
        return id;
    },
    single: id => db.load(`select * from categories where CatID = ${id}`)



};