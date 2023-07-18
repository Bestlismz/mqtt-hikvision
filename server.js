require("dotenv").config();
const axios = require("axios");
const connectMqtt = require("./controller/mqtt");
const command = require("./controller/command");
const http = require("http");

let data = "";

const server = http.createServer((req, res) => {
  let requestData = "";
  req.on("data", (chunk) => {
    requestData += chunk;
  });
  req.on("end", async () => {
    const checkZero = [
      "000",
      "0000",
      "00000",
      "000000",
      "0000000",
      "00000000",
      "000000000",
      "0000000000",
    ];
    const json = JSON.parse(requestData);
    const licensePlate = json.params.events[0].data.plateNo;
    const happenTime = json.params.events[0].happenTime;
    const picture = json.params.events[0].data.vehiclePicUri;
    const Name = json.params.events[0].srcName;
    const Group = json.params.events[0].vehicleGroupIndexCode;

    //check log come in
    //console.log('\n*Check Log come in : ',licensePlate);

    //console.log(requestData);   //=> check all log
    try {
      if (
        licensePlate !== null &&
        licensePlate !== "Unknown" &&
        !checkZero.includes(licensePlate)
      ) {
        console.log("\n");
        console.log("[" + Name + "]");
        console.log("================================");
        console.log("Plate Number: ", licensePlate);
        connectMqtt.connectToRabbitMQ(licensePlate);
        console.log("Time: ", happenTime);
        console.log("Picture: ", picture);

        //callBarrierGate
        if (
          process.env.CAMERA_GATE_IN == Name && Group !== null) {
          command.callBarrierGateAPI();
        }
        if (process.env.CAMERA_GATE_OUT == Name) {
          command.callBarrierGateAPI();
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
    //   const check_licenplate = await command.check_license_plate(textData)
    //   if(check_licenplate) {
    //     console.log('check' , check_licenplate)
    //await command.callBarrierGateAPI();
    //   } else {
    //     console.log('no data')
    //   }
    // }
  });
});

//start server//
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
///////////////
startServer();
