const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  panelName: {
    type: String,
    required: true,
  },
  ticketNumber: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  channelId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Opened", "Closed"],
    default: "Opened",
  },
  claimId: {
    type: String,
    default: "Not claim",
  },
});

module.exports = mongoose.model("tickets", ticketSchema);
