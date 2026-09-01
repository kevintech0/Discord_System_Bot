const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { Database, JSONDriver } = require("st.db");
const db = new Database({
  driver: new JSONDriver("./src/Json/database.json"),
});

class MainBot extends Client {
  constructor() {
    super({
      intents: [Object.keys(GatewayIntentBits)],
    });

    this.config = require("../Config.js");
    this.logger = require("../Utils/Logger.js");
    this.owner = this.config.ownersId;
    this.prefix = this.config.prefix;
    this.emoji = this.config.emojis;
    this.db = db;
    if (!this.token) this.token = this.config.token;
    const client = this;

    ["aliases", "commands", "cooldowns"].forEach(
      (x) => (client[x] = new Collection())
    );

    ["LoadCommands", "LoadEvents", "LoadMongodb", "LoadErrorHandler"].forEach(
      (handler) => {
        require(`../Handlers/${handler}`)(this);
      }
    );
  }
  connect() {
    return super.login(this.token);
  }
}

module.exports = MainBot;
