const mongoose = require('mongoose');

const userTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chain: {
    type: String,
    required: true
  },
  tokenAddress: {
    type: String,
    default: null  // allow native tokens with null
  },
  symbol: {
    type: String,
    required: true
  },
  decimals: {
    type: Number,
    required: true
  },
  binanceSymbol: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.UserToken || mongoose.model("UserToken", userTokenSchema);
