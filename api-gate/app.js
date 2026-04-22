const express = require("express");
const app = express();
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./logger");
const CircuitBreaker = require("opossum");

app.use(cors());
app.use(morgan("combined", { stream: logger.stream }));
app.use("/user", createProxyMiddleware({ target: process.env.USER_SERVICE_URL || "http://localhost:3000", changeOrigin: true, pathRewrite: { "^/": "/user/" } }));
app.use("/product", createProxyMiddleware({ target: process.env.PRODUCT_SERVICE_URL || "http://localhost:3001", changeOrigin: true, pathRewrite: { "^/": "/product/" } }));
app.use(express.json());
async function callBackProductService() {
    try {
          const response = await axios.get(process.env.PRODUCT_SERVICE_URL || "http://localhost:3001/product");
          return response.data;       
    } catch (error) {
        throw new Error("Product service is not available");
    }
}
const option = {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
}
const breaker = new CircuitBreaker(callBackProductService, option);
breaker.on("open", () => {
    console.log("Circuit is open");
});
breaker.on("close", () => {
    console.log("Circuit is closed");
});
breaker.on("halfOpen", () => {
    console.log("Circuit is half open");
});
app.get("/product", async (req, res) => {
    try {
        const data = await breaker.fire();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(8000, () => {
    console.log("API Gate is running on port 8000");
}); 