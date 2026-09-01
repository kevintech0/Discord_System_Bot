const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  sellerId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  joinedDate: {
    type: Date,
    default: Date.now,
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  skills: {
    type: Array,
    required: false,
    default: [],
  },
  projects: {
    type: Array,
    default: [],
  },
  reviews: {
    type: Array,
    default: [],
  },
  socialMedia: {
    type: Array,
    default: [],
  },
  offers: {
    type: Array,
    default: [],
  },
  status: {
    type: String,
    default: "Available",
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("sellers", schema);
