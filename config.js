const fs = require('fs');

if (fs.existsSync('config.env')) {
  require('dotenv').config({ path: './config.env' });
}

function convertToBool(text, fault = 'true') {
  return text === fault;
}

module.exports = {

  // Session ID
  SESSION_ID: process.env.SESSION_ID || "Vup0CDDL#JGe8IsmEHNIPShaNXgceFnKEGHmtft7kltt6wII-ijQ",

  // Alive image
  ALIVE_IMG: process.env.ALIVE_IMG || "https://raw.githubusercontent.com/gaveshvimanshana1238-debug/VIMA-MD_V1/refs/heads/main/Image/20260218_134730.jpg",

  // Alive message (Changed to VIMA-MD)
  ALIVE_MSG: process.env.ALIVE_MSG || "*Hello 👋 VIMA-MD Is Alive Now 😍*",

  // Owner number
  BOT_OWNER: process.env.BOT_OWNER || "94742549935",

};
