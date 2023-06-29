require('dotenv').config();
const http = require('http');
const fs = require('fs');
const connectMqtt = require('./controller/mqtt');
const axios = require('axios');

let data = '';

const server = http.createServer((req, res) => {
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
    const checkZero = ['000','0000','00000','000000','0000000','00000000','000000000','0000000000'];

    if (licensePlate !== 'unknown' && !checkZero.includes(licensePlate)) {
      textData = licensePlate.toString();
      console.log('License plate:', textData);
      connectMqtt.connectToRabbitMQ(textData);
      // callBarrierGateAPI();
    }

    console.log('DateTime:', dateTime);

    const entry = {
      licensePlate: textData,
      dateTime: dateTime
    };

    data += JSON.stringify(entry) + '\n';

    const filename = 'data.json';
    fs.writeFile(filename, data, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error writing to file');
      } else {
        console.log('Data written to file:', filename);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(textData);
      }
    });
  });
});

const startServer = async () => {
  try {
    server.listen(process.env.SERVER_PORT, process.env.SERVER_IP, () => {
      console.log(`Server running at ${process.env.SERVER_IP}:${process.env.SERVER_PORT}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

async function callBarrierGateAPI() {
  const apiURL = 'http://127.0.0.1:8000/api/open/barrierGate';
  await axios.post(apiURL)
    .then(response => {
      console.log('API response:', response.data);
    })
    .catch(error => {
      console.error('API error:', error);
    });
};

callBarrierGateAPI()

//startServer();
