const mongoose = require("mongoose");

/**
 * Refresh Token Schema
 * @private
 */
const recordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      autopopulate: { select: "name" },
      required: true,
    },
    interviewUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      autopopulate: true,
      required: false,
    },
    selectedTime: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: [
        "SELECTED_BY_USER",
        "ACCEPTED_BY_INTERVIEWER",
        "FINISHED",
        "CANCELED",
      ],
      default: "SELECTED_BY_USER",
    },
    stack: {
      type: String,
      enum: ["FRONT_END", "BACK_END", "FULL_STACK", "IOS", "ANDROID", "DEVOPS"],
    },
    level: {
      type: String,
      enum: ["JUNIOR", "MID_LEVEL", "SENIOR"],
    },
    paymentStatus: {
      type: String,
      enum: ["PAYED", "CANCELED", "PROGRESS"],
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      autopopulate: false,
    },
    amount: Number,
    social: {
      linkedinProfile: String,
      githubProfile: String,
    },
    result: {
      accessToNextRound: {
        type: String,
        enum: ["YES", "NO"],
      },
      scores: {
        technical_skill: Number,
        problem_solving: Number,
        communication: Number,
      },
      description: {
        context: String,
        summary: String,
        technical_evaluation: String,
        improvement_suggest: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

recordSchema.plugin(require("mongoose-autopopulate"));

/**
 * @typedef RecordSchema
 */
const Record = mongoose.model("Record", recordSchema);
module.exports = Record;
