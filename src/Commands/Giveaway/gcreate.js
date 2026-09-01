const { ActionRowBuilder, EmbedBuilder, ButtonBuilder } = require("discord.js");
const giveawaysModel = require("../../Database/giveaways");
const ms = require("ms");
function formatShortDate(date) {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  return `${month}/${day}/${year}`;
}

module.exports = {
  name: "gcreate",
  description: "Starts a giveaway (interactive)",
  aliases: [],
  examples: [],
  usage: "",
  args: false,
  permissions: {
    bot: ["ManageMessages"],
    user: ["ManageMessages"],
  },
  settings: {
    isOwner: false,
    isCooldown: 10,
  },

  /**
   * @param { import("discord.js").Message } message
   * @param { import("discord.js").Client } client
   * @param { String } args
   * @param { String } prefix
   */

  execute: async (message, client, args, prefix) => {
    const { member, guild } = message;
    let channel;
    let duration;
    let numberWinners;
    let prize;
    let desc;

    if (message.mentions.channels.first()) {
      channel = message.mentions.channels.first();
      duration = args[1];
      numberWinners = Number(args[2]);
      prize = args[3].replaceAll("_", " ");
      desc = args.slice(4).join(" ");
    } else if (args[0] && message.guild.channels.cache.has(args[0])) {
      channel = message.guild.channels.cache.get(args[0]);
      duration = args[1];
      numberWinners = Number(args[2]);
      prize = args[3].replaceAll("_", " ");
      desc = args.slice(4).join(" ");
    } else {
      channel = message.channel;
      duration = args[0];
      numberWinners = Number(args[1]);
      prize = args[2].replaceAll("_", " ");
      desc = args.slice(3).join(" ");
    }
    if (isNaN(numberWinners) || numberWinners < 1) {
      return message.reply({
        content: `**${client.emoji.failed} The winner count must be a number greater than or equal to (1).**`,
      });
    }

    if (!/^[1-9]\d*(m|h|d|w)$/.test(duration)) {
        return message.reply({
          content: `**${client.emoji.failed} I could not convert \`${duration}\` to a valid length of time!**`,
        });
      
    }

    let now = new Date();
    let endTime = new Date(now.getTime() + ms(duration));
    let daysLeft = `<t:${Math.floor(endTime.getTime() / 1000)}:R>`;
    let formattedShortDate = formatShortDate(endTime);

    let givMsg = desc ? `${desc}\n\n` : "";
    givMsg += `Ends: ${daysLeft} (<t:${Math.floor(
      endTime / 1000
    )}>)\nHosted by: ${member}\nEntries: **0**\nWinners: **${numberWinners}**`;

    let giveawayEmbed = new EmbedBuilder()
      .setTitle(prize)
      .setDescription(givMsg)
      .setColor(guild.members.me.displayHexColor)
      .setFooter({ text: formattedShortDate });

    let givBut = new ActionRowBuilder({
      components: [
        new ButtonBuilder({
          customId: `joinGiv`,
          emoji: `<:n_giveaways:1431085230583844906>`,
          style: 2,
        }),
      ],
    });

    let msg = await channel.send({
      embeds: [giveawayEmbed],
      components: [givBut],
    });

    await giveawaysModel.create({
      guildId: guild.id,
      givId: msg.id,
      givStatus: "Started",
      chId: msg.channel.id,
      duration: endTime,
      numberWinners,
      prize,
      hostedby: member.id,
    });

    await message.delete().catch(() => {});
  },
};
