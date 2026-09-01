const {
  ContainerBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  MediaGalleryItemBuilder,
} = require("discord.js");

module.exports = {
  name: "roles",
  description: "Send roles message",
  aliases: ["sr"],
  usage: "",
  args: false,
  permissions: {
    bot: [],
    user: [],
  },
  settings: {
    isOwner: true,
    isCooldown: 10,
  },

  /**
   * @param { import("discord.js").Message } message
   * @param { import("discord.js").Client } client
   * @param { String } args
   * @param { String } prefix
   */

  execute: async (message, client, args, prefix) => {
    const container = new ContainerBuilder()
      .setAccentColor(
        message.guild.members.me.displayHexColor !== "#000000"
          ? parseInt(
              message.guild.members.me.displayHexColor.replace("#", ""),
              16
            )
          : null
      )

      .addTextDisplayComponents((text) =>
        text.setContent(
          `**Choose the roles you want to get notified for:**\n- <:n_offer:1431066645912096909> Offers\n- <:n_giveaways:1431085230583844906> Giveaways\n- <:n_news:1431086760426999870> News`
        )
      )

      .addSeparatorComponents((separator) => separator)

      .addMediaGalleryComponents((gallery) =>
        gallery.addItems(
          new MediaGalleryItemBuilder()
            .setURL("https://i.ibb.co/1fV3Sh3Z/Nexode-N-Info.png")
            .setDescription("Nexode Roles")
        )
      )

      .addActionRowComponents((row) =>
        row.addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("mentionRolesMenu")
            .setPlaceholder("Select your preferred roles")
            .setMinValues(0)
            .setMaxValues(3)
            .addOptions(
              {
                label: "Offers",
                emoji: "<:n_offer:1431066645912096909>",
                value: "offers",
              },
              {
                label: "Giveaways",
                emoji: "<:n_giveaways:1431085230583844906>",
                value: "giveaways",
              },
              {
                label: "News",
                emoji: "<:n_news:1431086760426999870>",
                value: "news",
              }
            )
        )
      )

      .addSeparatorComponents((separator) => separator)

      .addActionRowComponents((row) =>
        row.addComponents(
          new ButtonBuilder()
            .setCustomId("addAllRolesBut")
            .setLabel("Get All Roles")
            .setEmoji(client.emoji.done)
            .setStyle(2),

          new ButtonBuilder()
            .setCustomId("removeAllRolesBut")
            .setLabel("Remove All Roles")
            .setEmoji(client.emoji?.failed)
            .setStyle(4)
        )
      );

    await message.channel.send({
      components: [container],
      flags: [32768],
    });
  },
};
