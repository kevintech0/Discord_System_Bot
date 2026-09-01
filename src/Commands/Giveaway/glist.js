const giveawaysModel = require("../../Database/giveaways");
function formatTime(seconds) {
  const weeks = Math.floor(seconds / 604800);
  const days = Math.floor((seconds % 604800) / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let parts = [];
  if (weeks) parts.push(`**${weeks}** week${weeks > 1 ? "s" : ""}`);
  if (days) parts.push(`**${days}** day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`**${hours}** hour${hours > 1 ? "s" : ""}`);
  if (minutes) parts.push(`**${minutes}** minute${minutes > 1 ? "s" : ""}`);
  if (secs || parts.length === 0)
    parts.push(`**${secs}** second${secs > 1 ? "s" : ""}`);

  return parts.join(", ");
}

module.exports = {
  name: "glist",
  description: "Show active giveaways",
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
    let guild = message.guild
    let givData = await giveawaysModel.find({
      guildId: guild.id,
    });

    if (!givData)
      return message.reply({
        content: `**${client.emoji.failed} There are no giveaways currently running!**`,
      });

    let giveawayList = givData.map((giveaway) => {
      let remainingTime = Math.max(
        0,
        Math.floor((new Date(giveaway.duration) - Date.now()) / 1000)
      );

      return `[Giveaway](https://discord.com/channels/${guild.id}/${
        giveaway.chId
      }/${giveaway.givId}) | <#${giveaway.chId}> | **${
        giveaway.numberWinners
      }** winner(s) | Prize: **${giveaway.prize}** | Host: <@${
        giveaway.hostedby
      }> | Ends in ${formatTime(remainingTime)}`;
    });

    message.reply({
      content: `**Active Giveaways**\n\n${giveawayList.join("\n")}`,
    });
  },
};
