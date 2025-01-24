const amqp = require('amqplib');

let channel;

exports.setupQueue = async () => {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue('frameQueue');
};

exports.sendFrameToQueue = (frame) => {
    if (channel) {
        channel.sendToQueue('frameQueue', Buffer.from(frame));
    }
};
