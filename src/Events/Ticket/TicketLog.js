const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ticketLog",

  /**
   *
   * @param {import("discord.js").Client} client
   * @param {import("discord.js").GuildMember} member
   * @param {String} ticket
   * @param {String} action
   * @param {String} panelName
   * @returns
   */

  run: async (client, member, ticket, action, panelName) => {
    let channel = client.channels.cache.get(`1424177870196179056`);
    if (channel) {
      let embed = new EmbedBuilder()
        .setAuthor({
          name: member.user.username,
          iconURL: member.displayAvatarURL(),
        })
        .setColor(member.guild.members.me.displayHexColor)
        .addFields(
          {
            name: `Logged Info`,
            value: `Ticket: ${ticket}\nAction: ${action}`,
            inline: true,
          },
          {
            name: `Panel`,
            value: panelName,
            inline: true,
          }
        );

      await channel.send({ embeds: [embed] }).catch(() => null);
    }
  },
};
