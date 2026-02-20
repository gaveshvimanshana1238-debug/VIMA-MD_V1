const fs = require('fs');

if (fs.existsSync('config.env')) {
  require('dotenv').config({ path: './config.env' });
}

function convertToBool(text, fault = 'true') {
  return text === fault;
}

module.exports = {

  // Session ID
  SESSION_ID: process.env.SESSION_ID || "",

  // Alive image
  ALIVE_IMG: process.env.ALIVE_IMG || "https://raw.githubusercontent.com/gaveshvimanshana126-cyber/VIMA-MD/main/Image/20260218_134730.jpg",

  // Alive message (Changed to VIMA-MD)
  ALIVE_MSG: process.env.ALIVE_MSG || "*Hello 👋 VIMA-MD Is Alive Now 😍*",

  // Owner number
  BOT_OWNER: process.env.BOT_OWNER || "94742549935",

};
