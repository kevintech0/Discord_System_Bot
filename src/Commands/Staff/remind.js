const { EmbedBuilder } = require("discord.js");
const ticketsSchema = require("../../Database/tickets");

module.exports = {
  name: "remind",
  description: "Ping a user who is not responding in the ticket",
  usage: "",
  aliases: ["rem"],
  examples: [],
  args: false,
  permissions: {
    user: [],
    bot: [],
  },
  settings: {
    isOwner: false,
    isStaff: true,
    isCooldown: 10,
  },

  /**
   * @param {import('discord.js').Message} message
   * @param {import('discord.js').Client} client
   * @param {string[]} args
   * @param {string} prefix
   */
  execute: async (message, client, args, prefix) => {
    let { guild, channel } = message;
    let ticketData = await ticketsSchema.findOne({
      channelId: channel.id,
    });

    if (!ticketData)
      return message.reply({
        content: `**${client.emoji.failed} This command can only be used inside a ticket channel**`,
      });

    let user = guild.members.cache.get(ticketData.userId);
    if (!user)
      return message.reply({
        content: `**${client.emoji.error} Please mention the user you want to remind.**`,
      });

    let embed = new EmbedBuilder()
      .setAuthor({
        name: `${message.guild.name} | Ticket Reminder`,
        iconURL: message.guild.iconURL(),
      })
      .setTitle("Ticket Follow-Up Reminder")
      .setColor(guild.members.me.displayHexColor)
      .setDescription(
        `Hello ${user}, we noticed you haven’t replied to this ticket yet!\nPlease check the conversation when possible <a:n_news:1430362358202765333>`
      )
            .addFields(
        {
          name: "<:ticket:1431122858662428752> Ticket ID",
          value: `\`${ticketData.ticketNumber}\``,
          inline: true,
        },
        {
          name: "<:categories:1431122860079972362> Type",
          value: `\`${ticketData.panelName}\``,
          inline: true,
        },
        {
          name: "<:n_time:1431067339465560186> Opened At",
          value: `<t:${Math.floor(ticketData.createdAt / 1000)}:F>`,
          inline: true,
        },
        {
          name: `${client.emoji.error} Reminder Note`,
          value:
          `\`\`\`Please reply soon to keep this ticket active.\nInactive tickets may be closed automatically after a certain time.\`\`\``,
        }
      )
      .setFooter({
        text: `Reminder sent by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    try {
      await user.send({ embeds: [embed] });
      await message.channel.send({
        content: `${client.emoji.done} Successfully reminded **${user.displayName}** in DMs.`,
      });
    } catch {
      await message.channel.send({
        content: `**${client.emoji.error} Couldn't send a DM to ${user}.**`,
      });
    }
  },
};
