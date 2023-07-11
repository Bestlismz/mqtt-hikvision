require('dotenv').config();
const axios = require('axios');


async function callBarrierGateAPI() {
    const apiURL = 'http://127.0.0.1:8000/api/open/barrierGate';
    await axios.post(apiURL)
      .then(response => {
        console.log("================================")
        console.log('API response:', response.data);
        console.log("================================")
      })
      .catch(error => {
        console.error('API error:', error);
      });
  };


  async function check_license_plate(license_plate){
    const post = new FormData
    post.append('license_plate',license_plate)
    const response = await axios.post(process.env.URL_CHECK_LICENSEPLATE,post,{
      headers: {
        'Authorization' : process.env.TOKEN_LETMEIN
      }
    })
  
    return response.data.is_open
  }

module.exports = {
  callBarrierGateAPI,
  check_license_plate
}