const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
  name: "doneLog",

  /**
   * @param {import("discord.js").Client} client
   * @param {import("discord.js").GuildMember} clientUser
   * @param {import("discord.js").GuildMember} sellerUser
   * @param {Object} invoiceData
   * @param {Object} sellerData
   */

  run: async (client, clientUser, sellerUser, invoiceData, sellerData) => {
    try {
      const logChannel = client.channels.cache.get("1424220716613505174");
      if (!logChannel) return;

      const itemsList = invoiceData.items
        .map((i, idx) => `**${idx + 1}. ${i.title}**\`\`\`${i.desc}\`\`\``)
        .join("\n");

      const doneEmbed = new EmbedBuilder()
        .setTitle("Project Completed Successfully!")
        .setColor("#9b4dff")
        .setThumbnail(sellerUser.displayAvatarURL())
        .setDescription(
          `> <:order:1431075737330258002> **Seller:** ${sellerUser} \`(${sellerUser.user.username})\`\n` +
            `> <:manager:1431076465524342835> **Client:** ${clientUser} \`(${clientUser.user.username})\`\n` +
            `> <:n_money:1431065792564166749> **Total:** \`${invoiceData.total}$\`\n` +
            `> <:wallet:1431145445026955275> **Payment Method:** \`${invoiceData.paymentMethod}\`\n` + 
            `## <:n_invoice:1431066894789771334> Project Summary\n${itemsList}`
        )
        .addFields(
          {
            name: "<:n_status:1431145676057612359> Invoice Status",
            value: `\`${invoiceData.status}\``,
            inline: true,
          },
          {
            name: "<:n_time:1431067339465560186> Completed On",
            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
            inline: true,
          },
          {
            name: "<:package:1431147455000477718> Seller’s Total Completed Orders",
            value: `\`${sellerData.totalOrders}\` ${client.emoji.done}`,
            inline: false,
          }
        )
        .setFooter({
          text: "Nexode Services | Order Completion",
          iconURL: client.user.avatarURL(),
        })

      await logChannel.send({ embeds: [doneEmbed] });
    } catch (err) {
      console.error(`[ERROR] | doneLog | ${err.stack}`);
    }
  },
};
