const {
  ActionRowBuilder,
  TextInputBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const sellerSchema = require("../../Database/sellers");

module.exports = {
  name: "interactionCreate",

  /**
   * @param {import("discord.js").ButtonInteraction} interaction
   * @param {import("discord.js").Client} client
   */

  run: async (client, interaction) => {
    const { customId, member, fields, guild, message } = interaction;
    if (interaction.isButton() && customId.startsWith("rateSeller")) {
      let sellerId = customId.split("_")[1];
      let lines = message.embeds[0].description.split("\n");
      let clientLine = lines.find((line) => line.includes("Client"));
      let clientId = clientLine.match(/<@!?(\d+)>/)[1];
      let sellerData = await sellerSchema.findOne({
        guildId: guild.id,
        sellerId,
      });

      if (!sellerData)
        return interaction.reply({
          content: `${client.emoji.failed} No portfolio found for **@${member.user.username}**.`,
          flags: [64],
        });

      if (clientId !== member.id)
        return interaction.reply({
          content: `**${client.emoji.failed} [ <@${clientId}> ] must provide a rate saller**`,
          flags: [64],
        });

      let rowMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`selectRate_${sellerId}`)
          .setPlaceholder("Select your rating")
          .addOptions(
            [1, 2, 3, 4, 5].map((num) => ({
              label: `${num} Star${num > 1 ? "s" : ""}`,
              value: num.toString(),
              emoji: client.emoji.star,
            }))
          )
      );

      let msg = await interaction
        .reply({
          components: [rowMenu],
          flags: [64],
          fetchReply: true,
        })
        .catch(() => {});

      let c = msg.createMessageComponentCollector({
        componentType: 3,
        filter: (i) => i.user.id === member.id,
      });
      c.on("collect", async (i) => {
        const sellerId = i.customId.split("_")[1];
        const rating = i.values[0];
        const sellerUser = await client.users.fetch(sellerId);

        let feedbackMsgRow = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(`feedbackMsgInput`)
            .setLabel("Write your feedback")
            .setStyle(2)
            .setPlaceholder("Tell us about your experience with the seller...")
        );

        const modal = new ModalBuilder()
          .setCustomId(`submitRate_${sellerId}_${rating}`)
          .setTitle(`Rate @${sellerUser.username}`)
          .addComponents(feedbackMsgRow);

        await i.showModal(modal).catch(() => {});
      });
    } else if (
      interaction.isModalSubmit() &&
      customId.startsWith("submitRate")
    ) {
      const [_, sellerId, rating] = customId.split("_");
      const feedback = fields.getTextInputValue("feedbackMsgInput");
      const sellerUser = await client.users.fetch(sellerId);

      const thankEmbed = new EmbedBuilder()
        .setColor(guild.members.me.displayHexColor)
        .setAuthor({
          name: "Customer Review",
          iconURL: member.displayAvatarURL(),
        })
        .setDescription(
          `<:n_heart:1431066073545052263> Thank you for rating **@${sellerUser.username}**!\n\n` +
            `${client.emoji.star} **Rating:** \`${rating}/5\`\n` +
            `<:feedback:1431134668710739998>**Feedback:**\n\`\`\`${feedback}\`\`\``
        )
        .setFooter({
          text: "Nexode Seller System • Your opinion matters!",
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.update({
        embeds: [thankEmbed],
        components: [],
      });

      const reviewLog = client.channels.cache.get("1362673863640485901");
      if (reviewLog) {
        const logEmbed = EmbedBuilder.from(thankEmbed)
          .setTitle("New Seller Review")
          .addFields(
            {
              name: "Seller",
              value: `${sellerUser}`,
              inline: true,
            },
            {
              name: "Customer",
              value: `${member}`,
              inline: true,
            }
          )
          .setTimestamp();

        let msg = await reviewLog.send({ embeds: [logEmbed] });
        msg.react("<:n_heart:1431066073545052263>");

        await sellerSchema.findOneAndUpdate(
          { sellerId },
          {
            $push: {
              reviews: { rating, feedback, clientId: member.id },
            },
          },
          { upsert: true }
        );
      }
    }
  },
};
