const {
  EmbedBuilder,
} = require("discord.js");
const invoiceSchema = require("../../Database/invoices");

module.exports = {
  name: "getinvoice",
  description: "Get an invoice by its ID",
  aliases: ["ginvoice", "findinvoice"],
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
    const guild = message.guild
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

  const itemsList = invoice.items
      .map(
        (i, idx) =>
          `**${idx + 1}. ${i.title}**\`\`\`${i.desc}\`\`\`\`\`\`Quantity: ${
            i.qty
          } × $${i.price.toFixed(2)} = $${(i.qty * i.price).toFixed(2)}\`\`\``
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor(guild.members.me.displayHexColor)
      .setAuthor({
        name: `${guild.name} — Invoice`,
        iconURL: guild.iconURL(),
      })
      .setThumbnail(guild.iconURL())
      .setDescription(
        `> <:order:1431075737330258002> **Seller:** <@${invoice.sellerId}>\n> <:manager:1431076465524342835> **Client:** <@${invoice.clientId}>\n> <:wallet:1431145445026955275> **Payment Method:** \`${invoice.paymentMethod}\`\n> <:n_status:1431145676057612359> **Status:** \`${invoice.status}\``
      )
      .addFields(
        {
          name: "<:n_invoice:1431066894789771334> Invoice Details",
          value: itemsList || "No items provided",
        },
        {
          name: "<:n_money:1431065792564166749> Payment Summary",
          value:
            `> **Subtotal:** $${invoice.subtotal}\n` +
            `> **Tax (${invoice.taxPercent}%):** $${invoice.taxAmount}\n` +
            `> **Middleman Fee (${invoice.middlemanFeePercent}%):** $${invoice.middlemanFeeAmount}\n\n`,
          inline: true,
        },
        {
          name: `<:n_doller:1431142740132892773> Payment Total`,
          value:
            `> **Total (Client Pays):** $${invoice.total}\n` +
            `> **Seller Receives:** $${invoice.sellerReceive}`,
          inline: true,
        }
      )

      await message.reply({embeds: [embed]})
  },
};
