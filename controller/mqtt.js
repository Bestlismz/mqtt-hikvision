const amqp = require('amqplib');
const brokerUrl = 'amqp://letmeinThericeLpr:Uk9Jn3SO40zANzf@mqtt.letmein.asia/'; 
const queue = 'lprTherice';

// Connect to RabbitMQ
async function connectToRabbitMQ(message) {
  try {
    const connection = await amqp.connect(brokerUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue);
    console.log('Connected to RabbitMQ');

    await channel.sendToQueue(queue,Buffer.from(message))
    console.log(`Send Message to RabbitMQ : ${message}`);
  
    await channel.close()
    console.log('Close Channel RabbitMQ');
    await connection.close()
    console.log('Close Connected RabbitMQ');

  } catch (error) {
    throw new Error('Error connecting to RabbitMQ: ' + error.message);
  }
};

async function waitData() {
    try {
      const connection = await amqp.connect(brokerUrl);
      const channel = await connection.createChannel();
      await channel.assertQueue(queue);
      console.log('wait to RabbitMQ');
  
      channel.consume(queue, (msg) => {
        if (msg !== null) {
          console.log('Recieved:', msg.content.toString());
          channel.ack(msg);
        } else {
          console.log('Consumer cancelled by server');
        }
      });
  
    } catch (error) {
      throw new Error('Error connecting to RabbitMQ: ' + error.message);
    }
  };

module.exports = {
    connectToRabbitMQ,
    waitData
}