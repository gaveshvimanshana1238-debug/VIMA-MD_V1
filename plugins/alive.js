const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "alive",
    desc: "Check if VIMA-MD is online.",
    category: "main",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, {
            image: { url: config.ALIVE_IMG },
            caption: config.ALIVE_MSG
        }, { quoted: mek });
    } catch (err) {
        console.error("Alive error:", err);
        reply("❌ Error sending alive message.");
    }
});
