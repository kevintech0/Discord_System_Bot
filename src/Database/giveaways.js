const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  givId: {
    type: String,
    required: true,
  },
  givStatus: {
    type: String,
    required: true,
  },
  chId: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  numberWinners: {
    type: String,
    required: true,
  },
  prize: {
    type: String,
    required: true,
  },
  hostedby: {
    type: String,
    required: true,
  },
  givUsers: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("giveaways", schema);
