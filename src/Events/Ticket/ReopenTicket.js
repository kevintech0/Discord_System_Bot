const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const ticketSchema = require("../../Database/tickets");
const { renameTicket } = require("../../Utils/Functions");

module.exports = {
  name: "interactionCreate",

  /**
   * @param {import("discord.js").Interaction} interaction
   * @param {import("discord.js").Client} client
   */

  run: async (client, interaction) => {
    if (!interaction.isButton() || interaction.customId !== "reopenTicket")
      return;
    let { channel, guild, member } = interaction;

    await interaction.deferUpdate();
    await interaction.message.delete().catch(() => {});
    let ticketData = await ticketSchema.findOne({
      channelId: channel.id,
    });

    if (!ticketData) {
      return interaction.reply({
        content: `**${client.emoji.failed} The ticket will not be found.**`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(guild.members.me.displayHexColor)
      .setDescription(`Ticket Opened by ${member}`);
    ticketData.status = "Opened";
    await ticketData.save();

    await channel.send({ embeds: [embed] });
    client.emit(
      "ticketLog",
      member,
      channel.name,
      "Opened",
      ticketData.panelName
    );

    await renameTicket(
      interaction,
      client,
      channel,
      `closed-${ticketData.ticketNumber}`,
      false
    );

    const categoryId = client.config.ticketCategorys[ticketData.panelName] || null;
    const supportRoles = channel.permissionOverwrites.cache
      .filter(
        (perm) =>
          perm.type === 0 &&
          perm.deny.has("ViewChannel") &&
          perm.deny.has("SendMessages")
      )
      .map((perm) => perm.id);

    await channel
      .edit({
        parent: categoryId,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: ["ViewChannel", "SendMessages"],
          },
          {
            id: ticketData.userId,
            allow: ["ViewChannel", "SendMessages"],
          },
          ...supportRoles.map((roleId) => ({
            id: roleId,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          })),
        ],
      })
      .catch(() => null);
  },
};
