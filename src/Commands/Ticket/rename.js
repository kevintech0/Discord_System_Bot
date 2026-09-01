const { renameTicket, isTicket } = require("../../Utils/Functions");

module.exports = {
  name: "rename",
  description: "Rename the current ticket channel",
  aliases: [],
  usage: "[name]",
  args: false,
  permissions: {
    bot: ["ManageChannels"],
    user: ["ManageChannels"],
  },
  settings: {
    isOwner: false,
    deleteCmd: true,
    isCooldown: 0,
  },

  /**
   * @param { import("discord.js").Message } message
   * @param { import("discord.js").Client } client 
   * @param { String } args
   * @param { String } prefix
   */

  execute: async (message, client, args, prefix) => {
    let newName = args.join(" ");
    let ticketChannel = message.channel;
    const ticketData = await isTicket(
      ticketChannel,
      client,
      message
    );
    if (!ticketData) return;

    if (!newName) {
      await renameTicket(
        message,
        client,
        ticketChannel,
        `${ticketData.panelName}-${ticketData.ticketNumber}`,
        true
      );
    } else {
      await renameTicket(message, client, ticketChannel, newName, true);
    }

    client.emit(
      "ticketLog",
      message.member,
      ticketChannel.name,
      "Renamed",
      ticketData.panelName
    );
  },
};
