const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const invoicesSchema = require("../../Database/invoices");

module.exports = {
  name: "interactionCreate",

  /**
   * @param {import("discord.js").ButtonInteraction} interaction
   * @param {import("discord.js").Client} client
   */
  run: async (client, interaction) => {
    const { guild, customId, channel, message } = interaction;
    if (!interaction.isButton() || customId !== "markPaid") return;

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
          ? `> **Status:** ${client.emoji.done} Paid`
          : line
      )
      .join("\n");

    const updatedEmbed = EmbedBuilder.from(embed)
      .setColor("#00cc66")
      .setDescription(newDescription)
      .setTimestamp();

    const updatedComponents = message.components.map(
      (row) =>
        new ActionRowBuilder({
          components: row.components.map((btn) =>
            ButtonBuilder.from(btn.data).setDisabled(
              !["markCompleted"].includes(btn.customId)
            )
          ),
        })
    );

    await interaction.update({
      embeds: [updatedEmbed],
      components: updatedComponents,
    });

    const userEmbed = new EmbedBuilder()
      .setColor("#00cc66")
      .setTitle("Invoice Paid Successfully!")
      .setDescription(
        `Hello ${clientUser.displayName},\nWe’ve successfully received your payment for the invoice from **${sellerUser.displayName}**.\nThank you for completing your payment promptly!`
      )
      .addFields(
        { name: "<:n_money:1431065792564166749> Amount", value: `\`${invoiceData.total}\`$`, inline: true },
        {
          name: "<:wallet:1431145445026955275> Payment Method",
          value: `\`${invoiceData.paymentMethod}\``,
          inline: true,
        },
        {
          name: "<:n_time:1431067339465560186> Date",
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
          inline: false,
        },
        { name: "<:n_status:1431145676057612359> Status", value: `${client.emoji.done} Paid`, inline: true }
      )
      .setFooter({
        text: "Nexode Payment System",
        iconURL: guild.iconURL(),
      })
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("tracking")
        .setLabel("Track your project (Soon)")
        .setEmoji("<:n_rocket:1431072922738626590>")
        .setDisabled(true)
        .setStyle(3),

      new ButtonBuilder()
        .setURL(
          `https://discord.com/channels/${guild.id}/${channel.id}/${message.id}`
        )
        .setLabel("My Invoice")
        .setEmoji(`<:n_invoice:1431066894789771334>`)
        .setStyle(5)
    );

    await clientUser
      .send({ embeds: [userEmbed], components: [buttons] })
      .catch(() => null);
  },
};
