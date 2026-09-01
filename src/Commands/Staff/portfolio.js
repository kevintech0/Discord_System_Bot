const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { buttonPages, getEmojiCustom } = require("../../Utils/Functions");
const sellersSchema = require("../../Database/sellers");

module.exports = {
  name: "portfolio",
  description: "Portfolio command",
  aliases: ["p", "profile"],
  examples: [""],
  usage: "",
  args: false,
  permissions: {
    bot: [],
    user: [],
  },
  settings: {
    isOwner: false,
    isStaff: true,
    isCooldown: 10,
  },

  /**
   * @param { import("discord.js").Message } message
   * @param { import("discord.js").Client } client
   * @param { String } args
   * @param { String } prefix
   */

  execute: async (message, client, args, prefix) => {
    const user =
      message.mentions.users.first() ||
      (await client.users.fetch(args[0]).catch(() => null)) ||
      message.author;
    let guild = message.guild;
    let userByapss = await client.user.fetch(user.id, {
      force: true,
    });

    const seller = await sellersSchema.findOne({
      guildId: guild.id,
      sellerId: user.id,
    });

    if (!seller)
      return message.reply({
        content: `${client.emoji.failed} No portfolio found for **@${user.username}**.`,
      });

    const skills =
      seller.skills.length > 0
        ? seller.skills.map((s) => guild.roles.cache.get(s).name).join("\n")
        : "No skills added";

    const totalReviews = seller.reviews.length;
    const avgRating =
      totalReviews > 0
        ? seller.reviews
            .reduce((a, r) => a + Number(r.rating || 0), 0)
            .toFixed(2)
        : "0";
    const stars =
      totalReviews > 0
        ? `${client.emoji.star}`.repeat(Math.round(avgRating))
        : "";

    const embed = new EmbedBuilder()
      .setAuthor({
        name: guild.name,
        iconURL: guild.iconURL(),
      })
      .setColor(userByapss.hexAccentColor)
      .addFields(
        { name: "Name", value: seller.name, inline: true },
        { name: "Age", value: `${seller.age}`, inline: true },
        { name: "Country", value: seller.country, inline: true },
        {
          name: "Joined",
          value: `<t:${Math.floor(seller.joinedDate.getTime() / 1000)}:R>`,
          inline: true,
        },
        { name: "Status", value: seller.status, inline: true },
        {
          name: "Verified",
          value: seller.verified ? "Yes" : "No",
          inline: true,
        },
        { name: "Skills", value: `\`\`\`${skills}\`\`\``, inline: false },
        {
          name: "Total Offers",
          value: `\`\`\`${seller.offers.length}\`\`\``,
          inline: true,
        },
        {
          name: "Total Orders",
          value: `\`\`\`${seller.totalOrders}\`\`\``,
          inline: true,
        },
        {
          name: "Total Reviews",
          value: `\`\`\`${totalReviews}\`\`\``,
          inline: true,
        },
        {
          name: `Average Rating (${avgRating}/5)`,
          value: `\`\`\`${stars.length} Stars\`\`\``,
        }
      )
      .setThumbnail(user.displayAvatarURL())
      .setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    const recentReviews = seller.reviews
      .slice(-3)
      .map((r) => {
        const clientUser = guild.members.cache.get(r.clientId);
        return `> ${client.emoji.star} **${r.rating}/5** by ${
          clientUser ? clientUser.displayName : "Unknown"
        }\n\`\`\`${r.feedback}\`\`\``;
      })
      .join("\n");

    if (recentReviews)
      embed.addFields({ name: "Recent Reviews", value: recentReviews });

    if (user.banner) embed.setImage(user.bannerURL({ size: 2048 }));

    const baseButtons = [];
    if (seller.projects.length > 0) {
      baseButtons.push(
        new ButtonBuilder()
          .setCustomId("portfolioProjects")
          .setLabel("View Projects")
          .setEmoji("<:project:1431075739192786974>")
          .setStyle(3)
      );
    }

    if (seller.offers.length > 0) {
      baseButtons.push(
        new ButtonBuilder()
          .setCustomId("viewOffers")
          .setLabel("View Offers")
          .setEmoji("<:n_offer:1431066645912096909>")
          .setStyle(1)
      );
    }

    const socialButtons = [];
    if (seller.socialMedia.length > 0) {
      for (const social of seller.socialMedia.slice(0, 5)) {
        const emoji = getEmojiCustom(social.platform) || "<:web:1433676474547830895>";
        socialButtons.push(
          new ButtonBuilder()
            .setLabel(
              social.platform.charAt(0).toUpperCase() + social.platform.slice(1)
            )
            .setEmoji(emoji)
            .setStyle(5)
            .setURL(social.url)
        );
      }
    }

    const allButtons = [...baseButtons, ...socialButtons];

    const components = [];
    for (let i = 0; i < allButtons.length; i += 5) {
      components.push(
        new ActionRowBuilder().addComponents(allButtons.slice(i, i + 5))
      );
    }

    let msg = await message.reply({ embeds: [embed], components });
    let c = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      componentType: 2,
    });

    c.on("collect", async (i) => {
      if (i.customId === "portfolioProjects") {
        if (seller.projects.length == 0 || !seller.projects) {
          return i.reply({
            content: `**${client.emoji.failed} There are no added to the projects**`,
            flags: [64],
          });
        }

        let pages = [];
        let extraButtons = [];
        seller.projects.forEach((project, index) => {
          const embed = new EmbedBuilder()
            .setColor(guild.members.me.displayHexColor)
            .setTitle(`Project ${index + 1} of ${seller.projects.length}`)
            .setFooter({
              text: `Requested by ${message.author.username}`,
              iconURL: message.author.displayAvatarURL(),
            })
            .setTimestamp()
            .addFields(
              {
                name: `<:label:1431155471334641704> Title`,
                value: `\`\`\`${project.title}\`\`\``,
              },
              {
                name: `<:description:1431155478406369300> Description`,
                value: `\`\`\`${project.description}\`\`\``,
              },
              {
                name: `<:categories:1431122860079972362> Languages Used`,
                value: project.languages
                  .map((lang) => getEmojiCustom(lang) || lang)
                  .join(", "),
              }
            );

          if (project.image) embed.setImage(project.image || null);

          if (project.type === "programming") {
            extraButtons = [
              new ButtonBuilder()
                .setLabel("View Project")
                .setURL(project.links?.viewProject || "https://example.com")
                .setEmoji(client.emoji.link)
                .setStyle(5),

              new ButtonBuilder()
                .setLabel("Open Source")
                .setURL(project.links?.openSource || "https://github.com/")
                .setEmoji("<:n_openfolder:1431069462362194061>")
                .setStyle(5),
            ];
          }

          pages.push(embed);
        });

        await buttonPages(i, pages, 120000, true, extraButtons);
      }

      if (i.customId === "viewOffers") {
        if (seller.offers.length == 0 || !seller.offers) {
          return message.reply({
            content: `**${client.emoji.failed} There are no added to the offers**`,
            flags: [64],
          });
        }

        let pages = [];
        seller.offers.forEach((offer, index) => {
          const embed = new EmbedBuilder()
            .setDescription(offer.desc)
            .setTitle(`Offer ${index + 1} of (${seller.offers.length})`)
            .setImage(offer.images[0])
            .addFields(
              {
                name: `<:n_offer:1431066645912096909> Number of Orders`,
                value: `${offer.tickets.length}`,
                inline: true,
              },
              {
                name: `<:n_time:1431067339465560186> Time of Offer`,
                value: `<t:${Math.floor(offer.date / 1000)}:R>`,
                inline: true,
              }
            );

          pages.push(embed);
        });

        await buttonPages(i, pages, 120000, true);
      }
    });
  },
};
