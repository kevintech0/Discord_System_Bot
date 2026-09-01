const invoicesSchema = require("../../Database/invoices");

module.exports = {
  name: "messageDelete",

  /**
   * @param {import("discord.js").Client} client
   * @param {import("discord.js").Message} message
   */

  run: async (client, message) => {
    if (!message.guild) return;

    const invoiceData = await invoicesSchema.findOne({ invoiceId: message.id });
    if (invoiceData) {
      await invoiceData.deleteOne();
    }
  },
};
