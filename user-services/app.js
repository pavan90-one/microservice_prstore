const express = require("express");
const morgan = require("morgan");
const logger = require("./logger");
const app = express();
app.use(morgan("combined", { stream: logger.stream }));
const jwt = require("jsonwebtoken");
const amqplib = require("amqplib");
const connectDB = require("./config/database");
const userRoutes = require("./routes/user.routes");
app.use(express.json());
app.use("/user", userRoutes);
connectDB().then(() => {
    console.log("user-services MongoDB connected");
}).catch((error) => {
    console.error(error);
});

app.listen(3000, () => {
    console.log("User services is running on port 3000");
});