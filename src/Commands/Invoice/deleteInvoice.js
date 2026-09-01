const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const invoiceSchema = require("../../Database/invoices");

module.exports = {
  name: "deleteinvoice",
  description: "Delete an invoice by its ID",
  aliases: ["delinvoice", "removeinvoice"],
  usage: "<invoice_id>",
  args: true,
  permissions: {
    bot: [],
    user: ["Administrator"],
  },
  settings: {
    isOwner: false,
    isCooldown: 5,
  },

  /**
   * @param { import("discord.js").Message } message
   * @param { import("discord.js").Client } client
   * @param { String[] } args
   * @param { String } prefix
   */

  execute: async (message, client, args, prefix) => {
    const invoiceId = args[0];
    if (!invoiceId)
      return message.reply({
        content: `${client.emoji.failed} Please provide the **invoice ID** you want to delete`,
      });

    const invoice = await invoiceSchema.findOne({ invoiceId });
    if (!invoice)
      return message.reply({
        content: `**${client.emoji.failed} No invoice found with the ID: \`${invoiceId}\`**`,
      });

    const embed = new EmbedBuilder()
      .setColor("#ffcc00")
      .setTitle(`${client.emoji.error} Confirm Invoice Deletion`)
      .setDescription(
        `> Are you sure you want to **delete** this invoice?\n\n` +
          `**<:right_arrow:1431097425975840788> Invoice ID:** \`${invoice._id}\`\n` +
          `**<:manager:1431076465524342835> Client:** <@${invoice.clientId}>\n` +
          `**<:order:1431075737330258002> Seller:** <@${invoice.sellerId}>\n` +
          `**<:n_money:1431065792564166749> Total:** \`${invoice.total}\`\n\n` +
          `> This action is **permanent** and cannot be undone.`
      )
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirmDelete")
        .setLabel("Confirm")
        .setEmoji(client.emoji.done)
        .setStyle(4),
      new ButtonBuilder()
        .setCustomId("cancelDelete")
        .setLabel("Cancel")
        .setEmoji(client.emoji.failed)
        .setStyle(2)
    );

    const msg = await message.reply({
      embeds: [embed],
      components: [buttons],
    });

    const collector = msg.createMessageComponentCollector({
      time: 20000,
      filter: (i) => i.user.id === message.author.id,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "confirmDelete") {
        await invoiceSchema.findByIdAndDelete(invoiceId);

        const success = new EmbedBuilder()
          .setColor("#00cc66") 
          .setTitle("Invoice Deleted Successfully")
          .setDescription(
            `> ${client.emoji.done} Invoice \`${invoiceId}\` has been deleted.\n> **Client:** <@${invoice.clientId}>`
          )
          .setTimestamp();

        await i.update({ embeds: [success], components: [] });
      } else if (i.customId === "cancelDelete") {
        await i.message.delete().catch(() => null);
      }
    });

    collector.on("end", async () => {
      if (msg.editable) msg.edit({ components: [] }).catch(() => null);
    });
  },
};
