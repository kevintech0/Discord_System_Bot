module.exports = {
  name: "messageCreate",

  /**
   * @param {import("discord.js").Message} message
   */
  run: async (client, message) => {
    if (!message.guild || message.author.bot) return;

    const { channel } = message;

    const autoReactConfig = [
      {
        channelId: "1424177859827728465",
        emojis: [
          "<:n_like:1431066070390673518>",
          "<:n_dislike:1431066072001286217>",
          "<:n_heart:1431066073545052263>",
        ],
      },
    ];

    const config = autoReactConfig.find((r) => r.channelId === channel.id);
    if (!config || !config.emojis?.length) return;

    for (const emoji of config.emojis) {
      try {
        await message.react(emoji);
      } catch (err) {
        console.error(`e ${emoji}:`, err.message);
      }
    }
  },
};
