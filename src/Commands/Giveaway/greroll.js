const giveawaysModel = require("../../Database/giveaways");

module.exports = {
  name: "greroll",
  description: "Rerolls one new winner from a giveaway",
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
    let giveawayId = args[0];
    if (!giveawayId) {
      return message.reply({
        content: `**${client.emoji.failed} Please write a giveaway Id**`,
      });
    }

    let count = args[1] || 1;
    const giveaway = await giveawaysModel.findOne({ givId: giveawayId });
    if (!giveaway) {
      return message.reply({
        content: `**${client.emoji.failed} No giveaway found with ID: \`${giveawayId}\`**`,
      });
    }

    if (!giveaway.givUsers || giveaway.givUsers.length === 0) {
      return message.reply({
        content: `**${client.emoji.error} No valid entrants found, cannot reroll!**`,
      });
    }

    if (count > giveaway.givUsers.length) {
      return message.reply({
        content: `**${client.emoji.failed} The requested number of winners (\`${count}\`) exceeds the available participants (\`${giveaway.givUsers.length}\`).**`,
      });
    }

    const winners = giveaway.givUsers
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(count, giveaway.givUsers.length));

    await message.reply({
      content: `Congratulations ${winners
        .map((w) => `<@${w}>`)
        .join(", ")}! You are the new winner(s) for **${giveaway.prize}**.`,
    });
  },
};
