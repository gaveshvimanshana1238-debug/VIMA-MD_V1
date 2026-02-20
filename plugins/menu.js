const { cmd, commands } = require("../command");

cmd(
  {
    pattern: "menu",
    desc: "Show all VIMA-MD commands",
    category: "main",
    filename: __filename,
  },
  async (conn, mek, m, { reply }) => {
    try {
      const categories = {};

      for (const command of commands) {
        if (!command.pattern) continue;

        const cat = command.category?.toLowerCase() || "other";

        if (!categories[cat]) categories[cat] = [];

        categories[cat].push({
          pattern: command.pattern,
          desc: command.desc || "No description",
        });
      }

      let menuText = `🤖 *VIMA-MD COMMAND MENU*\n`;

      for (const [cat, cmds] of Object.entries(categories)) {
        menuText += `\n📂 *${cat.toUpperCase()}*\n`;
        cmds.forEach(c => {
          menuText += `• .${c.pattern} — ${c.desc}\n`;
        });
      }

      await reply(menuText.trim());
    } catch (err) {
      console.error("Menu error:", err);
      reply("❌ Error generating menu.");
    }
  }
);
