const mongoose = require("mongoose");

/**
 * Refresh Token Schema
 * @private
 */
const ticketSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            autopopulate: true,
        },
        title: {
            type: String,
            required: true,
        },
        body: String,
        status: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

ticketSchema.plugin(require("mongoose-autopopulate"));

/**
 * @typedef CoachSchema
 */
const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
