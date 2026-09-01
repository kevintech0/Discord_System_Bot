const { readdirSync } = require('fs');
const chalk = require("chalk");

module.exports = (client) => {
    let count = 0;
    readdirSync("./src/Commands/").forEach(dir => {
        const commandFiles = readdirSync(`./src/Commands/${dir}/`).filter(f => f.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`../Commands/${dir}/${file}`);
            if (command.name) {
                client.commands.set(command.name, command);
                if (command.aliases && Array.isArray(command.aliases)) {
                    command.aliases.forEach(alias => {
                        client.aliases.set(alias, command.name)
                    })
                }
                count++;
            }
        }
    });
    
    client.logger.log(chalk.yellowBright(`Client Commands Loaded [${count}]`), "cmd");
}