const {
  ActionRowBuilder,
  TextInputBuilder,
  ModalBuilder,
} = require("discord.js");
const sellersSchema = require("../../Database/sellers");

module.exports = {
  name: "interactionCreate",

  /**
   *
   * @param {import("discord.js").ButtonInteraction} interaction
   * @param {import("discord.js").Client} client
   */

  run: async (client, interaction) => {
    if (!interaction.isButton() || interaction.customId !== "manageProfile")
      return;

    let { guild, member } = interaction;
    let sellerData = await sellersSchema.findOne({
      guildId: guild.id,
      sellerId: member.id,
    });

    if (!sellerData)
      return interaction.reply({
        content: `${client.emoji.failed} No portfolio found for **@${member.user.username}**.`,
        flags: [64],
      });

    let sellerNameRow = new ActionRowBuilder({
      components: [
        new TextInputBuilder({
          customId: `sellerNameInput`,
          label: `Name`,
          value: sellerData.name,
          style: 1,
        }),
      ],
    });

    let sellerAgeRow = new ActionRowBuilder({
      components: [
        new TextInputBuilder({
          customId: `sellerAgeInput`,
          label: `Age`,
          value: sellerData.age,
          style: 1,
        }),
      ],
    });

    let sellerCountryRow = new ActionRowBuilder({
      components: [
        new TextInputBuilder({
          customId: `sellerCountryInput`,
          label: `Country`,
          value: sellerData.country,
          style: 1,
        }),
      ],
    });

    let statusRow = new ActionRowBuilder({
      components: [
        new TextInputBuilder({
          customId: `statusInput`,
          label: `Status`,
          placeholder: "Ex: Available, Unavailable",
          value: sellerData?.status,
          style: 1,
        }),
      ],
    });

    let modal = new ModalBuilder({
      customId: `manageProfileModal`,
      title: `Manage Profile`,
      components: [sellerNameRow, sellerAgeRow, sellerCountryRow, statusRow],
    });

    await interaction.showModal(modal);

    const submitted = await interaction
      .awaitModalSubmit({
        filter: (i) =>
          i.customId === "manageProfileModal" && i.user.id === member.id,
        time: 10 * 60 * 1000,
      })
      .catch(() => null);

    if (!submitted) return;

    let sellerName = submitted.fields.getTextInputValue("sellerNameInput");
    let sellerAge = submitted.fields.getTextInputValue("sellerAgeInput");
    let sellerCountry = submitted.fields.getTextInputValue("sellerCountryInput");
    let sellerStatus = submitted.fields.getTextInputValue("statusInput");
    let content;

    if (!/^\d+$/.test(sellerAge)) {
      return submitted.reply({
        content: `**${client.emoji.failed} Age must be in English numbers only!**`,
        ephemeral: true,
      });
    }

    let msg = await submitted.reply({
      content: `**${client.emoji.loading} Profile is editng, please wait...**`,
      flags: [64],
    });

    let updated = false;
    if (sellerName !== sellerData.name) {
      sellerData.name = sellerName;
      updated = true;
    }

    if (sellerAge !== sellerData.age) {
      sellerData.age = sellerAge;
      updated = true;
    }

    if (sellerCountry !== sellerData.country) {
      sellerData.country = sellerCountry;
      updated = true;
    }

    if (sellerStatus !== sellerData.status) {
      sellerData.status = sellerStatus;
      updated = true;
    }

    if (updated) {
      content = `**${client.emoji.done} Profile edited successfully**`;

      await sellerData.save();
    } else {
      content = `**${client.emoji.done} Profile successfully**`;
    }

    setTimeout(() => {
      msg.edit({ content, flags: [64] });
    }, 3000);
  },
};
