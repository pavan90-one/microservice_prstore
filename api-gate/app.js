const express = require("express");
const app = express();
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./logger");
app.use(cors());
app.use(morgan("combined", { stream: logger.stream }));
app.use("/user", createProxyMiddleware({ target: process.env.USER_SERVICE_URL || "http://localhost:3000", changeOrigin: true, pathRewrite: { "^/": "/user/" } }));
app.use("/product", createProxyMiddleware({ target: process.env.PRODUCT_SERVICE_URL || "http://localhost:3001", changeOrigin: true, pathRewrite: { "^/": "/product/" } }));
app.use(express.json());
app.listen(8000, () => {
    console.log("API Gate is running on port 8000");
}); 