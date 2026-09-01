const { EmbedBuilder } = require("discord.js");
const { buttonPages } = require("../../Utils/Functions");
const invoiceSchema = require("../../Database/invoices");

module.exports = {
  name: "listinvoices",
  description: "View all invoices from the database",
  aliases: ["invoices", "invlist"],
  usage: "",
  args: false,
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
    let { guild, mentions } = message;
    let targetUser =
      mentions.members.first() || client.users.cache.get(args[0]);

    const statusArg = args[1]?.toLowerCase();
    const validStatuses = ["paid", "pending", "completed"]; 

    let query = { guildId: guild.id };
    if (targetUser) {
      query.$or = [{ clientId: targetUser.id }, { sellerId: targetUser.id }];
    }

    if (statusArg && validStatuses.includes(statusArg)) {
      query.status = statusArg;
    }

    const invoices = await invoiceSchema.find(query);

    if (invoices.length == 0 || !invoices) {
      return message.reply({
        content: `**${client.emoji.failed} There are no added to the invoices system**`,
      });
    }

    let perPage = 10;
    let pages = [];
    for (let i = 0; i < invoices.length; i += perPage) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
        .setTitle(`(${invoices.length}) Invoices List`)
        .setColor(guild.members.me.displayHexColor);

      let currentPage = invoices.slice(i, i + perPage);
      currentPage.forEach((inv, i) => {
        embed.addFields({
          name: `Invoice #${i + 1}`,
          value:
            `**<:right_arrow:1431097425975840788> Id:** \`${inv.invoiceId}\`\n` +
            `**<:manager:1431076465524342835> Client:** <@${inv.clientId}>\n` +
            `**<:order:1431075737330258002> Seller:** <@${inv.sellerId}>\n` +
            `**<:n_status:1431145676057612359> Status:** \`${inv.status}\`\n` +
            `**<:wallet:1431145445026955275> Payment:** \`${inv.paymentMethod}\`\n` +
            `**<:n_money:1431065792564166749> Total:** \`${inv.total}\`\n` +
            `**<:n_time:1431067339465560186> Date:** <t:${Math.floor(inv.date.getTime() / 1000)}:R>`,
        });
      });

      pages.push(embed);
    }

    await buttonPages(message, pages, 120000, false);
  },
};
