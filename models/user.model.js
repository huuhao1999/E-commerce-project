const db = require("../database/mysql");

const tbName = `users`;
const idField = `id`;
module.exports = {
    all: async() => {
        try {
            const sql = `SELECT * FROM ${tbName}`;
            const rows = await db.load(sql);

            return rows;
        } catch (error) {
            console.log("Error Model: User: all", error);
        }
    },
    allByPermission: async permission => {
        try {
            const sql = `SELECT * FROM ${tbName} WHERE f_Permission = ${permission}`;
            const rows = await db.load(sql);
            return rows;
        } catch (error) {
            console.log("Error Model: User: allByPermission", error);
        }
    },
    allByRequest: async() => {
        try {
            const sql = `SELECT * FROM requests`;
            const rows = await db.load(sql);
            return rows;
        } catch (error) {
            console.log("Error Model: User: allByPermission", error);
        }
    },

    getDetailById: async id => {
        try {
            const sql = `SELECT * FROM ${tbName} WHERE ${idField} = ${id}`;

            // console.log(`====`, sql)

            const rows = await db.load(sql);
            return rows;
        } catch (error) {
            console.log("Error Model: User: Detail Pro Id", error);
        }
    },
    deleteOneRequest: async(id, cb) => {
        try {
            const rows = await db.del(`requests`, `UserID`, id);
            cb(null, rows);
        } catch (error) {
            cb(error, null);
            console.log("Error Model: Product: all", error);
        }
    },
    getRequestById: async id => {
        try {
            const sql = `SELECT * FROM requests WHERE UserID = ${id}`;

            // console.log(`====`, sql)

            const rows = await db.load(sql);
            return rows;
        } catch (error) {
            console.log("Error Model: User: Detail Pro Id", error);
        }
    },

    singleByUsername: async username => {
        const rows = await db.load(
            `select * from users where f_Username = '${username}'`
        );
        if (rows.length === 0) return null;

        return rows[0];
    },

    del: id => db.del("users", {id: id }),


    loadReview: async UserID => {
        try {
            const sql = `SELECT u.id, u.f_Name, r.Comment, r.Rate, r.TimeRate FROM reviews r, users u WHERE r.UserID=${UserID} AND r.RatedID=u.id`;
            const rows = await db.load(sql);
            return rows;
        } catch (error) {
            console.log("Error Review: check", error);
        }
    },


};