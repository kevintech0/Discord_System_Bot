const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const giveawaysModel = require("../../Database/giveaways");

// خريطة مؤقتة لتجميع التحديثات
const giveawayUpdateQueue = new Map();

module.exports = {
  name: "interactionCreate",

  /**
   * @param {import('discord.js').Client} client
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    if (!interaction.isButton() || interaction.customId !== "joinGiv") return;

    const { guild, user, message } = interaction;

    const updated = await giveawaysModel.findOneAndUpdate(
      {
        guildId: guild.id,
        givId: message.id,
        givUsers: { $ne: user.id },
      },
      { $addToSet: { givUsers: user.id } },
      { new: true }
    );

    if (!updated) {
      return interaction.reply({
        content: `**${client.emoji?.error} You have already entered this giveaway!**`,
        ephemeral: true,
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("leaveGivBut")
              .setLabel("Leave Giveaway")
              .setStyle(4)
          ),
        ],
      });
    }

    await interaction.deferUpdate();

    if (!giveawayUpdateQueue.has(message.id)) {
      giveawayUpdateQueue.set(message.id, {
        guildId: guild.id,
        timeout: null,
      });
    }

    const queueItem = giveawayUpdateQueue.get(message.id);

    if (!queueItem.timeout) {
      queueItem.timeout = setTimeout(async () => {
        try {
          const latestData = await giveawaysModel.findOne({
            guildId: queueItem.guildId,
            givId: message.id,
          });
          if (!latestData) return;

          const currentEntries = latestData.givUsers.length;
          const oldEmbed = message.embeds[0];
          if (!oldEmbed) return;

          const newEmbed = EmbedBuilder.from(oldEmbed).setDescription(
            oldEmbed.description.replace(
              /Entries: \*\*\d+\*\*/,
              `Entries: **${currentEntries}**`
            )
          );

          await message.edit({ embeds: [newEmbed] }).catch(() => {});
        } catch (err) {
          console.error("Batch update error:", err);
        } finally {
          giveawayUpdateQueue.delete(message.id);
        }
      }, 1000);
    }
  },
};
