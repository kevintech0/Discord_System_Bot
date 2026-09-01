const { saveTranscript } = require("../../Utils/Functions");

module.exports = {
  name: "transcript",
  description: "Create a transcript of the current ticket",
  aliases: [],
  usage: "",
  args: false,
  permissions: {
    bot: ["ManageChannels"],
    user: ["ManageChannels"],
  },
  settings: {
    isOwner: false,
    isCooldown: 10,
  },

  /**
   * @param { import("discord.js").Message } message
   * @param { String } args
   * @param { import("discord.js").Client } client
   * @param { String } prefix
   */

  execute: async (message, client, args, prefix) => {
    await saveTranscript(message, client);
  },
};
