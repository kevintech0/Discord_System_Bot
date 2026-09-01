const {
  ContainerBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  MediaGalleryItemBuilder,
} = require("discord.js");

module.exports = {
  name: "staffactions",
  description: "Send staff actions message",
  aliases: [],
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
          `Select what to manage — projects or socials. Use the buttons below for profile & offers!`
        )
      )

      .addMediaGalleryComponents((gallery) =>
        gallery.addItems(
          new MediaGalleryItemBuilder()
            .setURL("https://i.ibb.co/SX6JFJR0/Nexode-Actions-Info.png")
            .setDescription("Staff Actions")
        )
      )

      .addSeparatorComponents((separator) => separator)

      .addActionRowComponents((row) =>
        row.addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("staffActionsMenu")
            .setPlaceholder("Select the action")
            .addOptions(
              {
                label: "Add Project",
                description: "Showcase a new project in your portfolio.",
                emoji: "<:addProject:1431080992000708689>",
                value: "addProject",
              },
              {
                label: "Remove Project",
                description: "Remove an existing project from your portfolio.",
                emoji: "<:deleteProject:1431081001723101296>",
                value: "removeProject",
              },
              {
                label: "Add Social Media",
                description: "Link a new social media account to your profile.",
                emoji: "<:AddSocialMedia:1431080137889288212>",
                value: "addSocialMedia",
              },
              {
                label: "Remove Social Media",
                description: "Unlink a social media account from your profile.",
                emoji: '<:DeleteSocialMedia:1431080135783874571>',
                value: "removeSocialMedia",
              }
            )
        )
      )

      .addSeparatorComponents((separator) => separator)

      .addActionRowComponents((row) =>
        row.addComponents(
          new ButtonBuilder()
            .setCustomId("sendOffers")
            .setLabel("Send Offer")
            .setEmoji("<:n_offer:1431066645912096909>")
            .setStyle(2),

          new ButtonBuilder()
            .setCustomId("manageProfile")
            .setLabel("Manage Profile")
            .setEmoji("<:ManageProfile:1431075735044358174>")
            .setStyle(2),
        )
      );

    await message.channel.send({
      components: [container],
      flags: [32768],
    });
  },
};
