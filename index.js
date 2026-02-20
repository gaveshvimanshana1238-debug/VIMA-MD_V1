const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const P = require('pino');
const express = require('express');
const path = require('path');

const config = require('./config');
const { sms } = require('./lib/msg');
const { getGroupAdmins } = require('./lib/functions');
const { File } = require('megajs');
const { commands, replyHandlers } = require('./command');

const app = express();
const port = process.env.PORT || 8000;

const prefix = '.';
const ownerNumber = [config.BOT_OWNER];
const credsPath = path.join(__dirname, '/auth_info_baileys/creds.json');

async function ensureSessionFile() {
  if (!fs.existsSync(credsPath)) {
    if (!config.SESSION_ID) {
      console.error('❌ SESSION_ID missing.');
      process.exit(1);
    }

    console.log("🔄 Downloading session...");

    const filer = File.fromURL(`https://mega.nz/file/${config.SESSION_ID}`);

    filer.download((err, data) => {
      if (err) {
        console.error("❌ Session download failed:", err);
        process.exit(1);
      }

      fs.mkdirSync(path.join(__dirname, '/auth_info_baileys/'), { recursive: true });
      fs.writeFileSync(credsPath, data);

      console.log("✅ Session ready. Starting VIMA-MD...");
      setTimeout(connectToWA, 2000);
    });
  } else {
    setTimeout(connectToWA, 1000);
  }
}

async function connectToWA() {
  console.log("Connecting VIMA-MD 🚀...");

  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '/auth_info_baileys/'));
  const { version } = await fetchLatestBaileysVersion();

  const vima = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    auth: state,
    version,
    syncFullHistory: true,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
  });

  vima.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        console.log("♻️ Reconnecting...");
        connectToWA();
      }
    }

    if (connection === 'open') {
      console.log('✅ VIMA-MD connected');

      const msg = `VIMA-MD connected ✅\n\nPREFIX: ${prefix}`;
      await vima.sendMessage(ownerNumber[0] + "@s.whatsapp.net", {
        image: { url: config.ALIVE_IMG },
        caption: msg
      });

      if (fs.existsSync("./plugins/")) {
        fs.readdirSync("./plugins/").forEach((plugin) => {
          if (plugin.endsWith(".js")) {
            require(`./plugins/${plugin}`);
          }
        });
      }
    }
  });

  vima.ev.on('creds.update', saveCreds);

  vima.ev.on('messages.upsert', async ({ messages }) => {
    const mek = messages[0];
    if (!mek?.message) return;

    mek.message = getContentType(mek.message) === 'ephemeralMessage'
      ? mek.message.ephemeralMessage.message
      : mek.message;

    if (mek.key.remoteJid === 'status@broadcast') return;

    const m = sms(vima, mek);
    const type = getContentType(mek.message);
    const from = mek.key.remoteJid;

    const body =
      type === 'conversation'
        ? mek.message.conversation
        : mek.message[type]?.text || mek.message[type]?.caption || '';

    const isCmd = body.startsWith(prefix);
    const commandName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : '';
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(' ');

    const sender = mek.key.fromMe ? vima.user.id : (mek.key.participant || mek.key.remoteJid);
    const senderNumber = sender.split('@')[0];
    const isGroup = from.endsWith('@g.us');
    const botNumber = vima.user.id.split(':')[0];
    const pushname = mek.pushName || 'User';
    const isMe = botNumber.includes(senderNumber);
    const isOwner = ownerNumber.includes(senderNumber) || isMe;
    const botNumber2 = await jidNormalizedUser(vima.user.id);

    const groupMetadata = isGroup ? await vima.groupMetadata(from).catch(() => {}) : {};
    const participants = isGroup ? groupMetadata.participants || [] : [];
    const groupAdmins = isGroup ? getGroupAdmins(participants) : [];
    const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;
    const isAdmins = isGroup ? groupAdmins.includes(sender) : false;

    const reply = (text) => vima.sendMessage(from, { text }, { quoted: mek });

    if (isCmd) {
      const cmd = commands.find(c =>
        c.pattern === commandName || (c.alias && c.alias.includes(commandName))
      );

      if (cmd) {
        try {
          await cmd.function(vima, mek, m, {
            from, body, command: commandName, args, q,
            isGroup, sender, senderNumber, pushname,
            isOwner, groupMetadata, participants,
            isBotAdmins, isAdmins, reply,
          });
        } catch (e) {
          console.error("[COMMAND ERROR]", e);
        }
      }
    }

    for (const handler of replyHandlers) {
      if (handler.filter(body, { sender, message: mek })) {
        try {
          await handler.function(vima, mek, m, { from, body, sender, reply });
          break;
        } catch (e) {
          console.log("Reply handler error:", e);
        }
      }
    }
  });
}

ensureSessionFile();

app.get("/", (req, res) => {
  res.send("VIMA-MD running ✅");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
