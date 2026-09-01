const { claimTicket } = require("../../Utils/Functions");

module.exports = {
  name: "claim",
  description: "Claim/Unclaim the current ticket",
  aliases: [],
  usage: "",
  args: false,
  permissions: {
    bot: ["ManageChannels"],
    user: ["ManageChannels"],
  },
  settings: {
    isOwner: false,
    deleteCmd: true,
    isCooldown: 10,
  },

  /**
   * @param { import("discord.js").Message } message
   * @param { String } args
   * @param { import("discord.js").Client } client
   * @param { String } prefix
   */

  execute: async (message, client, args, prefix) => {
    await claimTicket(message, client);
  },
};
