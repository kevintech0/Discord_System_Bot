const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const invoiceSchema = require("../../Database/invoices");

module.exports = {
  name: "createinvoice",
  description: "Create a new invoice",
  aliases: ["cinv", "createinv"],
  examples: [],
  usage: "",
  args: false,
  permissions: {
    bot: [],
    user: [],
  },
  settings: {
    isOwner: false,
    isStaff: true,
    isCooldown: 10,
  },

  /**
   * @param { import("discord.js").Message } message
   * @param { import("discord.js").Client } client
   * @param { String } args
   * @param { String } prefix
   */

  execute: async (message, client, args, prefix) => {
    const { guild, author } = message;
    let sellerId = args[0];
    let clientId = args[1];
    if (!sellerId)
      return message.reply({
        content: `${client.emoji.failed} **I can't find this seller Id**`,
      });
      
    if (!clientId)
      return message.reply({
        content: `${client.emoji.failed} **I can't find this client Id**`,
      });

    const paymentMethod = args[2];
    const taxPercent = Number(args[3]) || 0;
    const middlemanPercent = Number(args[4]) || 0;

    if (!paymentMethod)
      return message.reply({
        content: `**${client.emoji.failed} No payment method**`,
      });

    const askMsg = await message.reply({
      content: ` **Enter the items (one per line) in this format:**\n\`Title | Description | Qty | Price\`\n\nExample:
\`\`\`
Website Design | Landing Page | 1 | 150
Logo Design | Simple logo | 1 | 50
\`\`\`
Type **done** to cancel.`,
    });

    const collected = await message.channel
      .awaitMessages({
        filter: (m) => m.author.id === author.id,
        max: 1,
        time: 5 * 60_000,
        errors: ["time"],
      })
      .catch(() => null);

    if (!collected || !collected.first()) {
      await askMsg.delete().catch(() => {});
      return message.reply({
        content: `**${client.emoji.failed} No input received, cancelled.**`,
      });
    }

    const text = collected.first().content.trim();
    await collected
      .first()
      .delete()
      .catch(() => {});
    await askMsg.delete().catch(() => {});

    if (text.toLowerCase() === "done")
      return message.reply({
        content: `**${client.emoji.failed} Invoice creation cancelled.**`,
      });

    const items = text
      .split("\n")
      .map((line) => line.trim())
      .filter((l) => l)
      .map((line) => {
        const parts = line.split("|").map((p) => p.trim());
        return {
          title: parts[0] || "Untitled",
          desc: parts[1] || "No description",
          qty: Number(parts[2]) || 1,
          price: Number(parts[3]) || 0,
        };
      });

    if (!items.length)
      return message.reply({
        content: `**${client.emoji.failed} You must enter at least one valid item.**`,
      });

    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const taxAmount = (subtotal * taxPercent) / 100;
    const middlemanFeeAmount = (subtotal * middlemanPercent) / 100;
    const total = subtotal + taxAmount;
    const sellerReceive = subtotal - middlemanFeeAmount;
    const itemsList = items
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
        `> <:order:1431075737330258002> **Seller:** <@${sellerId}>\n> <:manager:1431076465524342835> **Client:** <@${clientId}>\n> <:wallet:1431145445026955275> **Payment Method:** \`${paymentMethod}\`\n> <:n_status:1431145676057612359> **Status:** \`Pending\``
      )
      .addFields(
        {
          name: "<:n_invoice:1431066894789771334> Invoice Details",
          value: itemsList || "No items provided",
        },
        {
          name: "<:n_money:1431065792564166749> Payment Summary",
          value:
            `> **Subtotal:** $${subtotal.toFixed(2)}\n` +
            `> **Tax (${taxPercent}%):** $${taxAmount.toFixed(2)}\n` +
            `> **Middleman Fee (${middlemanPercent}%):** $${middlemanFeeAmount.toFixed(
              2
            )}\n\n`,
          inline: true,
        },
        {
          name: `<:n_doller:1431142740132892773> Payment Total`,
          value:
            `> **Total (Client Pays):** $${total.toFixed(2)}\n` +
            `> **Seller Receives:** $${sellerReceive.toFixed(2)}`,
          inline: true,
        }
      )
      .setFooter({
        text: `Created by ${author.username}`,
        iconURL: author.displayAvatarURL(),
      })
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("markCompleted")
        .setLabel("Mark as Completed")
        .setEmoji(client.emoji.done)
        .setStyle(2),

      new ButtonBuilder()
        .setCustomId("markPaid")
        .setLabel("Mark as Paid")
        .setEmoji("1431116375228940319")
        .setStyle(3),

      new ButtonBuilder()
        .setCustomId("cancelInvoice")
        .setLabel("Cancel Invoice")
        .setEmoji(client.emoji.failed)
        .setStyle(4)
    );

    let msg = await message
      .reply({ embeds: [embed], components: [buttons] })
      .catch(() => null);
    msg.pin();

    await invoiceSchema.create({
      guildId: guild.id,
      invoiceId: msg.id,
      clientId,
      sellerId,
      items,
      taxPercent,
      middlemanFeePercent: middlemanPercent,
      paymentMethod,
    });
  },
};
