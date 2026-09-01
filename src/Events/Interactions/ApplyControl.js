const {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
} = require("discord.js");
const sellersSchema = require("../../Database/sellers");

module.exports = {
  name: "interactionCreate",

  /**
   * @param {import("discord.js").Interaction} interaction
   * @param {import("discord.js").Client} client
   */
  run: async (client, interaction) => {
    const { guild, member, customId, channel, message } = interaction;
    if (!interaction.isButton()) return;

    async function replyError(msg, ephemeral = true) {
      return interaction.reply({
        content: `**${client.emoji.failed} ${msg}**`,
        flags: ephemeral ? [64] : [],
      });
    }

    function canTest(appData) {
      return appData?.tester === member.id;
    }

    let db = client.db;
    switch (customId) {
      case "acceptApply": {
        let getData = await db.get(`applications_${guild.id}`);
        if (!getData || !getData.length) return;

        let appData = getData.find((d) => d.applyId === message.id);
        if (!appData)
          return replyError("No application data found for this message.");

        let seller = await guild.members
          .fetch(appData.userId)
          .catch(() => null);
        if (!seller)
          return replyError("The applicant is no longer in the server.");

        await interaction.reply({
          content: `**${client.emoji.loading} Creating test ticket...**`,
          flags: [64],
        });

        const ticketChannel = await guild.channels.create({
          name: `skill-test-${seller.user.username}`,
          type: 0,
          permissionOverwrites: [
            {
              id: guild.roles.everyone,
              deny: [PermissionFlagsBits.ViewChannel],
            },
            {
              id: seller.id,
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

        const embed = new EmbedBuilder()
          .setTitle("Seller Skill Test")
          .setColor(guild.members.me.displayHexColor)
          .setDescription(
            `<:n_heart:1431066073545052263> Welcome ${seller}!

You’ve been **accepted for the Skill Test Phase** to become a verified seller in **${guild.name}**

<:n_support:1431067405525975131> **Your Assigned Tester:** ${member}

<:n_openfolder:1431069462362194061> **How it works:**
> ${member} will assign you a short task based on your specialization.  
> Please complete it within **24 hours** after receiving the task.

**<:n_rules:1431067280346714132> Rules:**
- Don’t copy code or designs from the internet.  
- Be respectful and cooperative with ${member}.  
- If you stay inactive for 24 hours, the ticket will be closed.

<:n_rocket:1431072922738626590> Please wait **Tester** to send your test task and further instructions.`
          )
          .setFooter({
            text: "Nexode Seller System • All rights reserved",
            iconURL: guild.iconURL(),
          })
          .setTimestamp();

        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("sellerPass")
            .setLabel("Pass")
            .setEmoji(client.emoji.done)
            .setStyle(3),
          new ButtonBuilder()
            .setCustomId("sellerFail")
            .setLabel("Fail")
            .setEmoji(client.emoji.failed)
            .setStyle(4),
          new ButtonBuilder()
            .setCustomId("sellerClose")
            .setLabel("Close")
            .setEmoji("<:lock:1431075733471498320>")
            .setStyle(2)
        );

        await ticketChannel.send({
          content: `-# ${seller} ${member}`,
          embeds: [embed],
          components: [buttons],
        });

        appData.ticketId = ticketChannel.id;
        appData.status = "Testing";
        appData.tester = member.id;
        await db.set(`applications_${guild.id}`, getData);

        return interaction.editReply({
          content: `**${client.emoji.done} Successfully created a skill test ticket for ${seller}.**`,
        });
      }

      case "rejectApply": {
        let getData = await db.get(`applications_${guild.id}`);
        if (!getData || !getData.length) return;

        let appData = getData.find((d) => d.applyId === message.id);
        if (!appData)
          return replyError("No application data found for this message.");

        const reasonRow = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("reasonInput")
            .setLabel("Reason")
            .setPlaceholder(
              "Write the reason here (e.g., incomplete info, lack of experience...)"
            )
            .setStyle(2)
        );

        const modal = new ModalBuilder()
          .setCustomId("rejectModal")
          .setTitle("Reject Application")
          .addComponents(reasonRow);

        await interaction.showModal(modal);

        const submitted = await interaction
          .awaitModalSubmit({
            filter: (i) =>
              i.customId === "rejectModal" && i.user.id === member.id,
            time: 10 * 60 * 1000,
          })
          .catch(() => null);

        if (!submitted) return;

        const reason = submitted.fields.getTextInputValue("reasonInput");
        const seller = guild.members.cache.get(appData.userId);
        const rejectEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Application Rejected")
          .setDescription(
            `<:n_heart:1431066073545052263> Hello ${seller},\n\nWe appreciate your interest in joining our seller team at **${guild.name}**.\n\nUnfortunately, your application has been **rejected**.\n\nYou can reapply again after **7 days** if you wish to improve your application.`
          )
          .addFields({
            name: `<:reason:1431130838887567401> Reason`,
            value: `\`\`\`${reason}\`\`\``,
          })
          .setFooter({ text: "Nexode Seller System", iconURL: guild.iconURL() })
          .setTimestamp();

        if (seller) {
          await seller.send({ embeds: [rejectEmbed] }).catch(() => null);
        }

        appData.status = "Rejected";
        await db.set(`applications_${guild.id}`, getData);

        return submitted.reply({
          content: `**${client.emoji.done} Application rejected successfully.**`,
          flags: [64],
        }).catch(() => null);
      }

      case "infoApply": {
        let getData = await db.get(`applications_${guild.id}`);
        if (!getData || !getData.length) return;

        let appData = getData.find((d) => d.applyId === message.id);
        if (!appData) return;
        let seller = await client.users.fetch(appData.userId).catch(() => null);

        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${seller.displayName} • Seller Info`,
            iconURL: seller.displayAvatarURL(),
          })
          .setThumbnail(seller.displayAvatarURL())
          .setColor(appData.blacklist ? "Red" : "#6b9d4f")
          .setDescription(
            `**Application Information**\n` +
              `Here’s the detailed information for ${seller}.\n\n` +
              `> **Status:** \`${appData.status}\`\n` +
              `> **Blacklist:** ${appData.blacklist ? "🔴 On" : "🟢 Off"}`
          )
          .addFields(
            {
              name: "Apply Owner",
              value: `${seller}`,
              inline: true,
            },
            {
              name: "Owner ID",
              value: `\`${seller.id}\``,
              inline: true,
            },
            {
              name: "Account Created",
              value: `<t:${Math.floor(seller.createdAt / 1000)}:R>`,
              inline: true,
            },
            {
              name: "Applied Since",
              value: `<t:${Math.floor(appData.date / 1000)}:R>`,
              inline: true,
            }
          );

        if (appData.tester && appData.ticketId) {
          embed.addFields(
            {
              name: "Tester",
              value: `<@${appData.tester}>`,
              inline: true,
            },
            {
              name: "Ticket Channel",
              value: `<#${appData.ticketId}>`,
              inline: true,
            }
          );
        }

        return interaction.reply({ embeds: [embed], flags: [64] });
      }

      case "deleteApply": {
        let getData = await db.get(`applications_${guild.id}`);
        if (!getData || !getData.length) return;

        const rows = message.components.map((row) => {
          const components = row.components.map((button) =>
            ButtonBuilder.from(button.data).setDisabled(true)
          );

          return new ActionRowBuilder({ components });
        });

        getData = getData.filter((t) => t.applyId !== message.id);

        if (getData.length === 0) {
          await db.delete(`applications_${guild.id}`);
        } else {
          await db.set(`applications_${guild.id}`, getData);
        }

        return interaction.update({
          components: rows,
        });
      }

      case "blacklistApply": {
        let getData = await db.get(`applications_${guild.id}`);
        if (!getData || !getData.length) return;

        let appData = getData.find((d) => d.applyId === message.id);
        if (!appData)
          return replyError("No application data found for this message.");

        const seller = await guild.members
          .fetch(appData.userId)
          .catch(() => null);
        if (!seller)
          return replyError("The applicant is no longer in the server.");

        const previousState = appData.blacklist === true;
        appData.blacklist = !previousState;
        await db.set(`applications_${guild.id}`, getData);
        const color = appData.blacklist ? "Red" : "Green";

        const embed = new EmbedBuilder()
          .setColor(color)
          .setTitle(
            appData.blacklist ? "User Blacklisted" : "Blacklist Removed"
          )
          .setDescription(
            appData.blacklist
              ? `User <@${seller.id}> has been **blacklisted** and will no longer be able to apply for seller roles.`
              : `User <@${seller.id}> has been **removed from blacklist** and can now apply again.`
          )
          .setFooter({ text: "Nexode Seller System • Blacklist Update" })
          .setTimestamp();

        return interaction.reply({
          embeds: [embed],
          flags: [64],
        });
      }

      case "sellerPass": {
        let data = await db.get(`applications_${guild.id}`);
        if (!data || !data.length) return null;

        const appData = data.find((d) => d.ticketId === channel.id);
        if (!appData)
          return replyError("No application data found for this message.");

        if (!canTest(appData))
          return replyError(
            "You cannot grade applications as you are a staff member."
          );

        const seller = await guild.members
          .fetch(appData.userId)
          .catch(() => null);
        if (!seller)
          return replyError("The applicant is no longer in the server.");

        const baseRoles = ["1424177786259505213", "1424177785261265049"];
        const extraRoles = appData.roleLabel.roles.filter((r) =>
          guild.roles.cache.has(r)
        );
        await seller.roles.add([...baseRoles, ...extraRoles]).catch(() => null);

        appData.status = "Verified";
        await db.set(
          `applications_${guild.id}`,
          await db.get(`applications_${guild.id}`)
        );

        const successEmbed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("Skill Test Passed!")
          .setDescription(
            `Congratulations <@${seller.id}>!
You’ve successfully passed your **Skill Test** and are now a **Verified Seller** in **${guild.name}**!
Start receiving client requests and build your reputation.`
          )
          .setFooter({ text: "Nexode Seller System", iconURL: guild.iconURL() })
          .setTimestamp();

        sellersSchema.create({
          guildId: guild.id,
          sellerId: seller.id,
          name: appData.fullName,
          age: appData.age,
          country: appData.country,
          skills: appData.roleLabel.roles,
          verified: true,
        });

        const updatedComponents = message.components.map(
          (row) =>
            new ActionRowBuilder({
              components: row.components.map((btn) =>
                ButtonBuilder.from(btn.data).setDisabled(
                  !["sellerClose"].includes(btn.customId)
                )
              ),
            })
        );

        channel.send({ embeds: [successEmbed] });

        return interaction.update({
          components: updatedComponents,
        });
      }

      case "sellerFail": {
        const data = await db.get(`applications_${guild.id}`);
        if (!data || !data.length) return null;

        const appData = data.find((d) => d.ticketId === channel.id);
        if (!appData)
          return replyError("No application data found for this message.");

        if (!canTest(appData))
          return replyError(
            "You cannot grade applications as you are a staff member."
          );

        const seller = await guild.members
          .fetch(appData.userId)
          .catch(() => null);
        if (!seller)
          return replyError("The applicant is no longer in the server.");

        const failEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Seller Application - Rejected Skill Test")
          .setDescription(
            `Unfortunately, your seller application has been **rejected** after the skill test.

> **Tested by:** <@${appData.tester}>
> **Server:** ${guild.name}

If you believe this was a mistake, you may reapply after **7 days** with stronger examples or improvements.`
          )
          .setFooter({ text: "Nexode Seller System • Application Rejected" })
          .setTimestamp();

        await seller.send({ embeds: [failEmbed] }).catch(() => null);

        appData.status = "Failed";
        await db.set(
          `applications_${guild.id}`,
          await db.get(`applications_${guild.id}`)
        );

        return interaction.reply({
          content: `**${client.emoji.done} [ ${seller} ] has been marked as failed in the skill test.**`,
          flags: [64],
        });
      }

      case "sellerClose": {
        let data = await db.get(`applications_${guild.id}`);
        if (!data || !data.length) return null;

        let appData = data.find((d) => d.ticketId === channel.id);
        if (!appData)
          return replyError("No application data found for this message.");

        if (!canTest(appData))
          return replyError(
            "You cannot grade applications as you are a staff member."
          );

        await interaction.deferUpdate().catch(() => null);
        await channel.send({
          content: "Ticket will be closed in **5 seconds**...",
        });

        data = data.filter((t) => t !== appData);

        if (data.length === 0) {
          await db.delete(`applications_${guild.id}`);
        } else {
          await db.set(`applications_${guild.id}`, data);
        }

        setTimeout(() => channel.delete().catch(() => null), 5000);
        break;
      }

      default:
        return;
    }
  },
};
