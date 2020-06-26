const express = require("express");

const ProductController = require("../controllers/product");

const router = express.Router();

router.get("/:id", ProductController.getByProId);

module.exports = router;