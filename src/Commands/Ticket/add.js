const { EmbedBuilder } = require("discord.js");
const { isTicket } = require("../../Utils/Functions");

module.exports = {
  name: "add",
  description: "Add a user or role to a ticket",
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
    let userOrRole =
      message.mentions.members.first() ||
      message.mentions.roles.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.guild.roles.cache.get(args[0]);

    let ticketChannel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args[1]) ||
      message.channel;

    if (!userOrRole) {
      return message.reply({
        content: `Missing required option: [User/Role] (optional channel)`,
      });
    }

    const ticketData = await isTicket(ticketChannel, client, message);
    if (!ticketData) return;

    await ticketChannel.permissionOverwrites.edit(userOrRole.id, {
      ViewChannel: true,
      SendMessages: true,
    });

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(message.guild.members.me.displayHexColor)
          .setDescription(`${userOrRole} added to ticket ${ticketChannel}`),
      ],
    });
  },
};
