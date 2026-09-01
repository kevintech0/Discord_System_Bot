const ms = require("ms");

module.exports = {
  name: "guildMemberAdd",

  /**
   * @param {import("discord.js").GuildMember} member
   */
  run: async (client, member) => {
    if (!member.guild || member.user.bot) return;

    const settings = [
      // {
      //   channelId: "",
      //   message: "",
      //   time: "1s",
      // }
    ];

    for (const automention of settings) {
      const channel = member.guild.channels.cache.get(automention.channelId);
      if (!channel) continue;

      try {
        const sentMessage = await channel.send({
          content: `${automention.message}\n${member}`,
        });

        setTimeout(() => {
          sentMessage.delete().catch(() => null);
        }, ms(automention.time));
      } catch (err) {
        console.error(`Failed to send message in ${channel.id}`, err);
      }
    }
  },
};
