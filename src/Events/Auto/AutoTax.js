const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "messageCreate",

  /**
   * @param {import("discord.js").Client} client
   * @param {import("discord.js").Message} message
   */
  run: async (client, message) => {
    if (message.channel.id !== "1427827314062000128") return;

    const input = message.content.toLowerCase().trim();
    if (!/^[0-9]*\.?[0-9]+[kmb]?$/.test(input)) return;

    let price;
    if (input.endsWith("k")) {
      price = parseFloat(input.replace("k", "")) * 1000;
    } else if (input.endsWith("m")) {
      price = parseFloat(input.replace("m", "")) * 1000000;
    } else if (input.endsWith("b")) {
      price = parseFloat(input.replace("b", "")) * 1000000000;
    } else {
      price = parseFloat(input);
    }

    if (isNaN(price) || price <= 0) return;

    const withTax = Math.round(price * 1.0525);
    const withoutTax = Math.round(price / 1.0525);
    const midNoTax = Math.round(price * 1.108);
    const midWithTax = Math.round(price * 1.158);
    const midPercent = Math.round(midNoTax * 0.045);
    const convertWithoutTax = Math.round(price * 0.95);

    const embed = new EmbedBuilder()
      .setColor(message.guild.members.me.displayHexColor)
      .setThumbnail(message.guild.iconURL())
      .addFields(
        { name: "<a:n_arrow:1430366247450837002> Price without tax:", value: `> \`${price}\`` },
        { name: "<a:n_arrow:1430366247450837002> Price with tax:", value: `> \`${withTax}\`` },
        { name: "<a:n_arrow:1430366247450837002> Middleman (no fee):", value: `> \`${midNoTax}\`` },
        { name: "<a:n_arrow:1430366247450837002> Middleman (with fee):", value: `> \`${midWithTax}\`` },
        { name: "<a:n_arrow:1430366247450837002> Middleman fee:", value: `> \`${midPercent}\`` },
        { name: "<a:n_arrow:1430366247450837002> Conversion without tax:", value: `> \`${convertWithoutTax}\`` }
      )
      .setFooter({
        text: message.guild.name,
        iconURL: message.guild.iconURL(),
      })
      .setTimestamp();

    let embedLine = new EmbedBuilder()
      .setColor(message.guild.members.me.displayHexColor)
      .setImage(`https://i.ibb.co/k2NPsjjm/Nexode-Line.png`);

    await message.reply({ embeds: [embed, embedLine], files: [attach] });
  },
};
