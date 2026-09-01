const chalk = require("chalk");
const mongoose = require("mongoose");

module.exports = (client) => {
  mongoose
    .connect(client.config.mongoDB, { dbName: "NexodeDB" })
    .then(() => {
      client.logger.log(chalk.greenBright(`Connected To Mongodb`), "ready");
    })
    .catch(() => {
      client.logger.log(chalk.redBright(`I can't Access The Mongodb`), "error");
    });
};
