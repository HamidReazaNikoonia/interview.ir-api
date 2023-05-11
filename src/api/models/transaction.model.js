const mongoose = require("mongoose");

/**
 * Transaction Schema
 * @private
 */
const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      autopopulate: true,
    },
    coachUserId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      autopopulate: true,
    },
    recordId: {
      type: mongoose.Types.ObjectId,
      ref: "Record",
      autopopulate: false,
    },
    referenceId: String,
    factorNumber: String,
    amount: Number,
    tax: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

TransactionSchema.plugin(require("mongoose-autopopulate"));

module.exports = mongoose.model("Transaction", TransactionSchema);
