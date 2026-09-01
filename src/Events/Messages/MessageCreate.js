const {
  EmbedBuilder,
  Message,
  Client,
  PermissionsBitField,
} = require("discord.js");
const { cooldown } = require("../../Utils/Functions.js");
const { prefix } = require("../../Config.js");

module.exports = {
  name: "messageCreate",

  /**
   *
   * @param {Client} client
   * @param {Message} message
   * @returns
   */

  run: async (client, message) => {
    if (
      !message.guild ||
      (message.author.bot && message.author.id !== client.user.id) ||
      message.channel.type === 1
    )
      return;

    const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);
    if (message.content.match(mention)) {
      const embed = new EmbedBuilder().setDescription(
        `**› My prefix in this server is \`${prefix}\`**\n**› You can see my all commands type \`${prefix}\`help**`
      );
      message.channel.send({ embeds: [embed] });
    }
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixRegex = new RegExp(
      `^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`
    );
    if (!prefixRegex.test(message.content)) return;
    const [matchedPrefix] = message.content.match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command =
      client.commands.get(commandName) ||
      client.commands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
      );

    if (!command) return;

    if (
      !message.guild.members.me.permissions.has(
        PermissionsBitField.resolve("SendMessages")
      )
    )
      return await message.author.dmChannel
        .send({
          content: `I don't have **\`SEND_MESSAGES\`** permission in <#${message.channelId}> to execute this **\`${command.name}\`** command.`,
        })
        .catch(() => {});

    if (
      !message.guild.members.me.permissions.has(
        PermissionsBitField.resolve("ViewChannel")
      )
    )
      return;

    if (
      !message.guild.members.me.permissions.has(
        PermissionsBitField.resolve("EmbedLinks")
      )
    )
      return await message.channel
        .send({
          content: `I don't have **\`EMBED_LINKS\`** permission in <#${message.channelId}> to execute this **\`${command.name}\`** command.`,
        })
        .catch(() => {});

    const embed = new EmbedBuilder().setColor("Red");
    if (command.args && !args.length) {
      let embedUsage = new EmbedBuilder()
        .setTitle(`Command: ${command.name}`)
        .setDescription(command.description);

      if (command?.aliases && command?.aliases.length > 0)
        embedUsage.addFields({
          name: `Aliases:`,
          value: command.aliases.join(", "),
        });

      if (command.usage) {
        embedUsage.addFields({
          name: `Usage:`,
          value: `\`${prefix}${command.name} ${command.usage}\``,
        });
      }

      if (command.examples && command.examples.length > 0) {
        embedUsage.addFields({
          name: `Examples:`,
          value: command.examples
            .map(
              (example) =>
                `${prefix}${command.name} ${example
                  .replace("[user]", message.author)
                  .replace("[userId]", message.author.id)
                  .replace("[channel]", message.channel)
                  .replace("[channelId]", message.channel.id)}`
            )
            .join("\n"),
        });
      }

      return message.reply({ embeds: [embedUsage] });
    }

    if (command.permissions.bot) {
      if (
        !message.guild.members.me.permissions.has(
          PermissionsBitField.resolve(command.permissions.bot || [])
        )
      ) {
        embed.setDescription(
          `I don't have **\`${command.permissions.bot}\`** permission in <#${message.channelId}> to execute this **\`${command.name}\`** command.`
        );
        return message.channel.send({ embeds: [embed] });
      }
    }

    if (command.permissions.user) {
      if (
        !message.member.permissions.has(
          PermissionsBitField.resolve(command.permissions.user || [])
        )
      ) {
        embed.setDescription(
          `You don't have **\`${command.permissions.user}\`** permission in <#${message.channelId}> to execute this **\`${command.name}\`** command.`
        );
        return message.channel.send({ embeds: [embed] });
      }
    }

    if (command.settings.isOwner && !client.owner.includes(message.author.id)) {
      embed.setDescription(
        `**${client.emoji.failed} This command can only be used by the bot owner(s): ${client.owner
          .map((o) => `<@${o}>`)
          .join(", ")}**`
      );
      return message.reply({ embeds: [embed] });
    }

    if (
      command.settings.isStaff &&
      !message.member.roles.cache.has("1424177786259505213")
    ) {
      return message.reply({ content: `**${client.emoji.failed} This command is restricted to staff members only.**` });
    }

    if (
      cooldown(client, message.member.id, command) &&
      !client.owner.includes(message.member.id)
    ) {
      let timeLeft = cooldown(client, message.member.id, command);
      return message.channel.send({
        content: `**@${message.author.username}**, Cool down (**${timeLeft}** left)`,
      });
    }

    try {
      command.execute(message, client, args, prefix);
      if (command.settings?.deleteCmd) {
        setTimeout(() => {
          message.delete().catch(() => {});
        }, 1000);
      }
    } catch (error) {
      console.log(error);
      embed.setDescription(
        "There was an error executing that command.\nI have contacted the owner of the bot to fix it immediately."
      );
      return message.channel.send({ embeds: [embed] });
    }
  },
};
