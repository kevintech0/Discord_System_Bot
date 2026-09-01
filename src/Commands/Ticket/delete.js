const { deleteTicket } = require("../../Utils/Functions");

module.exports = {
  name: "delete",
  description: "Delete the current ticket",
  aliases: [],
  usage: "",
  args: false,
  permissions: {
    bot: ["ManageChannels"],
    user: ["ManageChannels"],
  },
  settings: {
    isOwner: false,
    isCooldown: 0,
  },

  /**
   * @param { import("discord.js").Message } message
   * @param { String } args
   * @param { import("discord.js").Client } client
   * @param { String } prefix
   */

  execute: async (message, client, args, prefix) => {
    await deleteTicket(message, client);
  },
};
