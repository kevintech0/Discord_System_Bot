const chalk = require("chalk");
const { AttachmentBuilder, EmbedBuilder } = require("discord.js");
const { Canvas, loadImage } = require("canvas-constructor/napi-rs");
const { adjustX } = require("../Utils/Functions");

let invites = new Map();

/**
 * @param {import("discord.js").Client} client
 */

module.exports = async (client) => {
  try {
    const guild = await client.guilds.cache.first();
    const currentInvites = await guild.invites.fetch();
    invites = new Map(currentInvites.map((inv) => [inv.code, inv.uses]));
    client.logger.log(
      chalk.greenBright(
        `Loaded ${currentInvites.size} invites for ${guild.name}`
      ),
      "debug"
    );
  } catch (err) {
    console.error("Failed to load invites:", err);
  }

  client.on("inviteCreate", (invite) => {
    invites.set(invite.code, invite.uses);
  });

  client.on("inviteDelete", (invite) => {
    invites.delete(invite.code);
  });

  client.on("guildMemberAdd", async (member) => {
    const welcomeChannel =
      member.guild.channels.cache.get(`1424177854316417136`);

    if (!welcomeChannel) return console.log("Welcome channel not found!");

    const newInvites = await member.guild.invites.fetch();
    const usedInvite = newInvites.find((inv) => {
      const prevUses = invites.get(inv.code) || 0;
      return inv.uses > prevUses;
    });

    let userBypass = await client.users
      .fetch(member.id, { force: true })
      .catch(() => null);

    // let { username } = member.user;
    // let bg = await loadImage("./src/Assets/Vampire_Studio_Welcome.png");
    // let userAvatar = await loadImage(member.displayAvatarURL());

    const guildVanity = await member.guild.fetchVanityData().catch(() => null);
    let inviterMention = "Unknown";
    let inviteType = "Direct Join";

    if (usedInvite && usedInvite.inviter) {
      inviterMention = `<@${usedInvite.inviter.id}>`;
      inviteType = `||${usedInvite.code}||`;
    } else if (guildVanity && guildVanity.code) {
      inviteType = `discord.gg/${guildVanity.code}`;
      inviterMention = "Custom Invite";
    } else {
      inviteType = "Direct Join";
      inviterMention = "None";
    }

    let embed = new EmbedBuilder()
      .setColor(userBypass.hexAccentColor)
      .setAuthor({
        name: `Welcome to ${member.guild.name}!`,
        iconURL: member.guild.iconURL(),
      })
      .setThumbnail(member.user.displayAvatarURL({ size: 1024 }))
      .setImage("attachment://welcome.png")
      .setDescription(
        `> Hey ${member}, we're thrilled to have you here!\n> Make yourself at home and enjoy your stay 💫`
      )
      .setTimestamp()
      .addFields(
        {
          name: "Username",
          value: `\`${member.user.username}\``,
          inline: true,
        },
        {
          name: "Member Count",
          value: `\`${member.guild.memberCount}\``,
          inline: true,
        },
        {
          name: "Server Rules",
          value: "<#1424177844438831184>",
          inline: true,
        },
        {
          name: "Invited By",
          value: inviterMention,
          inline: true,
        },
        {
          name: "Invite Used",
          value: inviteType,
          inline: true,
        },
        {
          name: "Invites",
          value: usedInvite ? `${usedInvite.uses} Total` : "Unknown",
          inline: true,
        }
      )

      .setFooter({
        text: client.user.username,
        iconURL: client.user.avatarURL(),
      });

    // if (username.length > 17) {
    //   username = `${username.slice(0, 14)}...`;
    // }

    // let X = adjustX(username, 318, 205, 8);
    // let canvas = new Canvas(bg.width, bg.height)
    //   .printImage(bg, 0, 0)
    //   .setColor("#FFFFFF")
    //   .setTextFont("30px Arial")
    //   .printText(username, X, 189)
    //   .printCircularImage(userAvatar, 123, 114, 90, 90, 50)
    //   .png();

    // let attach = new AttachmentBuilder(canvas, {
    //   name: "welcome.png",
    //   description: "Server Welcome",
    // });

    if (userBypass.banner) embed.setImage(userBypass.bannerURL({ size: 2048 }));

    welcomeChannel.send({ embeds: [embed], /*files: [attach]*/ });

    invites = new Map(newInvites.map((inv) => [inv.code, inv.uses]));
  });
};
