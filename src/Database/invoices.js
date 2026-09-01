const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  invoiceId: { type: String, required: true },
  clientId: { type: String, required: true },
  sellerId: { type: String, required: true },

  items: [
    {
      title: String,
      desc: String,
      qty: { type: Number, default: 1 },
      price: Number,
    },
  ],

  taxPercent: { type: Number, default: 0 },
  middlemanFeePercent: { type: Number, default: 0 },
  paymentMethod: { type: String, required: true },

  subtotal: { type: Number, required: false },
  taxAmount: { type: Number, required: false },
  middlemanFeeAmount: { type: Number, required: false },
  total: { type: Number, required: false },
  sellerReceive: { type: Number, required: false },

  status: {
    type: String,
    enum: ["Paid", "Pending", "Completed"],
    default: "Pending",
  },

  date: { type: Date, default: Date.now },
});

invoiceSchema.pre("save", function (next) {
  const subtotal = this.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const tax = (subtotal * this.taxPercent) / 100;
  const middlemanFee = (subtotal * this.middlemanFeePercent) / 100;

  this.subtotal = subtotal;
  this.taxAmount = tax;
  this.middlemanFeeAmount = middlemanFee;
  this.total = subtotal + tax;
  this.sellerReceive = subtotal - middlemanFee;

  next();
});

module.exports = mongoose.model("invoice", invoiceSchema);
