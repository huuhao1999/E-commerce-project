const db = require("../database/mysql");
const tbName = "users";

module.exports = {
    add: async user => {
        const id = await db.add(tbName, user);
        return id;
    },
    singleByUsername: async username => {
        const rows = await db.load(
            `select * from users where f_Username = '${username}'`
        );
        if (rows.length === 0) return null;

        return rows[0];
    },
    singleByEmail: async email => {
        const rows = await db.load(
            `select * from users where f_Email = '${email}'`
        );
        if (rows.length === 0) return null;

        return rows[0];
    },
    getByUserName: async username => {
        let sql = `SELECT * FROM ?? WHERE ?? = ?`;
        const params = [tbName, "f_Username", username];
        sql = db.mysql.format(sql, params);
        console.log("accountM/getByUsername sql= ", sql);
        const rs = await db.load(sql);
        if (rs.length > 0) {
            return rs[0];
        }
        return null;
    },
    UpdateInformationUser: async entity => {
        const sql =
            'UPDATE users SET f_phone="' +
            entity.f_phone +
            '",f_address="' +
            entity.f_address +
            '",f_DOB="' +
            entity.f_DOB +
            '",f_Name="' +
            entity.f_Name +
            '" where f_Username ="' +
            entity.f_Username +
            '"';
        const rows = await db.load(sql);
        return rows;
    },
    changePassword: async entity => {
        const sql =
            'UPDATE users SET f_Password="' +
            entity.f_Password +
            '" where f_Username ="' +
            entity.f_Username +
            '"';

        const rows = await db.load(sql);
        return rows;
    },

    addOneRequest: async(entity, cb) => {
        try {
            const rows = await db.add(`requests`, entity);
            // console.log(rows);
            cb(null, rows);
        } catch (error) {
            cb(error, null);
            console.log("Error Model: Product: insertOneToWishList", error);
        }
    },

    async CountUsers() {
        const rows = await db.load(
            `select count(*) as Users from users where f_Permission = 0`        
        );
        if (rows.length == 0) return null;

        return rows[0];
    }
};