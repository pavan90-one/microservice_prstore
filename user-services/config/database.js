const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || "mongodb://localhost:27017/user-services";
        await mongoose.connect(uri);
        console.log("MongoDB connected");
    } catch (error) {
        console.error(error);
    }
};

module.exports = connectDB;