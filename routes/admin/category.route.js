const express = require("express");
const categoryModel = require("../../models/category");
const productModel = require("../../models/product")
const router = express.Router();

router.get("/", async(req, res) => {
    const rows = await categoryModel.allWithDetails();

    // console.log(`++rows++`, rows);


    res.render("vwCategories/index", {
        layout: 'admin',
        categories: rows,
        empty: rows.length === 0
    });
});

router.get("/add", (req, res) => {
    res.render("vwCategories/add", {
        layout: 'admin',

    });
});

router.post("/add", async(req, res) => {
    const result = await categoryModel.add(req.body);
    res.render("vwCategories/add");
});

router.get("/err", (req, res) => {
    throw new Error("error occured");
});

router.get("/edit/:id", async(req, res) => {
    const catId = req.params.id;
    const rows = await categoryModel.single(catId);
    if (rows.length === 0) {
        throw new Error("Invalid category id");
    }
    // const totalProductsbyCat = productModel.countByCat(catId).then()


    const [totalProductsbyCat] = await Promise.all([productModel.countByCat(catId)]);
    console.log(totalProductsbyCat)
    res.render("vwCategories/edit", {
        total: totalProductsbyCat,
        category: rows[0]
    });
});

router.post("/patch", async(req, res) => {
    const result = await categoryModel.update(req.body);
    res.redirect("/admin/categories");
});

router.post("/del", async(req, res) => {
    const result = await categoryModel.del(req.body.CatID);
    res.redirect("/admin/categories");
});

module.exports = router;