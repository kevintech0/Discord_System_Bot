const { EmbedBuilder } = require("discord.js");
const { isValidColor } = require("../../Utils/Functions");

module.exports = {
  name: "interactionCreate",

  /**
   * @param {import("discord.js").ModalSubmitInteraction} interaction
   * @param {import("discord.js").Client} client
   */

  run: async (client, interaction) => {
    if (!interaction.isModalSubmit()) return;
    const { customId, fields, message } = interaction;
    const embed = EmbedBuilder.from(message.embeds[0]);
    if (!embed) return;
    const isValidURL = (url) => url?.startsWith("https://");

    const modalHandlers = {
      embedAuthorModal: () => {
        const name = fields.getTextInputValue("authorNameInput");
        const icon = fields.getTextInputValue("authorIconInput");

        if (icon && !isValidURL(icon)) {
          return replyError(
            `The image link is invalid. Please enter a correct link.`
          );
        }

        embed.setAuthor({ name });
        if (icon) embed.data.author.icon_url = icon;
      },

      embedTitleModal: () => {
        const title = fields.getTextInputValue("embedTitleInput");
        if (title.length > 256) {
          return replyError(`Big title`);
        }
        embed.setTitle(title);
      },

      embedColorModal: () => {
        const input = fields.getTextInputValue("embedColorInput");
        const colorFormatted =
          input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();

        const isNamedColor = allowedColors.includes(colorFormatted);
        const isHexColor = isValidColor(input);

        if (!isNamedColor && !isHexColor) {
          return replyError("Invalid color");
        }

        embed.setColor(colorFormatted);
      },

      embedThumbnailModal: () => {
        const url = fields.getTextInputValue("embedThumbnailInput");
        if (!isValidURL(url)) return replyError("The link is invalid");
        embed.setThumbnail(url);
      },

      embedImageModal: () => {
        const url = fields.getTextInputValue("embedImageInput");
        if (!isValidURL(url)) return replyError("The link is invalid");
        embed.setImage(url);
      },

      embedFooterModal: () => {
        const text = fields.getTextInputValue("footerNameInput");
        const icon = fields.getTextInputValue("footerIconInput");

        if (icon && !isValidURL(icon)) {
          return replyError(
            "The image link is invalid. Please enter a correct link."
          );
        }

        embed.setFooter({ text });
        if (icon) embed.data.footer.icon_url = icon;
      },

      embedURLModal: () => {
        const url = fields.getTextInputValue("embedURLInput");
        if (!isValidURL(url)) return replyError("The link is invalid");
        embed.setURL(url);
      },

      embedFieldsModal: () => {
        const name = fields.getTextInputValue("fieldNameInput");
        const value = fields.getTextInputValue("fieldValueInput");
        const inlineInput = fields
          .getTextInputValue("fieldInlineInput")
          .toLowerCase();

        const inline =
          inlineInput === "true"
            ? true
            : inlineInput === "false"
            ? false
            : inlineInput
            ? null
            : undefined;

        if (inline === null) {
          return replyError(`Value is invalid, must be "true" or "false"`);
        }

        if (embed.data.fields?.length >= 25) {
          return replyError(`The number of fields is greater than 25.`);
        }

        embed.addFields({ name, value, inline });
      },
    };

    const allowedColors = [
      "Default",
      "Aqua",
      "DarkAqua",
      "Green",
      "DarkGreen",
      "Blue",
      "DarkBlue",
      "Purple",
      "DarkPurple",
      "LuminousVividPink",
      "DarkVividPink",
      "Gold",
      "DarkGold",
      "Orange",
      "DarkOrange",
      "Red",
      "DarkRed",
      "Grey",
      "DarkGrey",
      "DarkerGrey",
      "LightGrey",
      "Navy",
      "DarkNavy",
      "Yellow",
      "White (Default)",
      "Greyple",
      "DarkButNotBlack",
      "NotQuiteBlack",
      "Blurple",
      "Fuchsia",
    ];

    const replyError = async (msg) => {
      await interaction.reply({
        content: `**${client.emoji.failed} ${msg}**`,
        ephemeral: true,
      });
      return true;
    };

    const handler = modalHandlers[customId];
    if (handler) {
      const failed = await handler();
      if (!failed) {
        await message.edit({ embeds: [embed] }).catch(() => null);
        await interaction.deferUpdate().catch(() => null);
      }
    }
  },
};
