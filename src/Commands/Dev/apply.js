const { ButtonBuilder, ActionRowBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "apply",
  description: "Send apply message",
  aliases: ["sa"],
  usage: "",
  args: false,
  permissions: {
    bot: [],
    user: [],
  },
  settings: {
    isOwner: true,
    isCooldown: 10,
  },

  /**
   * @param { import("discord.js").Message } message
   * @param { import("discord.js").Client } client
   * @param { String } args
   * @param { String } prefix
   */

  execute: async (message, client, args, prefix) => {
    let embed = new EmbedBuilder()
      .setTitle("Seller Application System")
      .setColor(message.guild.members.me.displayHexColor)
      .setFooter({
        text: "Nexode Services © 2025 | Empowering Freelancers",
        iconURL: message.guild.iconURL(),
      })
      .setImage("https://i.ibb.co/kgdTxr3K/Nexode-Apply-Info.png")
      .setDescription(`> **Got talent in coding, design, or development?**
> Join the **Nexode Seller** and start earning from your skills!

**<:n_done:1431067075916595210> What you'll get:**
- Verified Seller badge
- Access to client requests
- Full admin protection during deals
- Build your reputation inside the community

**<:n_error:1431067073886556242> Before applying:**
> Please read and agree to our **Seller Application Rules**.  
> Providing fake or misleading info may lead to **instant rejection** or **blacklist**.

**<:n_rocket:1431072922738626590> Click the button below to start your application and showcase your talent!**`);

    let rowBut = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("applyButton")
        .setLabel("Apply Now")
        .setEmoji("1430201537254133903")
        .setStyle(2)
    );

    message.channel.send({
      embeds: [embed],
      components: [rowBut],
    });
  },
};
