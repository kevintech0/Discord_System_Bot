require("dotenv").config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  prefix: process.env.BOT_PREFIX || "?",
  ownersId: process.env.OWNER_IDS
    ? process.env.OWNER_IDS.split(",").map((id) => id.trim())
    : [],
  mongoDB: process.env.MONGODB_URI,
  errorLogsChannel: process.env.ERROR_LOGS_CHANNEL,
  emojis: {
    nexode: process.env.EMOJI_NEXODE || "💜",
    done: process.env.EMOJI_DONE || "✅",
    failed: process.env.EMOJI_FAILED || "❌",
    error: process.env.EMOJI_ERROR || "⚠️",
    loading: process.env.EMOJI_LOADING || "⏳",
    enabled: process.env.EMOJI_ENABLED || "✔️",
    disabled: process.env.EMOJI_DISABLED || "✖️",
    star: process.env.EMOJI_STAR || "⭐",
    link: process.env.EMOJI_LINK || "🔗",
  },
  ticketCategorys: {
    Developer: process.env.TICKET_CATEGORY_DEVELOPER,
    Designer: process.env.TICKET_CATEGORY_DESIGNER,
    Support: process.env.TICKET_CATEGORY_SUPPORT,
  },
};
