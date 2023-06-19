require('dotenv').config()
const http = require('http');
const fs = require('fs');
const connectMqtt = require('./controller/mqtt');
// const {serverPort,serverIP} = process.env;

let data = '';

// console.log("ip : ",process.env)
//connectMqtt.waitData()

const server = http.createServer((req, res) => {
  // Handle incoming requests
  // Process the ANPR data or notifications here
  let requestData = '';
  req.on('data', (chunk) => {
    requestData += chunk;
  });
  req.on('end', async () => {
    const licensePlateStartTag = '<licensePlate>';
    const licensePlateEndTag = '</licensePlate>';
    const startIndex = requestData.indexOf(licensePlateStartTag);
    const endIndex = requestData.indexOf(licensePlateEndTag);
    const licensePlate = startIndex !== -1 && endIndex !== -1 && endIndex > startIndex
      ? requestData.substring(startIndex + licensePlateStartTag.length, endIndex).trim()
      : '';
    const dateTimeStartTag = '<dateTime>';
    const dateTimeEndTag = '</dateTime>';
    const dateTimeIndexStart = requestData.indexOf(dateTimeStartTag);
    const dateTimeIndexEnd = requestData.indexOf(dateTimeEndTag);
    const dateTime = dateTimeIndexStart !== -1 && dateTimeIndexEnd !== -1 && dateTimeIndexEnd > dateTimeIndexStart
      ? requestData.substring(dateTimeIndexStart + dateTimeStartTag.length, dateTimeIndexEnd).trim()
      : '';
    let textData = '';
    const checkZero = ['000','0000','00000','000000','0000000','00000000','000000000','0000000000']
    if (licensePlate !== 'unknown' && !checkZero.includes(licensePlate)) {
      textData = licensePlate.toString();
      console.log('License plate:', textData);
      connectMqtt.connectToRabbitMQ(textData)
    }
    console.log('DateTime:', dateTime);

    // Create an object with the license plate and date/time values
    const entry = {
      licensePlate: textData,
      dateTime: dateTime
    };

    // Add the entry to the data string
    data += JSON.stringify(entry) + '\n';

    // Save the data string to the JSON file after each request
    const filename = 'data.json';
    fs.writeFile(filename, data, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
        // Send back an error response to the client
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error writing to file');
      } else {
        console.log('Data written to file:', filename);
        // Send back the converted text to the client
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(textData);
      }
    });
  });
});

// Start the server and connect to RabbitMQ
const startServer = async () => {
  try {
    // const channel = await connectToRabbitMQ();
    server.listen(process.env.SERVER_PORT,process.env.SERVER_IP, () => {
      console.log(`Server running at ${process.env.SERVER_IP}:${process.env.SERVER_PORT}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
