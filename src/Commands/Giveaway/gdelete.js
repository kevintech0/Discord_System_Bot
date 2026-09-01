const giveawaysModel = require("../../Database/giveaways");

module.exports = {
  name: "gdelete",
  description: "Delete a giveaway",
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
    let givId = args[0];
    if (!givId) {
      return message.reply({
        content: `**${client.emoji.failed} Please write a giveaway Id**`,
      });
    }

    let givData = await giveawaysModel.findOne({
      givId,
    });

    if (!givData)
      return message.reply({
        content: `${client.emoji.error} | could not convert \`${givId}\` to a message ID!`,
      });

    let channel = await client.channels.fetch(givData.chId).catch(() => null);
    if (!channel)
      return message.reply({
        content: `${client.emoji.error} could not find a giveaway with the ID \`${givId}\``,
      });

    let givMessage = await channel.messages
      .fetch(givData.givId)
      .catch(() => null);

    if (givMessage) {
      await givMessage.delete();
    }

    message.reply({
      content: `**${client.emoji.done} Successfully deleted giveaway ${givMessage.id}**`,
      ephemeral: true,
    });
    await givData.deleteOne();
  },
};
