const {
  Collection,
  PermissionFlagsBits,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  AttachmentBuilder,
} = require("discord.js");
const fetch = require("node-fetch");
const ticketSchema = require("../Database/tickets.js");
const fs = require("fs");
const path = require("path");
const apiKey = process.env.IMGBB_API_KEY;
const { Canvas, loadImage } = require("canvas-constructor/napi-rs");
const discordTranscripts = require("discord-html-transcripts");

module.exports = class Util {
  /**
   *
   * @param {import("discord.js").Client} client
   * @param {import("discord.js").Interaction} interaction
   */

  static cooldown(client, member, commandOrId, seconds) {
    const key =
      typeof commandOrId === "string" ? commandOrId : commandOrId.name;

    if (!client.cooldowns.has(key)) {
      client.cooldowns.set(key, new Collection());
    }

    const timestamps = client.cooldowns.get(key);

    const cooldownAmount =
      (seconds ||
        (typeof commandOrId === "object"
          ? commandOrId.settings?.isCooldown
          : 3)) * 1000;

    if (timestamps.has(member.id)) {
      const expirationTime = timestamps.get(member.id) + cooldownAmount;
      if (Date.now() < expirationTime) {
        const timeLeft = (expirationTime - Date.now()) / 1000;
        return Math.round(timeLeft) + 1 === 1
          ? "a second"
          : `${Math.round(timeLeft) + 1} seconds`;
      } else {
        timestamps.set(member.id, Date.now());
        setTimeout(() => timestamps.delete(member.id), cooldownAmount);
      }
    } else {
      timestamps.set(member.id, Date.now());
      setTimeout(() => timestamps.delete(member.id), cooldownAmount);
    }
  }

  static async buttonPages(
    input,
    pages,
    time = 120000,
    ephemeral = false,
    buttons = []
  ) {
    if (!input) throw new Error("Hot El Interaction Ya Hayawan");
    if (!pages) throw new Error("Hot El Pages Ya Hayawan");
    if (!Array.isArray(pages))
      throw new Error("Lazm El Pages Tekon Array Ya Hayawan");
    if (typeof time != "number")
      throw new Error("El Time Lazm Yekon Number Ya Hayawan");
    if (parseInt(time) < 30000)
      throw new Error("El Time Lazm Yekon Akbr Mn 30 Thanya Ya Hayawan");

    let index = 0;
    const button1 = new ButtonBuilder()
      .setCustomId("previousbtn")
      .setEmoji("<:arrow:1431097427687112894>")
      .setStyle(4)
      .setDisabled(true);

    const button2 = new ButtonBuilder()
      .setCustomId("nextbtn")
      .setEmoji("<:right_arrow:1431097425975840788>")
      .setStyle(3);

    const navRow = new ActionRowBuilder().addComponents(button1, button2);
    const validButtons = Array.isArray(buttons) ? buttons : [];
    const extraRow =
      validButtons.length > 0
        ? new ActionRowBuilder().addComponents(validButtons.slice(0, 5))
        : null;

    let currentPage;
    const isInteraction =
      !!input.reply && typeof input.deferReply === "function";
    const userId = isInteraction ? input.user.id : input.author.id;

    const sendPage = async () => {
      const embed = pages[index].setFooter({
        text: `${index + 1}/${pages.length}`,
      });

      const components = [];
      if (extraRow) components.push(extraRow);
      components.push(navRow);

      if (isInteraction) {
        await input.deferReply({ ephemeral }).catch(() => null);
        return await input.editReply({
          embeds: [embed],
          components: pages.length === 1 ? [] : components,
          fetchReply: true,
        });
      } else {
        return await input.channel.send({
          embeds: [embed],
          components: pages.length === 1 ? [] : components,
        });
      }
    };

    currentPage = await sendPage();

    if (pages.length === 1) return currentPage;

    const collector = currentPage.createMessageComponentCollector({
      filter: (i) => i.user.id === userId,
      componentType: 2,
      time,
    });

    collector.on("collect", async (i) => {
      await i.deferUpdate().catch(() => null);

      if (i.customId === "previousbtn" && index > 0) index--;
      else if (i.customId === "nextbtn" && index < pages.length - 1) index++;

      button1.setDisabled(index === 0);
      button2.setDisabled(index === pages.length - 1);

      const newEmbed = pages[index].setFooter({
        text: `${index + 1}/${pages.length}`,
      });

      const components = [];
      if (extraRow) components.push(extraRow);
      components.push(navRow);

      try {
        if (isInteraction && ephemeral) {
          await input.editReply({
            embeds: [newEmbed],
            components,
          });
        } else if (currentPage && currentPage.editable !== false) {
          await currentPage.edit({
            embeds: [newEmbed],
            components,
          });
        }
      } catch (err) {
        console.log("[Page Edit Error]", err.message);
      }
    });

    collector.on("end", async () => {
      try {
        if (isInteraction && ephemeral) {
          await input.editReply({ components: [] }).catch(() => null);
        } else if (currentPage && currentPage.editable !== false) {
          await currentPage.edit({ components: [] }).catch(() => null);
        }
      } catch (err) {
        console.log("[Collector End Error]", err.message);
      }
    });

    return currentPage;
  }

  static getEmojiCustom(name) {
    const languageEmojis = {
      html: "<:html:1430714126996475984>",
      css: "<:css:1430714124106469526>",
      javascript: "<:js:1430714128581791826>",
      typescript: "<:typescript:1430714139138981918>",
      python: "<:python:1430714133589921953>",
      bootstrap: "<:bootstrap:1430714122525343885>",
      tailwind: "<:tailwind:1430714137264132096>",
      nodejs: "<:nodejs:1430714131782307933>",
      reactjs: "<:react:1430714135192277152>",
      nextjs: "<:nextjs:1430714130154651688>",
      flutter: "<:flutter:1430714125658493078>",
    };

    const platformEmojis = {
      discord: "<:discord:1430704429304119326>",
      github: "<:github:1430704427223875758>",
      linkedin: "<:linkedin:1430704424971403354>",
      npm: "<:npm:1430704826299191509>",
      behance: "<:behance:1430704423461720094>",
      reddit: "<:reddit:1430704421964087487>",
      youtube: "<:youtube:1430704420563456122>",
    };

    const designEmojis = {
      photoshop: "<:photoshop:1430714166120939622>",
      illustrator: "<:illustrator:1430714164262998026>",
      aftereffects: "<:aftereffects:1430714159682687017>",
      figma: "<:figma:1430714162799185960>",
      canva: "<:canva:1430714161091969044>",
    };

    const lowerName = name.toLowerCase();
    if (languageEmojis[lowerName]) return languageEmojis[lowerName];

    if (platformEmojis[lowerName]) return platformEmojis[lowerName];

    if (designEmojis[lowerName]) return designEmojis[lowerName];

    return "❓";
  }

  static isValidImageURL(url) {
    if (typeof url !== "string" || !url.trim()) {
      return false;
    }

    return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|bmp|svg))$/i.test(
      url.trim()
    );
  }

  static isValidURL(url) {
    if (typeof url !== "string" || !url.trim()) {
      return false;
    }

    return /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i.test(url.trim());
  }

  static isValidColor(color) {
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
  }

  static adjustX(text, currentX, minX, decreaseValue) {
    if (text.length > 1) {
      for (let i = 1; i < text.length; i++) {
        if (currentX == minX || currentX - decreaseValue < minX) break;
        currentX -= decreaseValue;
      }
    }

    return currentX;
  }

  static async uploadImage(url, returnUrlOnly = false) {
    try {
      const response = await fetch(url);
      const buffer = await response.buffer();
      const imageBase64 = buffer.toString("base64");

      const uploadResponse = await fetch(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            image: imageBase64,
          }),
        }
      );

      const result = await uploadResponse.json();

      if (result && result.data) {
        return returnUrlOnly ? result.data.url : result;
      } else {
        throw new Error("Invalid response from imgbb API");
      }
    } catch (error) {
      console.error("Error Now:", error);
      return null;
    }
  }

  static getTags(
    guild,
    startRoleId,
    endRoleId,
    excludedNames = [],
    extract = "Id"
  ) {
    const startRole = guild.roles.cache.get(startRoleId);
    const endRole = guild.roles.cache.get(endRoleId);

    if (!startRole || !endRole) {
      throw new Error("One or both of the specified roles were not found.");
    }

    const rolesBetween = guild.roles.cache
      .sort((a, b) => b.position - a.position)
      .filter(
        (r) =>
          r.id !== guild.id &&
          !excludedNames.includes(r.name) &&
          r.position < startRole.position &&
          r.position > endRole.position
      );

    if (extract === "Id") {
      return Array.from(rolesBetween.keys());
    } else {
      return Array.from(rolesBetween.values());
    }
  }

  static async createTicket(interaction, options, devRoleId) {
    const guild = interaction.guild;
    const member = interaction.member;
    const client = interaction.client;
    const config = client.config;

    const { name, section } = options;
    const categoryId = config.ticketCategorys[section] || null;

    const openCount = await ticketSchema.countDocuments({
      guildId: guild.id,
      userId: member.id,
      panelName: section,
      status: "Opened",
    });

    const method = section === "developer" ? "editReply" : "reply";
    await interaction[method]({
      content: `${client.emoji.loading} *Loading user information...*`,
      flags: [64],
    }).catch(() => null);

    if (openCount >= 1) {
      return interaction.editReply({
        content: `**${client.emoji.failed} Ticket limit reached, You already have 1 tickets open of the 1 allowed for this panel**`,
        flags: [64],
      });
    }

    await interaction
      .editReply({
        content: `${client.emoji.loading} *Verifying Permissions...*`,
      })
      .catch(() => null);

    await interaction
      .editReply({
        content: `${client.emoji.loading} *Creating Ticket Channel...*`,
      })
      .catch(() => null);

    let modRoles = Util.getTags(
      guild,
      "1428734054228037733",
      "1424177779490033736",
      ["Certified", "Skill Verifier"],
      "Id"
    );
    const overwrites = [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: member.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      ...modRoles.map((roleId) => ({
        id: roleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      })),
    ];

    const sectionData = {
      Developer: {
        roleId: devRoleId,
        title: "[ Developer Requests ]",
        description:
          "If you need technical help or coding assistance, just ask your question and the bot will assist you. If you need more help, wait for a team member to respond. We're here to help you",
      },
      Designer: {
        roleId: "1424177782434566309",
        title: "[ Designer Requests ]",
        description:
          "If you need design help or art assistance, just ask your question and the bot will assist you. If you need more help, wait for a team member to respond. We're here to help you",
      },
      Support: {
        roleId: "1430384496410361907",
        title: "[ Support ]",
        description:
          "If you need help or assistance, just ask your question and the bot will assist you. If you need more help, wait for a team member to respond. We're here to help you",
      },
    };

    const { roleId, title, description } = sectionData[section];
    if (roleId) {
      overwrites.push({
        id: roleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      });
    }

    let countKey = `ticketCount_${guild.id}_${section}`;
    let ticketCount = (await client.db.get(countKey)) || 1;

    const ticketChannel = await guild.channels.create({
      name: `${section}-${ticketCount}`,
      type: 0,
      permissionOverwrites: overwrites,
      parent: categoryId,
    });

    await ticketSchema.create({
      guildId: guild.id,
      userId: member.id,
      ticketNumber: ticketCount,
      channelId: ticketChannel.id,
      panelName: section,
    });
    await client.db.set(countKey, ticketCount + 1);

    const ticketRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("closeTicket")
        .setLabel("Close")
        .setEmoji("<:lock:1431075733471498320>")
        .setStyle(2),

      new ButtonBuilder()
        .setCustomId("claimTicket")
        .setLabel("Claim")
        .setEmoji("<:manager:1431076465524342835>")
        .setStyle(1)
    );

    let bg = await loadImage("./src/Assets/Nexode_New_Ticket.png");
    let userAvatar = await loadImage(member.displayAvatarURL());
    let { username } = member.user;
    if (username.length > 25) {
      username = `${username.slice(0, 22)}...`;
    }

    let X = Util.adjustX(username, 740, 350, 7.5);
    let canvas = new Canvas(bg.width, bg.height)
      .printImage(bg, 0, 0)
      .setColor("#FFFFFF")
      .setTextFont("40px Arial")
      .printText(username, X, 346)
      .printCircularImage(userAvatar, 406, 335, 32, 32, 50)
      .png();

    let attach = new AttachmentBuilder(canvas, {
      name: "ticket.png",
    });

    const onlineStaffs = guild.members.cache.filter(
      (m) =>
        m.roles.cache.has(roleId) &&
        ["online", "dnd", "idle"].includes(m.presence?.status)
    );

    const embed = new EmbedBuilder()
      .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
      .setTitle(section.charAt(0).toUpperCase() + section.slice(1))
      .setDescription(
        `<a:n_heart:1430361868714639461> Welcome to the **${title}** section\n> ${description}`
      )
      .setImage("attachment://ticket.png")
      .setColor(guild.members.me.displayHexColor)
      .addFields(
        {
          name: "<:crown:1431122864022491238> Ticket Owner",
          value: `\`\`\`\n${member.user.tag}\n\`\`\``,
          inline: true,
        },
        {
          name: "<:ticket:1431122858662428752> Ticket Number",
          value: `\`\`\`\n#${ticketCount}\n\`\`\``,
          inline: true,
        },
        {
          name: "<:categories:1431122860079972362> Ticket Type",
          value: `\`\`\`\n${name}\n\`\`\``,
          inline: true,
        },
        {
          name: "<:online:1431122862110019644> Online Staff",
          value: `\`\`\`\n${onlineStaffs.size} Active\n\`\`\``,
          inline: true,
        },
        {
          name: "<:n_time:1431067339465560186> Created At",
          value: `\`\`\`\n${new Date().toLocaleString()}\n\`\`\``,
          inline: true,
        },
        {
          name: "<:n_done:1431067075916595210> Security Status",
          value:
            "```bash\nFirewall: Active | Anti-Spam: Enabled | Logs: Protected\n```",
          inline: false,
        }
      );

    let msg = await ticketChannel.send({
      content: `-# ${member} | <@&${roleId}>`,
      embeds: [embed],
      files: [attach],
      components: [ticketRow],
    });
    msg.pin().catch(() => null);

    await interaction.editReply({
      content: `✔ *Ticket Created ${ticketChannel}*`,
      flags: [64],
    });

    client.emit("ticketLog", member, ticketChannel.name, "Created", section);
    await Util.updateTicketStatus(client, guild);
  }

  static async claimTicket(input, client) {
    const isInteraction =
      !!input.isChatInputCommand || !!input.isButton || !!input.isModalSubmit;
    const channel = input.channel;
    const guild = input.guild;
    const member = isInteraction ? input.member : input.member || input.author;

    const ticketData = await ticketSchema.findOne({ channelId: channel.id });

    let hasDeferred = false;
    if (isInteraction && input.isButton()) {
      await input.deferUpdate().catch(() => null);
      hasDeferred = true;
    }

    const reply = (msgData) => {
      if (!isInteraction) return channel.send(msgData);
      return hasDeferred ? input.followUp(msgData) : input.reply(msgData);
    };

    if (!ticketData) {
      return reply({
        content: `**${client.emoji.failed} The ticket will not be found.**`,
        ephemeral: true,
      });
    }

    if (member.id === ticketData.userId) {
      return reply({
        content: `> ${client.emoji.failed} **Warning:** You can't claim your own ticket.`,
        ephemeral: true,
      });
    }

    const supportRoles = channel.permissionOverwrites.cache
      .filter(
        (perm) =>
          perm.type === 0 &&
          perm.allow.has("ViewChannel") &&
          (perm.allow.has("SendMessages") || perm.deny.has("SendMessages"))
      )
      .map((perm) => perm.id);

    if (!member.roles.cache.some((role) => supportRoles.includes(role.id))) {
      return reply({
        content: `You don't have permissions to use this.`,
        ephemeral: true,
      });
    }

    if (ticketData.claimId === member.id) {
      await Util.renameTicket(
        input,
        client,
        channel,
        `${ticketData.panelName}-${ticketData.ticketNumber}`,
        false
      );

      await channel
        .edit({
          permissionOverwrites: [
            {
              id: guild.id,
              deny: [PermissionFlagsBits.ViewChannel],
            },
            {
              id: ticketData.userId,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
              ],
            },
            ...supportRoles.map((roleId) => ({
              id: roleId,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
              ],
            })),
          ],
        })
        .catch(() => null);

      ticketData.claimId = "Not claim";
      await ticketData.save();

      const unclaimEmbed = new EmbedBuilder()
        .setDescription(`Ticket unclaimed by ${member}`)
        .setColor("Yellow");

      return channel.send({ embeds: [unclaimEmbed] });
    }

    if (
      member.id !== ticketData.claimId &&
      ticketData.claimId !== "Not claim"
    ) {
      return reply({
        content: `> ${client.emoji.failed} **Warning:** Only <@${ticketData.claimId}> can unclaim this ticket.`,
        ephemeral: true,
      });
    }

    await Util.renameTicket(
      input,
      client,
      channel,
      `claimed-by-${member.user.username}`,
      false
    );

    await channel
      .edit({
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: ticketData.userId,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          },
          {
            id: member.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          },
          ...supportRoles.map((roleId) => ({
            id: roleId,
            allow: [PermissionFlagsBits.ViewChannel],
            deny: [PermissionFlagsBits.SendMessages],
          })),
        ],
      })
      .catch(() => null);

    ticketData.claimId = member.id;
    await ticketData.save();

    const claimedEmbed = new EmbedBuilder()
      .setDescription(`Ticket claimed by ${member}`)
      .setColor(guild.members.me.displayHexColor);

    await channel.send({ embeds: [claimedEmbed] });
  }

  static async closeTicket(input, client) {
    const isInteraction =
      !!input.isChatInputCommand || !!input.isButton || !!input.isModalSubmit;
    const channel = input.channel;
    const guild = input.guild;
    const member = isInteraction ? input.member : input.member || input.author;

    if (isInteraction && input.message?.deletable) {
      await input.message.delete().catch(() => null);
    }

    const ticketData = await ticketSchema.findOne({ channelId: channel.id });
    if (!ticketData) {
      if (isInteraction) {
        return input.reply({
          content: `**${client.emoji.failed} The ticket will not be found.**`,
          ephemeral: true,
        });
      } else {
        return channel.send(
          `**${client.emoji.failed} The ticket will not be found.**`
        );
      }
    }

    if (!isInteraction && ticketData.status == "Closed") {
      return input.reply({ content: `> **Warning:** ticket already closed` });
    }

    await Util.renameTicket(
      input,
      client,
      channel,
      `closed-${ticketData.ticketNumber}`,
      false
    );

    const supportRoles = channel.permissionOverwrites.cache
      .filter(
        (perm) =>
          perm.type === 0 &&
          perm.allow.has("ViewChannel") &&
          perm.allow.has("SendMessages")
      )
      .map((perm) => perm.id);

    try {
      await channel.edit({
        parent: `1424177835077144577`,
        permissionOverwrites: [
          { id: guild.id, deny: ["ViewChannel"] },
          { id: ticketData.userId, deny: ["ViewChannel"] },
          ...supportRoles.map((roleId) => ({
            id: roleId,
            deny: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          })),
        ],
      });
    } catch (err) {
      console.error("Error Rename Ticket", err.message);
    }

    ticketData.status = "Closed";
    await ticketData.save();

    const closedByEmbed = new EmbedBuilder()
      .setDescription(`Ticket Closed by ${member}`)
      .setColor(guild.members.me.displayHexColor);

    const controlEmbed = new EmbedBuilder().setColor(guild.members.me.displayHexColor).setDescription(
      `\`\`\`Support team ticket controls\`\`\``
    );

    const controlRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("transcriptTicket")
        .setLabel("Transcript")
        .setEmoji("<:download:1431077350992248832>")
        .setStyle(2),

      new ButtonBuilder()
        .setCustomId("reopenTicket")
        .setLabel("Open")
        .setEmoji("<:unlock:1431089804061315142>")
        .setStyle(2),

      new ButtonBuilder()
        .setCustomId("deleteTicket")
        .setLabel("Delete")
        .setEmoji("<:n_delete:1431067505136505006>")
        .setStyle(2)
    );

    await channel.send({ embeds: [closedByEmbed] });
    await channel.send({
      embeds: [controlEmbed],
      components: [controlRow],
    });

    await Util.updateTicketStatus(client, guild);
    client.emit(
      "ticketLog",
      member,
      channel.name,
      "Closed",
      ticketData.panelName
    );
  }

  static async deleteTicket(input, client) {
    const isInteraction =
      !!input.isChatInputCommand || !!input.isButton || !!input.isModalSubmit;
    const channel = input.channel;
    const guild = input.guild;
    const member = isInteraction ? input.member : input.member || input.author;

    if (isInteraction) {
      await input.deferUpdate().catch(() => null);
    }

    const ticketData = await ticketSchema.findOne({ channelId: channel.id });

    if (!ticketData) {
      const replyPayload = {
        content: `**${client.emoji.failed} The ticket will not be found.**`,
        ephemeral: true,
      };

      if (isInteraction) {
        return input.reply(replyPayload).catch(() => null);
      } else {
        return channel.send(replyPayload).catch(() => null);
      }
    }

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setDescription("Ticket will be deleted in a few seconds"),
      ],
    });

    setTimeout(async () => {
      await channel.delete().catch(() => null);
      await Util.updateTicketStatus(client, guild);
      client.emit(
        "ticketLog",
        member,
        channel.name,
        "Deleted",
        ticketData.panelName
      );

      await ticketData.deleteOne();
    }, 5000);
  }

  static async isTicket(channel, client, responder = false) {
    const ticketData = await ticketSchema.findOne({ channelId: channel.id });

    if (!ticketData) {
      if (responder) {
        const content = `**${client.emoji.failed} The ticket will not be found.**`;

        if (responder.reply) {
          await responder.reply({ content, ephemeral: true }).catch(() => {});
        } else if (responder.send) {
          await responder.send({ content }).catch(() => {});
        }
      }

      return null;
    }

    return ticketData;
  }

  static async renameTicket(input, client, channel, newName, replyError) {
    const isInteraction =
      !!input.isChatInputCommand || !!input.isButton || !!input.isModalSubmit;

    const reply = (msgData) => {
      if (!isInteraction) return input.reply(msgData);
      return hasDeferred ? input.followUp(msgData) : input.reply(msgData);
    };

    try {
      let botToken = client.token;
      const response = await fetch(
        `https://discord.com/api/v10/channels/${channel.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bot ${botToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newName }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429 && error.retry_after) {
          const seconds = Math.ceil(error.retry_after);
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;

          if (replyError) {
            await reply({
              content: `**${client.emoji.failed} Channel being renamed too quickly, Timeout: ${minutes}m, ${remainingSeconds}s**`,
              ephemeral: true,
            }).then((msg) => {
              setTimeout(() => {
                msg.delete().catch(() => {});
              }, 3000);
            });
          }
        }
      }
    } catch (err) {
      console.error("error rename", err);
    }
  }

  static async saveTranscript(input, client) {
    const isInteraction =
      !!input.isChatInputCommand || !!input.isButton || !!input.isModalSubmit;
    const channel = input.channel;
    const guild = input.guild;
    const member = isInteraction ? input.member : input.member || input.author;

    const ticketData = await ticketSchema.findOne({ channelId: channel.id });
    if (!ticketData) {
      const replyPayload = {
        content: `**${client.emoji.failed} The ticket will not be found.**`,
        ephemeral: true,
      };
      if (isInteraction) return input.reply(replyPayload).catch(() => null);
      else return channel.send(replyPayload).catch(() => null);
    }

    const savingMsg = isInteraction
      ? await input.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(guild.members.me.displayHexColor)
              .setDescription("**Transcript Saving...**"),
          ],
          fetchReply: true,
        })
      : await channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(guild.members.me.displayHexColor)
              .setDescription("**Transcript Saving...**"),
          ],
        });

    const messages = await channel.messages.fetch({ limit: 100 });
    const sortedMessages = messages.sort(
      (a, b) => a.createdTimestamp - b.createdTimestamp
    );

    let messageCount = 0;
    let attachmentsSaved = 0;
    let attachmentsSkipped = 0;
    const userMap = new Map();

    for (const msg of sortedMessages.values()) {
      messageCount++;

      const userId = msg.author.id;
      const username = `${msg.author.username}#${msg.author.discriminator}`;
      const key = `${username} (${userId})`;

      userMap.set(key, (userMap.get(key) || 0) + 1);

      if (msg.attachments.size > 0) {
        msg.attachments.forEach((att) => {
          if (att.size <= 8 * 1024 * 1024) attachmentsSaved++;
          else attachmentsSkipped++;
        });
      }
    }

    const serverInfo = `<Server-Info>
Server: ${guild.name} (${guild.id})
Channel: ${channel.name} (${channel.id})
Messages: ${messageCount}
Attachments Saved: ${attachmentsSaved}
Attachments Skipped: ${attachmentsSkipped} (due to max file size limits.)`;

    const userInfo = `<User-Info>
${[...userMap.entries()]
  .map(([k, v]) => {
    const match = k.match(/^(.+)#(\d{4}) \((\d+)\)$/);
    if (!match) return `${v} - ${k}`;
    const [_, username, discriminator, id] = match;
    return `${v} - <@${id}> - ${username}#${discriminator}`;
  })
  .join("\n")}`;

    const transcriptContent = `${serverInfo}\n\n${userInfo}`;
    const filePath = path.join(__dirname, `transcript-${channel.id}.html`);
    fs.writeFileSync(filePath, transcriptContent, "utf8");

    const attachment = new AttachmentBuilder(filePath, {
      name: `transcript-${channel.name}.html`,
    });

    const ticketOwner = client.users.cache.get(ticketData.userId);
    const embed = new EmbedBuilder()
      .setAuthor({
        name: ticketOwner.username,
        iconURL: ticketOwner.displayAvatarURL(),
      })
      .setColor(guild.members.me.displayHexColor)
      .addFields(
        {
          name: "Ticket Owner",
          value: `${ticketOwner}`,
          inline: true,
        },
        {
          name: "Ticket Name",
          value: channel.name,
          inline: true,
        },
        {
          name: "Panel Name",
          value: ticketData.panelName,
          inline: true,
        },
        {
          name: "Users in Transcript",
          value:
            [...userMap.entries()]
              .map(([k, v]) => {
                const match = k.match(/^(.+)#(\d{4}) \((\d+)\)$/);
                if (!match) return `${v} - ${k}`;
                const [_, username, discriminator, id] = match;
                return `${v} - <@${id}> - ${username}#${discriminator}`;
              })
              .join("\n")
              .slice(0, 1024) || "No users",
        }
      );

    const att = await discordTranscripts.createTranscript(channel, {
      filename: "transcript.html",
      limit: -1,
      saveImages: true,
    });

    const logCh = client.channels.cache.get(`1425678169066700822`);
    if (logCh) {
      await logCh.send({
        embeds: [embed],
        files: [att, attachment],
      });
      client.emit(
        "ticketLog",
        member,
        channel.name,
        "Transcript Saved",
        ticketData.panelName
      );

      await savingMsg
        .edit({
          embeds: [
            new EmbedBuilder()
              .setColor(guild.members.me.displayHexColor)
              .setDescription(`**Transcript saved to ${logCh}**`),
          ],
        })
        .catch(() => null);
    }

    fs.unlinkSync(filePath);
  }

  static async endGiveaway(id, message, withReply = false) {
    if (withReply) await interaction.deferReply({ ephemeral: true });

    let giveaway = await giveawaysModel.findOne({ givId: id });
    if (!giveaway) return;

    let channel = await message.client.channels
      .fetch(giveaway.chId)
      .catch(() => null);
    if (!channel) return;

    let giveawayMessage = await channel.messages
      .fetch(giveaway.givId)
      .catch(() => null);
    if (!giveawayMessage) return;

    let givEmbed = EmbedBuilder.from(giveawayMessage.embeds[0]);
    let newDesc = givEmbed.data.description
      .replace(/Winners: \*\*\d+\*\*/, `Winners:`)
      .replace("Ends", "Ended");

    if (giveaway.givUsers.length === 0) {
      await giveawayMessage.reply({
        content: "No valid entrants, so a winner could not be determined!",
      });
    } else {
      let winners = giveaway.givUsers
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(giveaway.numberWinners, giveaway.givUsers.length));

      newDesc = givEmbed.data.description
        .replace(
          /Winners: \*\*\d+\*\*/,
          `Winners: ${winners.map((w) => `<@${w}>`).join(", ")}`
        )
        .replace("Ends", "Ended");

      await giveawayMessage.reply({
        content: `Congratulations ${winners
          .map((w) => `<@${w}>`)
          .join(", ")}! You won the **${giveaway.prize}**`,
      });
    }

    await giveawayMessage.edit({
      embeds: [givEmbed.setDescription(newDesc)],
      components: [
        new ActionRowBuilder({
          components: [
            new ButtonBuilder()
              .setLabel("Giveaway Summary")
              .setURL(
                `https://discord.com/channels/${channel.guild.id}/${channel.id}/${giveawayMessage.id}`
              )
              .setStyle(ButtonStyle.Link),
          ],
        }),
      ],
    });

    // await giveawaysModel.deleteOne({ givId: giveawayMessage.id });

    if (withReply) {
      await interaction.editReply({
        content: `Successfully ended giveaway ${giveawayMessage.id}`,
      });
    }
  }

  static async updateTicketStatus(client, guild) {
    let db = client.db;
    let statusData = await db.get(`ticketStatus_${guild.id}`);

    if (!statusData) {
      const totalChannel = await guild.channels.create({
        name: "🎫 Tickets Count: 0000",
        type: 2,
        parent: "1429621953144291498",
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionFlagsBits.Connect] },
        ],
      });

      const openChannel = await guild.channels.create({
        name: "🔓 Tickets Open: 0000",
        type: 2,
        parent: "1429621953144291498",
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionFlagsBits.Connect] },
        ],
      });

      const closedChannel = await guild.channels.create({
        name: "🔒 Tickets Closed: 0000",
        type: 2,
        parent: "1429621953144291498",
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionFlagsBits.Connect] },
        ],
      });

      await db.set(`ticketStatus_${guild.id}`, {
        total: totalChannel.id,
        open: openChannel.id,
        closed: closedChannel.id,
      });

      statusData = await db.get(`ticketStatus_${guild.id}`);
    }

    const tickets = await ticketSchema.find({ guildId: guild.id });

    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "Opened").length;
    const closed = tickets.filter((t) => t.status === "Closed").length;

    try {
      const totalCh = guild.channels.cache.get(statusData.total);
      const openCh = guild.channels.cache.get(statusData.open);
      const closedCh = guild.channels.cache.get(statusData.closed);

      if (totalCh)
        await totalCh.setName(
          `🎫 Tickets Count: ${total.toString().padStart(4, "0")}`
        );
      if (openCh)
        await openCh.setName(
          `🔓 Tickets Opened: ${open.toString().padStart(4, "0")}`
        );
      if (closedCh)
        await closedCh.setName(
          `🔒 Tickets Closed: ${closed.toString().padStart(4, "0")}`
        );
    } catch (err) {
      console.error("Error updating ticket status:", err);
    }
  }
};
