const { readdirSync } = require('fs');
const chalk = require("chalk");

module.exports = (client) => {
  let count = 0;
  readdirSync("./src/Events/").forEach(dir => {
    const eventFiles = readdirSync(`./src/Events/${dir}/`).filter(f => f.endsWith('.js'));
    for (const file of eventFiles) {
      const event = require(`../Events/${dir}/${file}`);
      client.on(event.name, (...args) => event.run(client, ...args));
      count++;
    }
  });
  
  client.logger.log(chalk.blueBright(`Client Events Loaded [${count}]`), "event");
}