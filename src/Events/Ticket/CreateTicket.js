const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { createTicket, getTags } = require("../../Utils/Functions");

module.exports = {
  name: "interactionCreate",

  /**
   *
   * @param {import("discord.js").Client} client
   * @param {import("discord.js").StringSelectMenuInteraction} interaction
   */

  run: async (client, interaction) => {
    let { customId, guild, values } = interaction;
    if (!interaction.isStringSelectMenu()) return;

    if (customId === "ticketType") {
      const type = values[0];
      if (type === "Developer") {
        let tags = getTags(
          guild,
          "1424177779490033736",
          "1429111595958669312",
          ["Graphic Designer", "Verified Seller", "Staff", "Trial Staff"],
          "Name"
        );

        if (!tags.length) {
          return interaction.reply({
            content: `**${client.emoji.failed} No roles were found between the specified roles.**`,
            flags: [64],
          });
        }

        const devMenu = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("developerCategory")
            .setPlaceholder("Select a developer category")
            .addOptions(
              tags.map((role) => ({
                label: role.name,
                value: role.id,
                emoji: "💻",
                description: `Request related to ${role.name.toLowerCase()}`,
              }))
            )
        );

        return interaction.reply({
          components: [devMenu],
          flags: [64],
        });
      }

      return createTicket(interaction, { name: type, section: type });
    }

    if (customId === "developerCategory") {
      const roleId = values[0];
      const role = guild.roles.cache.get(roleId);

      const typeName = role ? role.name : "Unknown";
      if (role.members.size === 0)
        return interaction.update({
          content: `**${client.emoji.failed} There are no sellers for [ ${typeName} ]**`,
        });

      await interaction.update({
        content: `Thank you for choosing **[ ${typeName} ]** category.\n-# ${client.emoji.loading} Creating your ticket...`,
        components: [],
      });

      setTimeout(() => {
        return createTicket(
          interaction,
          {
            name: typeName,
            section: "Developer",
          },
          roleId
        );
      }, 3000);
    }
  },
};
