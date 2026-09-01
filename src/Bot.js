const { EmbedBuilder } = require("discord.js");
const MainBot = require("./Structures/Client");
const client = new MainBot();

client.connect();

module.exports = client;