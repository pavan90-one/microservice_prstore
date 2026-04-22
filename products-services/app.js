const express = require("express");
const morgan = require("morgan");
const logger = require("./logger");
const app = express();
app.use(morgan("combined", { stream: logger.stream }));
const connectDB = require("./src/config/database");
const productRoutes = require("./src/routes/product.route");
app.use(express.json());
app.use("/product", productRoutes);
connectDB().then(() => {
    console.log("MongoDB connected");
}).catch((error) => {
    console.error(error);
});
app.listen(3001, () => {
    console.log("Products services is running on port 3001");
}); 