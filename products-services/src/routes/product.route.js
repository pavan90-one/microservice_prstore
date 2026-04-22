const express = require("express");
const router = express.Router();
const createProduct = require("../controller/product.controller");
router.post("/create", createProduct);
module.exports = router;    