const config = require("../config/default.json");
const permission = config.permission;

const mUser = require("../models/user.model");

module.exports = {
    getAll: async(req, res) => {
        try {
            // console.log(permission.seller)
            const admin = await mUser.allByPermission(permission.admin);
            const buyer = await mUser.allByPermission(permission.buyer);
        

            res.render("vwUsers/index", {
                layout: "admin",
               
          
            });
        } catch (error) {
            console.log("Error Controller Products getAll: ", error);
        }
    },


    getByUserId: async(req, res) => {
        const userId = parseInt(req.params.id);
        try {
            const user = await mUser.getDetailById(userId);

            // console.log(user)
            res.render("vwUsers/detail", {
                layout: "admin",
                user: user
            });
        } catch (error) {
            console.log("Error Controller Product getByProId", error);
        }
    },

    delete: async(req, res) => {
        const id = parseInt(req.params.id);
        mUser.deleteOne(id, (err, result) => {
            if (err) {
                return res.status(501).json({
                    message: "Not able to delete user"
                });
            }

            return res.json({
                id: id,
                name: "user"
            });
        });
    },

        del: id => db.del("users", { f_ID: id }),

    updateOne: async(entity, cb) => {
        try {
            const rows = await db.update(tbName, idField, entity);
            cb(null, rows);
        } catch (error) {
            cb(error, null);
            console.log("Error Model: User: updateOne", error);
        }
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
    deleteRequest: async(req, res) => {
        const id = parseInt(req.params.id);
        mUser.deleteOneRequest(id, (err, result) => {
            if (err) {
                return res.status(501).json({
                    message: "Not able to delete user"
                });
            }

            return res.json({
                id: id,
                name: "user"
            });
        });
    },
    setPermission: async(req, res) => {
        const id = req.params.id;
        const value = JSON.parse(req.params.value);
        const entity = {
            f_Permission: value,
            id: id
        };
    }
}

    
