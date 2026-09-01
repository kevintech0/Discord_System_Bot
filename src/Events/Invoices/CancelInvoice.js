const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const invoicesSchema = require("../../Database/invoices");

module.exports = {
  name: "interactionCreate",

  /**
   * @param {import("discord.js").ButtonInteraction} interaction
   * @param {import("discord.js").Client} client
   */
  run: async (client, interaction) => {
    const { guild, customId, message } = interaction;
    if (!interaction.isButton() || customId !== "cancelInvoice") return;

    const invoiceData = await invoicesSchema.findOne({
      guildId: guild.id,
      invoiceId: message.id,
    });

    if (!invoiceData)
      return interaction.reply({
        content: `${client.emoji.failed} **Invoice not found.**`,
        ephemeral: true,
      });

    const clientUser = guild.members.cache.get(invoiceData.clientId);
    const sellerUser = guild.members.cache.get(invoiceData.sellerId);
    if (!clientUser || !sellerUser)
      return interaction.reply({
        content: `${client.emoji.failed} **Client or seller not found.**`,
        ephemeral: true,
      });

    const embed = message.embeds[0];
    const newDescription = embed.description
      .split("\n")
      .map((line) =>
        line.includes("**Status:**")
          ? `> **Status:** ${client.emoji.failed} Cancelled`
          : line
      )
      .join("\n");

    const updatedEmbed = EmbedBuilder.from(embed)
      .setColor("#ff4444")
      .setDescription(newDescription)
      .setTimestamp();

    const updatedComponents = message.components.map(
      (row) =>
        new ActionRowBuilder({
          components: row.components.map((btn) =>
            ButtonBuilder.from(btn.data).setDisabled(true)
          ),
        })
    );

    await interaction.update({
      embeds: [updatedEmbed],
      components: updatedComponents,
    });

    await invoiceData.deleteOne();
  },
};
