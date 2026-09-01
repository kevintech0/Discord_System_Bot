const { EmbedBuilder } = require("discord.js");
const config = require("../Config.js");
const chalk = require("chalk");

/**
 * @param {import("discord.js").Client} client
 */

module.exports = async (client) => {
  function sendErrorLog(title, error) {
    console.log(chalk.red(`[ERROR] | [${title}] | ===============`));
    console.error(error);
    console.log(chalk.red(`[ERROR] | [${title}] | ===============`));

    let errorLogsChannel = client.channels.cache.get(config.errorLogsChannel);
    if (errorLogsChannel) {
      const errEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`${title} => Detected:`)
        .setDescription(`\`\`\`${error.stack || error}\`\`\``)
        .setTimestamp();

      errorLogsChannel.send({ embeds: [errEmbed] })
    }
  }

  process.on("beforeExit", (code) => sendErrorLog("BeforeExit", code));
  process.on("exit", (code) => sendErrorLog("Exit", code));
  process.on("unhandledRejection", (reason, promise) => sendErrorLog("UnhandledRejection", reason));
  process.on("rejectionHandled", (promise) => sendErrorLog("RejectionHandled", promise));
  process.on("uncaughtException", (err, origin) => sendErrorLog("UncaughtException", err));
  process.on("uncaughtExceptionMonitor", (err, origin) => sendErrorLog("UncaughtExceptionMonitor", err));
  process.on("warning", (warning) => sendErrorLog("Warning", warning));

  process.on("multipleResolves", () => { });
  process.removeAllListeners("warning");

  client.logger.log(chalk.greenBright(`Error Handler Loaded!`));
};
