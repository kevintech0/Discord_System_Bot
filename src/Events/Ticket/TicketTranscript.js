const { saveTranscript } = require("../../Utils/Functions");

module.exports = {
  name: "interactionCreate",

  /**
   * @param {import("discord.js").Interaction} interaction
   * @param {import("discord.js").Client} client
   */

  run: async (client, interaction) => {
    if (!interaction.isButton() || interaction.customId !== "transcriptTicket")
      return;
    await saveTranscript(interaction, client);
  },
};
