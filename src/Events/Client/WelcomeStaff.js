const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "guildMemberUpdate",

  /**
   * @param {import("discord.js").GuildMember} oldMember
   * @param {import("discord.js").GuildMember} newMember
   * @param {import("discord.js").Client} client
   */

  run: async (client, oldMember, newMember) => {
    const clanRoleId = "1424177786259505213";
    const channelId = "1426313329965797478";

    const clanRole = await newMember.guild.roles.fetch(clanRoleId).catch(() => null);
    if (!clanRole) return;

    const addedRole =
      newMember.roles.cache.has(clanRole.id) &&
      !oldMember.roles.cache.has(clanRole.id);

    if (addedRole) {
      const updatedRole = await newMember.guild.roles.fetch(clanRoleId).catch(() => null);
      const totalMembers = updatedRole?.members?.size || 0;

      const channel = client.channels.cache.get(channelId);
      if (!channel) return;

      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("New Staff Member Joined!")
            .setColor(newMember.guild.members.me.displayHexColor)
            .setFooter({
              text: `Nexode Services © 2025`,
              iconURL: newMember.guild.iconURL(),
            })
            .setTimestamp()
            .setDescription(`## ${client.emoji.nexode} Welcome to Our New Staff Member!
### We're thrilled to have you join the **Nexode Staff Team**, ${newMember}!
### <a:n_arrow:1430366247450837002> Please make sure to review:
> <#1424203225292083260> – Guidelines & Code of Conduct  
> <#1426340778044559400> – Staff Actions

<a:n_heart:1430361868714639461> You’ve now become part of the **core team** keeping Nexode running smoothly.  
<a:n_fire:1430369438032465931> Total Staff Members Now: **[ ${totalMembers} ]**

Thank you for contributing your time and effort — we’re lucky to have you on board!`),
        ],
      }).catch(() => null);
    }
  },
};