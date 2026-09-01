module.exports = {
  name: "guildMemberAdd",

  /**
   * @param {import("discord.js").GuildMember} member
   */
  run: async (client, member) => {
    if (!member.guild || member.user.bot) return;

    const autoRoles = ["1424177798448418959"];

    const guildRoles = member.guild.roles.cache;
    const botMember = member.guild.members.me;

    const rolesToAdd = autoRoles
      .map((id) => guildRoles.get(id))
      .filter(
        (role) =>
          role &&
          role.editable &&
          role.position < botMember.roles.highest.position
      );

    if (!rolesToAdd.length) return;

    try {
      await member.roles.add(rolesToAdd, "Auto Role");
    } catch (err) {
      console.error(`Failed to add auto roles to ${member.user.tag}:`, err);
    }
  },
};
