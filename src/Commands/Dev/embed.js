const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  ChannelSelectMenuBuilder,
} = require("discord.js");

module.exports = {
  name: "embed",
  description: "To make embed message",
  aliases: [],
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
   * @param { String } args
   * @param { import("discord.js").Client } client
   * @param { String } prefix
   */

  execute: async (message, client, args, prefix) => {
    const m = args.join(" ");

    if (!m) {
      return message.reply({
        content: `**${client.emoji.failed} Please write a message**`,
      });
    }

    let newEmbed = new EmbedBuilder().setDescription(m);
    let embedsMenu = new ActionRowBuilder({
      components: [
        new StringSelectMenuBuilder({
          customId: `embedsMenu`,
          placeholder: `Select the items`,
          options: [
            {
              label: `Add Author`,
              emoji: `➕`,
              value: `embedAuthor`,
            },
            {
              label: `Add Title`,
              emoji: `➕`,
              value: `embedTitle`,
            },
            {
              label: `Add Url`,
              emoji: `➕`,
              value: `embedURL`,
            },
            {
              label: `Add Color`,
              emoji: `➕`,
              value: `embedColor`,
            },
            {
              label: `Add Thumbnail`,
              emoji: `➕`,
              value: `embedThumbnail`,
            },
            {
              label: `Add Image`,
              emoji: `➕`,
              value: `embedImage`,
            },
            {
              label: `Add Footer`,
              emoji: `➕`,
              value: `embedFooter`,
            },
            {
              label: `Add Timestamp`,
              emoji: `➕`,
              value: `embedTimestamp`,
            },
            {
              label: `Add Fields`,
              emoji: `➕`,
              value: `embedFields`,
            },
          ],
        }),
      ],
    });

    let rowButs = new ActionRowBuilder({
      components: [
        new ButtonBuilder({
          customId: `sendMessageBut`,
          label: `Send`,
          style: 3,
        }),

        new ButtonBuilder({
          customId: `resetEmbedBut`,
          label: `Reset`,
          style: 4,
        }),

        new ButtonBuilder({
          customId: `addMsgBut`,
          label: `Add a message`,
          style: 1,
        }),
      ],
    });

    let msg = await message
      .reply({
        embeds: [newEmbed],
        components: [embedsMenu, rowButs],
      })
      .catch(() => null);

    let c = msg.createMessageComponentCollector();
    c.on("collect", async (i) => {
      if (i.isStringSelectMenu()) {
        const modalsConfig = {
          embedAuthor: {
            title: "Embed Author",
            components: [
              {
                customId: "authorNameInput",
                label: "Name",
              },
              {
                customId: "authorIconInput",
                label: "Image link (optional)",
                required: false,
              },
            ],
          },
          embedTitle: {
            title: "Embed Title",
            components: [
              {
                customId: "embedTitleInput",
                label: "Title",
              },
            ],
          },
          embedColor: {
            title: "Embed Color",
            components: [
              {
                customId: "embedColorInput",
                label: "Color",
              },
            ],
          },
          embedThumbnail: {
            title: "Embed Thumbnail",
            components: [
              {
                customId: "embedThumbnailInput",
                label: "Thumbnail Link",
              },
            ],
          },
          embedImage: {
            title: "Embed Image",
            components: [
              {
                customId: "embedImageInput",
                label: "Image link",
              },
            ],
          },
          embedFooter: {
            title: "Embed Footer",
            components: [
              {
                customId: "footerNameInput",
                label: "Name",
              },
              {
                customId: "footerIconInput",
                label: "Image link (optional)",
                required: false,
              },
            ],
          },
          embedURL: {
            title: "Embed Url",
            components: [
              {
                customId: "embedURLInput",
                label: "Link",
              },
            ],
          },
          embedFields: {
            title: "Embed Fields",
            components: [
              {
                customId: "fieldNameInput",
                label: "Name",
              },
              {
                customId: "fieldValueInput",
                label: "Value",
              },
              {
                customId: "fieldInlineInput",
                label: "InLine (optional)",
                required: false,
              },
            ],
          },
        };

        const value = i.values[0];

        if (value === "embedTimestamp") {
          const newEmbed = EmbedBuilder.from(
            i.message.embeds[0]
          ).setTimestamp();
          await i.message.edit({ embeds: [newEmbed] }).catch(() => null);
          return await i.deferUpdate().catch(() => null);
        }

        if (value === "embedURL" && !i.message.embeds[0]?.data?.title) {
          return i.reply({
            content: `**${client.emoji.failed} No title**`,
            ephemeral: true,
          });
        }

        const config = modalsConfig[value];

        if (config) {
          const rows = config.components.map((comp) => {
            return new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId(comp.customId)
                .setLabel(comp.label)
                .setStyle(1)
                .setRequired(comp.required !== false)
            );
          });

          const modal = new ModalBuilder()
            .setCustomId(`${value}Modal`)
            .setTitle(config.title)
            .setComponents(rows);

          await i.showModal(modal);
        }
      } else if (i.isButton()) {
        if (i.customId == "sendMessageBut") {
          let row = new ActionRowBuilder({
            components: [
              new ChannelSelectMenuBuilder({
                customId: `channelsMenu`,
                placeholder: `Select the channel you want to send the message to.`,
                channelTypes: [0],
              }),
            ],
          });

          let msg = await i.update({ components: [row] });
          let collector = msg.createMessageComponentCollector();
          collector.on("collect", async (c) => {
            if (c.isChannelSelectMenu()) {
              if (c.customId == "channelsMenu") {
                let embed = c.message.embeds[0];
                let channel = await client.channels
                  .fetch(c.values[0])
                  .catch(() => null);

                if (!channel)
                  return c.update({
                    content: `**${client.emoji.failed} I can't find this channel**`,
                  });

                await channel.sendTyping();
                await channel.send({
                  content: i.message.content,
                  embeds: [embed],
                });

                await c
                  .update({
                    content: `**${client.emoji.done} Message sent to the channel successfully**`,
                    embeds: [],
                    components: [],
                  })
                  .catch(() => null);
              }
            }
          });
        } else if (i.customId == "resetEmbedBut") {
          if (i.message.embeds.length > 0) {
            let resetEmbed = i.message.embeds[0];

            let newEmbed = {
              description: resetEmbed.description,
            };

            await i.message
              .edit({ content: null, embeds: [newEmbed] })
              .catch(() => null);

            await i.deferUpdate().catch(() => null);
          } else {
            await i.reply({
              content: `${client.emoji.failed} No inclusion found to reset`,
              ephemeral: true,
            });
          }
        } else if (i.customId == "addMsgBut") {
          let messageRow = new ActionRowBuilder({
            components: [
              new TextInputBuilder({
                customId: `messageInput`,
                label: `Message`,
                style: 2,
              }),
            ],
          });

          if (i.message.content && i.message.content.length > 0) {
            messageRow.components[0].data.value = i.message.content;
          }

          await i.showModal(
            new ModalBuilder({
              customId: `addMsgModal`,
              title: `Message Content`,
              components: [messageRow],
            })
          );
          await i
            .awaitModalSubmit({ time: 0 })
            .then(async (m) => {
              let message = m.fields.getTextInputValue("messageInput");

              await i.message.edit({ content: message }).catch(() => null);
              await m.deferUpdate().catch(() => null);
            })
            .catch(() => null);
        }
      }
    });
  },
};
