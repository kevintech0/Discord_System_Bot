const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const ticketSchema = require("../../Database/tickets.js");

module.exports = {
  name: "clean",
  description: "Delete/Close the tickets in the current guild",
  aliases: [],
  usage: "",
  args: false,
  permissions: {
    bot: ["ManageChannels"],
    user: ["ManageChannels"],
  },
  settings: {
    isOwner: false,
    isCooldown: 10,
  },

  /**
   * @param { import("discord.js").Message } message
   * @param { String[] } args
   * @param { import("discord.js").Client } client
   * @param { String } prefix
   */

  execute: async (message, client, args, prefix) => {
    let { guild, author } = message;
    let tickets = await ticketSchema.find({ guildId: guild.id });
    if (!tickets.length) {
      return message.reply({
        content: `**${client.emoji.failed} No tickets found on the server.**`,
      });
    }

    let embed = new EmbedBuilder()
      .setTitle("Ticket Cleaner Panel")
      .setDescription(
        "Manage your tickets using the interactive options below."
      )
      .setColor(guild.members.me.displayHexColor)
      .addFields(
        {
          name: "Close Tickets",
          value:
            "Select from multiple options:\n- Close all tickets\n- Only open tickets\n- Tickets by panel name",
          inline: true,
        },
        {
          name: "Delete Tickets",
          value:
            "Select from multiple options:\n- Delete all tickets\n- Only closed/open tickets\n- Tickets by panel name",
          inline: true,
        },
        {
          name: "Cancel",
          value: "Stops the cleaning process. No tickets will be affected.",
        }
      )
      .setFooter({ text: "Ticket Management System", iconURL: guild.iconURL() })
      .setTimestamp();

    let row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("closeTickets")
        .setLabel("Close Tickets")
        .setStyle(1),

      new ButtonBuilder()
        .setCustomId("deleteTickets")
        .setLabel("Delete Tickets")
        .setStyle(4),

      new ButtonBuilder()
        .setCustomId("cancelClean")
        .setLabel("Cancel")
        .setStyle(2)
    );

    let msg = await message.reply({ embeds: [embed], components: [row] });

    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === author.id,
      time: 60_000,
    });

    collector.on("collect", async (i) => {
      if (i.customId == "closeTickets") {
        let panels = [...new Set(tickets.map((t) => t.panelName))];

        let select = new StringSelectMenuBuilder()
          .setCustomId("selectCloseType")
          .setPlaceholder("Choose which tickets to close...")
          .addOptions([
            {
              label: "Close All Tickets",
              value: "All",
            },
            {
              label: "Close Open Tickets",
              value: "Opened",
            },
            ...panels.map((p) => ({
              label: `Close [ ${p} ] Tickets`,
              value: p,
            })),
          ]);

        let selectRow = new ActionRowBuilder().addComponents(select);

        let msg = await i.reply({
          components: [selectRow],
          flags: [64],
          fetchReply: true,
        });

        let c = msg.createMessageComponentCollector();
        c.on("collect", async (x) => {
          if (!x.isStringSelectMenu() || x.customId !== "selectCloseType")
            return;

          let type = x.values[0];
          let toDelete = [];

          if (type === "All") {
            toDelete = tickets;
          } else if (type === "Opened") {
            toDelete = tickets.filter((t) => t.status === "Opened");
          } else {
            toDelete = tickets.filter((t) => t.panelName === type);
          }

          if (!toDelete || toDelete.length === 0) {
            return await x.update({
              content: `**${client.emoji.failed} No tickets apply to this condition.**`,
              components: [],
            });
          }

          await x.update({
            content: `${client.emoji.loading} **Please wait...**`,
            components: [],
          });

          for (let ticket of toDelete) {
            let ch = guild.channels.cache.get(ticket.channelId);
            if (ch) {
              try {
                const sentMessage = await ch
                  .send({
                    content: `${prefix}close`,
                  })
                  .catch(() => null);

                sentMessage.delete().catch(() => null);
              } catch (err) {
                console.error(
                  `Failed to send welcome message in ${ch.id}`,
                  err
                );
              }
            }
          }

          await x.editReply({
            content: `**${client.emoji.done} Deleted \`${toDelete.length}\` tickets (${type}).**`,
            components: [],
          });
        });
      }

      if (i.customId == "deleteTickets") {
        let panels = [...new Set(tickets.map((t) => t.panelName))];

        let select = new StringSelectMenuBuilder()
          .setCustomId("selectDeleteType")
          .setPlaceholder("Choose which tickets to delete...")
          .addOptions([
            {
              label: "Delete All Tickets",
              value: "All",
            },
            {
              label: "Delete Closed Tickets",
              value: "Closed",
            },
            {
              label: "Delete Open Tickets",
              value: "Opened",
            },
            ...panels.map((p) => ({
              label: `Delete [ ${p} ] Tickets`,
              value: p,
            })),
          ]);

        let selectRow = new ActionRowBuilder().addComponents(select);

        let msg = await i.reply({
          components: [selectRow],
          flags: [64],
          fetchReply: true,
        });

        let c = msg.createMessageComponentCollector();
        c.on("collect", async (x) => {
          if (!x.isStringSelectMenu() || x.customId !== "selectDeleteType")
            return;

          let type = x.values[0];
          let toDelete = [];

          if (type === "All") {
            toDelete = tickets;
          } else if (type === "Closed") {
            toDelete = tickets.filter((t) => t.status === "Closed");
          } else if (type === "Opened") {
            toDelete = tickets.filter((t) => t.status === "Opened");
          } else {
            toDelete = tickets.filter((t) => t.panelName === type);
          }

          if (!toDelete || toDelete.length === 0) {
            return await x.update({
              content: `**${client.emoji.failed} No tickets apply to this condition.**`,
              components: [],
            });
          }

          await x.update({
            content: `${client.emoji.loading} **Please wait...**`,
            components: [],
          });

          for (let ticket of toDelete) {
            let ch = guild.channels.cache.get(ticket.channelId);
            if (ch) {
              try {
                const sentMessage = await ch
                  .send({
                    content: `${prefix}delete`,
                  })
                  .catch(() => null);

                sentMessage.delete().catch(() => null);
              } catch (err) {
                console.error(
                  `Failed to send welcome message in ${ch.id}`,
                  err
                );
              }
            }
          }

          await x.editReply({
            content: `**${client.emoji.done} Deleted \`${toDelete.length}\` tickets (${type}).**`,
            components: [],
          });
        });
      }

      if (i.customId === "cancelClean") {
        await i.message.delete().catch(() => null);
      }
    });

    collector.on("end", () => {
      if (msg.editable) {
        msg.edit({ components: [] }).catch(() => {});
      }
    });
  },
};
