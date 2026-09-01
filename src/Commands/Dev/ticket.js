const {
  ContainerBuilder,
  StringSelectMenuBuilder,
  MediaGalleryItemBuilder,
} = require("discord.js");

module.exports = {
  name: "ticket",
  description: "Ticket command",
  aliases: [],
  examples: [""],
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
    const newContainer = new ContainerBuilder()
      .setAccentColor(
        message.guild.members.me.displayHexColor !== "#000000"
          ? parseInt(
              message.guild.members.me.displayHexColor.replace("#", ""),
              16
            )
          : null
      )
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(`<:Nexode_Purple:1430201537254133903> Welcome to **Nexode Services** Support System
Here you can contact our team to request a service, ask a question, or report an issue.

**<:n_error:1431067073886556242> Before opening:**
- Choose the correct department (Programming / Design / UI-UX / Other)
- Don’t open multiple tickets at once
- All deals must be made inside the ticket — not in DMs

<:n_rocket:1431072922738626590> Select the ticket type from the menu below to get started.`)
    )
      .addSeparatorComponents((separator) => separator)

      .addMediaGalleryComponents((gallery) =>
        gallery.addItems(
          new MediaGalleryItemBuilder()
            .setURL("https://i.ibb.co/mCrcrtVv/Nexode-Ticket-Info.png")
            .setDescription("Nexode Ticket")
        )
      )

      .addSeparatorComponents((separator) => separator)

      .addActionRowComponents((actionRow) =>
        actionRow.setComponents(
          new StringSelectMenuBuilder()
            .setCustomId("ticketType")
            .setPlaceholder("Select a ticket type")
            .addOptions(
              {
                label: "Developer Request",
                value: "Developer",
                emoji: "<:n_code:1431066609690083419>",
                description: `Create a ticket for developer request`,
              },
              {
                label: "Designer Request",
                value: "Designer",
                emoji: "<:n_paint:1431067229444898826>",
                description: `Create a ticket for designer request`,
              },
              {
                label: "Support Request",
                value: "Support",
                emoji: "<:n_support:1431067405525975131>",
                description: `Create a ticket for support request`,
              },

            )
        )
      );

    message.channel.send({ components: [newContainer], flags: [32768] });
  },
};
