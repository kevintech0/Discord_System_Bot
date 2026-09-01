const { endGiveaway } = require("../../Utils/Functions");

module.exports = {
  name: "gend",
  description: "Ends a giveaway",
  aliases: [],
  examples: [],
  usage: "",
  args: false,
  permissions: {
    bot: ["ManageMessages"],
    user: ["ManageMessages"],
  },
  settings: {
    isOwner: false,
    isCooldown: 10,
  },

  /**
   * @param { import("discord.js").Message } message
   * @param { import("discord.js").Client } client
   * @param { String } args
   * @param { String } prefix
   */

  execute: async (message, client, args, prefix) => {
    let givId = args[0];
    if (!givId) {
      return message.reply({
        content: `**${client.emoji.failed} Please write a giveaway Id**`,
      });
    }

    await endGiveaway(givId, message, true);

    givId ? true : false
  },
};
