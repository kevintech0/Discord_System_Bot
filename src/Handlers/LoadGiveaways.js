const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const giveawaysModel = require("../Database/giveaways");
const cron = require("node-cron");

module.exports = async (client) => {
  cron.schedule("*/10 * * * * *", async () => {
    try {
      let giveaway = await giveawaysModel.find({
        duration: { $lte: new Date() },
        givStatus: "Started",
      });
      if (!giveaway.length) return;

      await Promise.all(
        giveaway.map(async (giveaway) => {
          let channel = await client.channels
            .fetch(giveaway.chId)
            .catch(() => null);
          if (!channel) return;

          let giveawayMessage = await channel.messages
            .fetch(giveaway.givId)
            .catch(() => null);
          if (!giveawayMessage) return;

          let givEmbed = EmbedBuilder.from(giveawayMessage.embeds[0]);
          let newDesc = givEmbed.data.description
            .replace(/Winners: \*\*\d+\*\*/, `Winners:`)
            .replace("Ends", "Ended");

          if (giveaway.givUsers.length === 0) {
            await giveawayMessage.reply({
              content:
                "No valid entrants, so a winner could not be determined!",
            });
          } else {
            let winners = giveaway.givUsers
              .sort(() => Math.random() - 0.5)
              .slice(
                0,
                Math.min(giveaway.numberWinners, giveaway.givUsers.length)
              );

            newDesc = givEmbed.data.description
              .replace(
                /Winners: \*\*\d+\*\*/,
                `Winners: ${winners.map((w) => `<@${w}>`).join(", ")}`
              )
              .replace("Ends", "Ended");

            await giveawayMessage.reply({
              content: `Congratulations ${winners
                .map((w) => `<@${w}>`)
                .join(", ")}! You won the **${giveaway.prize}**`,
            });
          }

          await giveawayMessage.edit({
            embeds: [givEmbed.setDescription(newDesc)],
            components: [
              new ActionRowBuilder({
                components: [
                  new ButtonBuilder()
                    .setLabel("Giveaway Summary")
                    .setURL(
                      `https://discord.com/channels/${channel.guild.id}/${channel.id}/${giveawayMessage.id}`
                    )
                    .setStyle(5),
                ],
              }),
            ],
          });

          await giveawaysModel.updateOne(
            {
              givId: giveawayMessage.id,
            },
            {
              givStatus: "Ended",
            }
          );
        })
      );
    } catch (error) {
      console.error("Error processing giveaways:", error);
    }
  });
};
