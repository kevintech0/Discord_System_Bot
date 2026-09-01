const { EmbedBuilder } = require("discord.js");
const giveawaysModel = require("../../Database/giveaways");

const giveawayUpdateQueue = new Map();

module.exports = {
  name: "interactionCreate",

  /**
   * @param { import("discord.js").Client } client
   * @param { import("discord.js").ButtonInteraction } interaction
   */
  run: async (client, interaction) => {
    if (!interaction.isButton() || interaction.customId !== "leaveGivBut")
      return;

    const { guild, user, channel, message } = interaction;

    const givData = await giveawaysModel.findOneAndUpdate(
      {
        guildId: guild.id,
        givUsers: user.id,
      },
      {
        $pull: { givUsers: user.id },
      },
      { new: true }
    );

    if (!givData) {
      return interaction.reply({
        content: `**${client.emoji.failed} You are not part of this giveaway!**`,
        ephemeral: true,
      });
    }

    const givMsg = await channel.messages.fetch(givData.givId).catch(() => null);
    if (!givMsg)
      return interaction.reply({
        content: `**${client.emoji.error} Giveaway message not found**`,
        ephemeral: true,
      });

    await interaction.deferUpdate();

    if (!giveawayUpdateQueue.has(givMsg.id)) {
      giveawayUpdateQueue.set(givMsg.id, {
        guildId: guild.id,
        timeout: null,
      });
    }

    const queueItem = giveawayUpdateQueue.get(givMsg.id);

    if (!queueItem.timeout) {
      queueItem.timeout = setTimeout(async () => {
        try {
          const latestData = await giveawaysModel.findOne({
            guildId: queueItem.guildId,
            givId: givMsg.id,
          });
          if (!latestData) return;

          const currentEntries = latestData.givUsers.length;
          const oldEmbed = givMsg.embeds[0];
          if (!oldEmbed) return;

          const newEmbed = EmbedBuilder.from(oldEmbed).setDescription(
            oldEmbed.description.replace(
              /Entries: \*\*\d+\*\*/,
              `Entries: **${currentEntries}**`
            )
          );

          await givMsg.edit({ embeds: [newEmbed] }).catch(() => {});
        } catch (err) {
          console.error("Batch update (leave) error:", err);
        } finally {
          giveawayUpdateQueue.delete(givMsg.id);
        }
      }, 1000);
    }

    await interaction.editReply({
      content: `**<:n_giveaways:1431085230583844906> You have successfully left the giveaway!**`,
      components: []
    });
  },
};