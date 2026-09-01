const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const invoicesSchema = require("../../Database/invoices");
const sellerSchema = require("../../Database/sellers");

module.exports = {
  name: "interactionCreate",

  /**
   * @param {import("discord.js").ButtonInteraction} interaction
   * @param {import("discord.js").Client} client
   */
  run: async (client, interaction) => {
    const { guild, member, customId, message } = interaction;
    if (!interaction.isButton() || customId !== "markCompleted") return;

    const invoiceData = await invoicesSchema.findOne({
      guildId: guild.id,
      invoiceId: message.id,
    });

    if (!invoiceData)
      return interaction.reply({
        content: `${client.emoji.failed} **Invoice not found.**`,
        flags: [64],
      });
    const clientUser = guild.members.cache.get(invoiceData.clientId);
    const sellerUser = guild.members.cache.get(invoiceData.sellerId);

    if (sellerUser.id !== member.id)
      return interaction.reply({
        content: `**${client.emoji.failed} No No**`,
        flags: [64],
      });

    invoiceData.status = "Completed";
    await invoiceData.save();

    const sellerData = await sellerSchema.findOneAndUpdate(
      { guildId: guild.id, sellerId: sellerUser.id },
      { $inc: { totalOrders: 1 } },
      { new: true }
    );

    client.emit("doneLog", clientUser, sellerUser, invoiceData, sellerData);

    const embed = message.embeds[0];
    const newDescription = embed.description
      .split("\n")
      .map((line) =>
        line.includes("**Status:**")
          ? `> **Status:** Completed ${client.emoji.done}`
          : line
      )
      .join("\n");

    const updatedEmbed = EmbedBuilder.from(embed)
      .setDescription(newDescription)
      .setTimestamp();

    const sellerRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`rateSeller_${sellerUser.id}`)
        .setLabel("Rate Seller")
        .setEmoji(client.emoji.star)
        .setStyle(3)
    );

    await interaction.update({
      embeds: [updatedEmbed],
      components: [sellerRow],
    }).catch(() => null);
  },
};
