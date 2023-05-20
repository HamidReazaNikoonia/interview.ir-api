const mongoose = require("mongoose");

/**
 * Refresh Token Schema
 * @private
 */
const coachSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        picture: {
            type: mongoose.Types.ObjectId,
            ref: "Upload",
            autopopulate: true,
        },
        stack: {
            type: String,
            enum: ["FRONT_END", "BACK_END", "FULL_STACK", "IOS", "ANDROID", "DEVOPS"],
            required: true,
        },
        company: String,
        description: String,
        status: {
            type: Boolean,
            default: false,
        },
        amount: {
            type: Number,
            required: true,
        },
        transactions: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction",
            autopopulate: false,
        },
        social: {
            linkedinProfile: String,
            githubProfile: String,
        },
    },
    {
        timestamps: true,
    }
);

coachSchema.plugin(require("mongoose-autopopulate"));

/**
 * @typedef CoachSchema
 */
const Coach = mongoose.model("Coach", coachSchema);
module.exports = Coach;
