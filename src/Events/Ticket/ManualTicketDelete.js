const ticketSchema = require("../../Database/tickets");

module.exports = {
  name: "channelDelete",

  /**
   * @param {import("discord.js").Client} client
   * @param {import("discord.js").GuildChannel} channel
   */

  run: async (client, channel) => {
    if (!channel.guild || channel.type !== 0) return;

    const ticketData = await ticketSchema.findOne({ channelId: channel.id });

    if (ticketData) {
      await ticketData.deleteOne();
    }
  },
};
