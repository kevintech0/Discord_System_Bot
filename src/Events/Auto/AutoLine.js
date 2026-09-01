const { AttachmentBuilder, EmbedBuilder } = require("discord.js");
const path = require("path");

module.exports = {
  name: "messageCreate",

  /**
   * @param {import("discord.js").Message} message
   */
  run: async (client, message) => {
    if (!message.guild || message.author.bot) return;

    const { guild, channel } = message;

    const settings = {
      lineChannels: ["1424177859827728465"],
      imageURL: path.join(__dirname, "../../Assets/Nexode_Line.png"),
    };

    if (!settings.lineChannels.includes(channel.id)) return;

    try {
      const fileExtension = path.extname(new URL(settings.imageURL).pathname) || ".png";

      const attach = new AttachmentBuilder(settings.imageURL, {
        name: `autoline${fileExtension}`,
      });

      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(guild.members.me.displayHexColor)
            .setImage(`attachment://autoline${fileExtension}`),
        ],
        files: [attach],
      });
    } catch (err) {
      console.error("Error sending autoline image:", err);
    }
  },
};
