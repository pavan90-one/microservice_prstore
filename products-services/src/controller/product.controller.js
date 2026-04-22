const Product = require("../schema/product.schema");
const amqplib = require("amqplib");

let channel;
const connectQueue = async (retries = 10) => {
    const uri = process.env.RABBITMQ_URI || "amqp://localhost";
    while (retries > 0) {
        try {
            const connection = await amqplib.connect(uri);
            channel = await connection.createChannel();
            await channel.assertQueue("product-services");
            return channel;
        } catch (error) {
            console.log(`RabbitMQ connection failed, retrying in 5s... (${retries - 1} left)`);
            retries -= 1;
            await new Promise(res => setTimeout(res, 5000));
        }
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, price, description } = req.body;
        const product = new Product({ name, price, description });
        await product.save();
        await channel.sendToQueue("product-services", Buffer.from(JSON.stringify({ product })));
        console.log("Message sent to queue");
        await channel.consume("product-services", (msg) => {
            if (msg) {
                console.log("Message received from queue", msg.content.toString());
                channel.ack(msg);
            }
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

connectQueue().then(() => console.log("RabbitMQ Product channel established")).catch(console.error);

module.exports = createProduct;