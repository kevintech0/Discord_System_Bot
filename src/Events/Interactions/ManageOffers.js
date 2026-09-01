const {
  ActionRowBuilder,
  TextInputBuilder,
  ModalBuilder,
  EmbedBuilder,
  ButtonBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  MediaGalleryItemBuilder,
} = require("discord.js");
const sellersSchema = require("../../Database/sellers");
const {
  isValidImageURL,
  buttonPages,
  getTags,
  cooldown,
} = require("../../Utils/Functions");

module.exports = {
  name: "interactionCreate",
  /**
   * @param {import("discord.js").ButtonInteraction} interaction
   * @param {import("discord.js").Client} client
   */
  run: async (client, interaction) => {
    const { guild, member, message, customId, channel } = interaction;
    if (!interaction.isButton()) return;

    if (customId === "sendOffers") {
      let sellerData = await sellersSchema.findOne({
        guildId: guild.id,
        sellerId: member.id,
      });

      if (!sellerData)
        return interaction.reply({
          content: `${client.emoji.failed} No portfolio found for **@${member.user.username}**.`,
          flags: [64],
        });

      let offerMsgRow = new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("msgInput")
          .setLabel("Message")
          .setPlaceholder("Write an offer message")
          .setStyle(2)
      );

      let offerImagesRow = new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("imagesInput")
          .setLabel("Images (Not required)")
          .setPlaceholder("Write an offer Images\nEx: Image1, Image2, and move")
          .setRequired(false)
          .setStyle(2)
      );

      let model = new ModalBuilder()
        .setCustomId("sendOfferModal")
        .setTitle("Send New Offer")
        .addComponents(offerMsgRow, offerImagesRow);

      await interaction.showModal(model).catch(() => {});

      const i = await interaction
        .awaitModalSubmit({
          filter: (i) =>
            i.customId === "sendOfferModal" && i.user.id === member.id,
          time: 10 * 60 * 1000,
        })
        .catch(() => null);
      if (!i) return;

      let offerMsg = i.fields.getTextInputValue("msgInput");
      let offerImages = i.fields
        .getTextInputValue("imagesInput")
        ?.split(",")
        .map((v) => v.trim())
        .filter((v) => v);

      if (offerImages?.length > 0) {
        for (const img of offerImages) {
          if (!isValidImageURL(img)) {
            return i.reply({
              content: `**${client.emoji.failed} One or more image URLs are invalid:\n> ${img}**`,
              flags: [64],
            });
          }
        }
      }

      let channel = client.channels.cache.get("1424177852164739225");
      if (channel) {
        const embed = new EmbedBuilder()
          .setColor("#9b4dff")
          .setAuthor({
            name: `${member.user.username}'s Offer`,
            iconURL: member.displayAvatarURL(),
          })
          .setDescription(offerMsg)
          .setFooter({ text: "New Seller Offer", iconURL: guild.iconURL() })
          .setTimestamp();

        if (offerImages?.length > 0) {
          embed.setImage(offerImages[0]);
        }

        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("orderNow")
            .setLabel("Order Now")
            .setEmoji("<:order:1431075737330258002>")
            .setStyle(2),
          new ButtonBuilder()
            .setCustomId("saveOffer")
            .setLabel("Save Offer")
            .setEmoji("<:download:1431077350992248832>")
            .setStyle(4)
        );

        if (offerImages?.length > 1) {
          buttons.addComponents(
            new ButtonBuilder()
              .setCustomId("viewGallery")
              .setLabel("View Gallery")
              .setEmoji("<:gallery:1431077895866024048>")
              .setStyle(1)
          );
        }

        const msg = await channel.send({
          content: `-# New Offer <@&1424177806811861092> | By ${member}`,
          embeds: [embed],
          components: [buttons],
        });

        sellerData.offers.push({
          desc: offerMsg,
          date: Date.now(),
          msgId: msg.id,
          images: offerImages,
          tickets: [],
        });
        await sellerData.save();
      }

      return i.reply({
        content: `**${client.emoji.done} Done!!**`,
        flags: [64],
      });
    }

    if (customId === "orderNow") {
      let sellerData = await sellersSchema.findOne({
        guildId: guild.id,
        "offers.msgId": message.id,
      });

      if (!sellerData)
        return interaction.reply({
          content: `${client.emoji.failed} No portfolio found for **@${member.user.username}**.`,
          flags: [64],
        });

      let offer = sellerData.offers.find((o) => o.msgId === message.id);
      if (!offer)
        return interaction.reply({
          content: `**${client.emoji.failed} No offer available**`,
          flags: [64],
        });

      if (
        offer.tickets.find(
          (o) => o.memberId === member.id && o.status === "Opened"
        )
      )
        return interaction.reply({
          content: `**${client.emoji.error} Ticket limit reached**`,
          flags: [64],
        });

      let offerOwner = await guild.members
        .fetch(sellerData.sellerId)
        .catch(() => null);

      if (!offerOwner)
        return interaction.reply({
          content: `**${client.emoji.failed} Offer owner was not found on the server**`,
        });

      await interaction.reply({
        content: `**${client.emoji.loading} Creating test ticket...**`,
        flags: [64],
      });

      let modRoles = getTags(
        guild,
        "1428734054228037733",
        "1424177779490033736",
        ["Certified", "Skill Verifier"],
        "Id"
      );

      const ticketChannel = await guild.channels.create({
        name: `offer-by-${offerOwner.user.username}`,
        type: 0,
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          ...modRoles.map((roleId) => ({
            id: roleId,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          })),
          {
            id: offerOwner.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
          {
            id: member.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
        ],
      });

      const newContainer = new ContainerBuilder()
        .setAccentColor(
          message.guild.members.me.displayHexColor !== "#000000"
            ? parseInt(
                message.guild.members.me.displayHexColor.replace("#", ""),
                16
              )
            : null
        )

        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent(`### ${member} Wants your offer ${offerOwner}`)
        )

        .addSeparatorComponents((separator) => separator)

        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent(offer.desc)
        )

        .addSeparatorComponents((separator) => separator);

      if (offer.images.length > 0) {
        newContainer.addMediaGalleryComponents((gallery) =>
          gallery.addItems(
            offer.images.map((url, i) =>
              new MediaGalleryItemBuilder()
                .setURL(url)
                .setDescription(`Image #${i + 1}`)
            )
          )
        );

        newContainer.addSeparatorComponents((separator) => separator);
      }

      newContainer.addActionRowComponents((actionRow) =>
        actionRow.setComponents(
          new ButtonBuilder()
            .setCustomId(`closeOffer`)
            .setLabel(`Close`)
            .setEmoji("<:lock:1431075733471498320>")
            .setStyle(4),

          new ButtonBuilder()
            .setCustomId(`ownerOffer`)
            .setLabel(`Come`)
            .setEmoji("<:manager:1431076465524342835>")
            .setStyle(1)
        )
      );

      ticketChannel.sendTyping();
      ticketChannel.send({
        components: [newContainer],
        flags: [32768],
      });

      await sellersSchema.findOneAndUpdate(
        { sellerId: offerOwner.id, "offers.msgId": message.id },
        {
          $push: {
            "offers.$.tickets": {
              channelId: ticketChannel.id,
              memberId: member.id,
              createdAt: Date.now(),
              status: "Opened",
            },
          },
        }
      );

      return interaction.editReply({
        content: `**${client.emoji.done} Successfully created a offer ticket for ${member}**`,
      });
    }

    if (customId === "ownerOffer") {
      const timeLeft = cooldown(client, member, customId, 60);
      if (timeLeft)
        return interaction.reply({
          content: `**@${member.user.username}**, Cool down (**${timeLeft}** left)`,
          flags: [64],
        });

      let content = message.components[0].components[0].content.split(" ")[5];
      let sellerId = content.match(/<@!?(\d+)>/)?.[1];

      let offerOwner = await guild.members.fetch(sellerId).catch(() => null);
      if (!offerOwner)
        return interaction.reply({
          content: `**${client.emoji.failed} Offer Owner was not found on the server**`,
        });

      const dmEmbed = new EmbedBuilder()
        .setColor(guild.members.me.displayHexColor)
        .setTitle("New Ticket Opened for Your Offer!")
        .setDescription(
          `Hey **${offerOwner}**,\n\n` +
            `Someone has just opened a **[ ${channel.name} ]** regarding **your offer**.\n` +
            `They’re interested and would like to discuss it with you.\n\n` +
            `Please check the ticket channel to respond and continue the conversation.`
        )
        .setFooter({
          text: "Nexode Offers System",
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp();

      let rowButs = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel(`Click here`)
          .setEmoji(client.emoji.link)
          .setStyle(5)
          .setURL(
            `https://discord.com/channels/${guild.id}/${channel.id}/${message.id}`
          )
      );

      try {
        await offerOwner.send({ embeds: [dmEmbed], components: [rowButs] });
      } catch (err) {
        return interaction.reply({
          content: `**${client.emoji.failed} Couldn't send a DM to the offer owner:**`,
        });
      }

      return interaction.reply({
        content: `**${client.emoji.done} The offer owner has been notified in DMs!**`,
      });
    }

    if (customId === "closeOffer") {
      await interaction.deferUpdate().catch(() => null);
      await channel.send({
        content: "Ticket Offer will be closed in **5 seconds**...",
      });

      return setTimeout(() => channel.delete().catch(() => null), 5000);
    }

    if (customId === "saveOffer") {
      const timeLeft = cooldown(client, member, customId, 120);
      if (timeLeft)
        return interaction.reply({
          content: `**@${member.user.username}**, Cool down (**${timeLeft}** left)`,
          flags: [64],
        });

      await interaction.deferUpdate();
      return member.send({ embeds: [message.embeds[0]] }).catch(() => {});
    }

    if (customId === "viewGallery") {
      let sellerData = await sellersSchema.findOne({
        guildId: guild.id,
        "offers.msgId": message.id,
      });

      if (!sellerData)
        return interaction.reply({
          content: `${client.emoji.failed} No portfolio found.`,
          flags: [64],
        });

      let offer = sellerData.offers.find((o) => o.msgId === message.id);
      if (!offer || !offer.images || offer.images.length <= 1)
        return interaction.reply({
          content: `**${client.emoji.failed} No gallery available**`,
          flags: [64],
        });

      let pages = [];
      offer.images.map((img, i) => {
        let embed = new EmbedBuilder()
          .setColor(guild.members.me.displayHexColor)
          .setTitle(`Image ${i + 1}`)
          .setImage(img);

        pages.push(embed);
      });

      await buttonPages(interaction, pages, 120000, true);
    }
  },
};
