const jwt = require("jsonwebtoken");
const JWT_SECRET = "welcomeToNewChapter";
const generateToken = (user) => {
    return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
};
const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verifyToken };