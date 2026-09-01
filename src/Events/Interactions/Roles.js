module.exports = {
  name: "interactionCreate",

  /**
   * @param {import("discord.js").Interaction} interaction
   * @param {import("discord.js").Client} client
   */
  run: async (client, interaction) => {
    const { guild, member, customId } = interaction;
    const roles = {
      offers: "1424177806811861092",
      giveaways: "1424177809684828300",
      news: "1424177810565496933",
    };

    try {
      const addOrRemoveRole = async (roleId) => {
        const role =
          guild.roles.cache.get(roleId) || (await guild.roles.fetch(roleId));
        if (!role) return;

        if (member.roles.cache.has(role.id)) {
          await member.roles.remove(role.id);
          return `Removed ${role.name}`;
        } else {
          await member.roles.add(role.id);
          return `Added ${role.name}`;
        }
      };

      const addAllRoles = async () => {
        await Promise.all(
          Object.values(roles).map((id) => member.roles.add(id))
        );
        return `**${client.emoji.done} Added all mention roles**`;
      };

      const removeAllRoles = async () => {
        await Promise.all(
          Object.values(roles).map((id) => member.roles.remove(id))
        );
        return `**${client.emoji.done} Removed all mention roles**`;
      };

      if (interaction.isStringSelectMenu() && customId === "mentionRolesMenu") {
        await interaction.deferUpdate();

        if (interaction.values.length === 0) {
          const msg = await removeAllRoles();
          return await interaction.followUp({
            content: msg,
            flags: [64],
          });
        }

        const results = [];
        for (const value of interaction.values) {
          const key = value;
          if (roles[key]) results.push(await addOrRemoveRole(roles[key]));
        }

        await interaction.followUp({
          content: `${client.emoji.done} Updated Roles:\n${results
            .map((r) => `- ${r}`)
            .join("\n")}`,
          flags: [64],
        });
      } else if (interaction.isButton()) {
        if (customId === "addAllRolesBut") {
          const hasAll = Object.values(roles).every((id) =>
            member.roles.cache.has(id)
          );
          return await interaction.reply({
            content: hasAll
              ? `${client.emoji.failed} You already have all mention roles.`
              : await addAllRoles(),
            flags: [64],
          });
        }

        if (customId === "removeAllRolesBut") {
          const hasAny = Object.values(roles).some((id) =>
            member.roles.cache.has(id)
          );
          return await interaction.reply({
            content: !hasAny
              ? `${client.emoji.failed} You don’t have any mention roles.`
              : await removeAllRoles(),
            flags: [64],
          });
        }
      }
    } catch (err) {
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({
          content: `${client.emoji.failed} Something went wrong. Please try again.`,
          flags: [64],
        });
      } else {
        await interaction.reply({
          content: `${client.emoji.failed} Something went wrong. Please try again.`,
          flags: [64],
        });
      }
    }
  },
};
