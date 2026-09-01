const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const ticketSchema = require("../../Database/tickets");

module.exports = {
  name: "interactionCreate",

  /**
   * @param {import("discord.js").Interaction} interaction
   * @param {import("discord.js").Client} client
   */

  run: async (client, interaction) => {
    if (interaction.isButton() && interaction.customId === "closeTicket") {
      let ticketData = await ticketSchema.findOne({
        channelId: interaction.channel.id,
      });

      if (!ticketData) {
        return interaction.reply({
          content: `**${client.emoji.failed} The ticket will not be found.**`,
          ephemeral: true,
        });
      }

      if (ticketData.status == "Closed") {
        return interaction.reply({
          content: `> **Warning:** ticket already closed`,
          ephemeral: true,
        });
      }

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("confirmClose")
          .setLabel("Close")
          .setEmoji("<:lock:1431075733471498320>")
          .setStyle(4),
        new ButtonBuilder()
          .setCustomId("cancelClose")
          .setLabel("Cancel")
          .setEmoji(client.emoji.failed)
          .setStyle(2)
      );

      await interaction.reply({
        content: "Are you sure you would like to close this ticket?",
        components: [row],
      });
    }
  },
};
