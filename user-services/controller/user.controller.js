const User = require("../schema/user.schema");
const { generateToken, verifyToken } = require("../helpers/jwt.helper");
const amqplib = require("amqplib");

let channel;
const connectQueue = async (retries = 10) => {
    const uri = process.env.RABBITMQ_URI || "amqp://localhost";
    while (retries > 0) {
        try {
            const connection = await amqplib.connect(uri);
            channel = await connection.createChannel();
            await channel.assertQueue("user-services");
            return channel;
        } catch (error) {
            console.log(`RabbitMQ connection failed, retrying in 5s... (${retries - 1} left)`);
            retries -= 1;
            await new Promise(res => setTimeout(res, 5000));
        }
    }
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = new User({ name, email, password });
        await user.save();
        const token = generateToken(user);
        await channel.sendToQueue("user-services", Buffer.from(JSON.stringify({ user, token })));
        console.log("Message sent to queue");
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

connectQueue().then(() => console.log("RabbitMQ User channel established")).catch(console.error);

module.exports = registerUser;