const fs = require('fs');

if (fs.existsSync('config.env')) {
  require('dotenv').config({ path: './config.env' });
}

function convertToBool(text, fault = 'true') {
  return text === fault ? true : false;
}

module.exports = {

  SESSION_ID: process.env.SESSION_ID || "",

  ALIVE_IMG: process.env.ALIVE_IMG || "https://raw.githubusercontent.com/gaveshvimanshana126-cyber/VIMA-MD/main/Image/20260218_134730.jpg",

  ALIVE_MSG: process.env.ALIVE_MSG || "*Hello 👋 VIMA-MD Is Alive Now 😍*",

  BOT_OWNER: process.env.BOT_OWNER || '94742549935',

};
