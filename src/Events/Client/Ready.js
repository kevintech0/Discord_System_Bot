const chalk = require("chalk");

module.exports = {
  name: "ready",

  /**
   *
   * @param {import("discord.js").Client} client
   */

  run: async (client) => {
    client.logger.log(
      chalk.greenBright(`${client.user.tag} (${client.user.id}) is Ready!`),
      "ready"
    );

    let statuses = [
      { name: "Nexode 🤝 [💻🎨]", type: 0 },
      { name: "Nexode value for money", type: 3 },
      { name: "Nexode is the solution for you", type: 4 },
      { name: "discord.gg/nexode", type: 2 },
    ];

    let i = 0;
    setInterval(() => {
      let status = statuses[i];
      client.user.setPresence({
        activities: [
          {
            name: status.name,
            type: status.type,
          },
        ],
        status: "online",
      });
      i = (i + 1) % statuses.length;
    }, 60000);

    await require("../../Handlers/LoadGiveaways")(client);
    await require("../../Handlers/LoadWelcome")(client);
  },
};
