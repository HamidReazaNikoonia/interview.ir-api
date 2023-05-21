const httpStatus = require("http-status");
const { omit } = require("lodash");
const { v4: uuidv4 } = require("uuid");
const APIError = require("../errors/api-error");
const Record = require("../models/record.model");
const Coach = require("../models/coach.model");
const Transaction = require("../models/transaction.model");
const ZarinpalCheckout = require("../services/payment");

// /**
//  * Load user and append to req.
//  * @public
//  */
// exports.load = async (req, res, next, id) => {
//   try {
//     const user = await User.get(id);
//     req.locals = { user };
//     return next();
//   } catch (error) {
//     return next(error);
//   }
// };

// /**
//  * Get user
//  * @public
//  */
// exports.get = (req, res) => res.json(req.locals.user.transform());

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 *
 * Get User Interviews
 */
exports.get = async (req, res, next) => {
  try {
    if (!req.locals.user) {
      throw new APIError({
        status: httpStatus.UNAUTHORIZED,
        message: "user not defined",
      });
    }

    const user = req.locals.user.transform();
    const records = await Record.find({ userId: user.id });

    if (!records) {
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: "Record Not Exist",
      });
    }

    res.status(httpStatus.OK);
    res.json({ records });
  } catch (error) {
    next(error);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 *
 * Get Interviewver Records
 */

exports.getInterviewVerRecords = async function (req, res, next) {
  try {
    if (!req.locals.user || req.locals.user.role === "user") {
      throw new APIError({
        status: httpStatus.UNAUTHORIZED,
        message: "user not defined",
      });
    }
    const user = req.locals.user.transform();
    const records = await Record.find({ interviewUserId: user.id });

    if (!records) {
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: "Records Not Exist",
      });
    }

    res.status(httpStatus.OK);
    res.json({ records });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new user
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    if (!req.locals.user) {
      throw new APIError({
        status: httpStatus.UNAUTHORIZED,
        message: "user not defined",
      });
    }

    const user = req.locals.user.transform();

    const recordAmout = process.env.recordAmout || 200000;

    // generate Wallet charge id
    const factorNumber = uuidv4();

    // Send Payment Request to Get TOKEN

    var zarinpal = ZarinpalCheckout.create(
      "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      true
    );
    const payment = await zarinpal.PaymentRequest({
      Amount: recordAmout,
      CallbackURL: "http://localhost:3000/free/payment-result/",
      Description: "interview",
      Mobile: user.mobile,
      order_id: factorNumber,
    });

    // Validate Payment Request

    if (!payment || payment.status !== 100) {
      throw new APIError({
        message: "Payment Error",
        paymentStatus: payment.status || null,
        status: httpStatus.BAD_REQUEST,
      });
    }

    // Create New Transaction
    const transaction = new Transaction({
      // coachUserId: 'NOT_SELECTED',
      userId: user.id,
      amount: recordAmout,
      factorNumber,
    });

    const body = {
      userId: user.id,
      stack: req.body.stack,
      level: req.body.level,
      paymentStatus: "PROGRESS",
      amount: recordAmout,
      social: {
        linkedinProfile: req.body.linkedin,
        githubProfile: req.body.github,
      },
    };

    if (req.body.coachId) {
      const coachUser = await Coach.findById(req.body.coachId);

      if (coachUser) {
        body.interviewUserId = req.body.coachId;
        body.amount = coachUser.amount;
      }
    }


    // Create Interview Record
    const record = new Record(body);
    const savedRecord = await record.save();

    transaction.recordId = transaction.$set("recordId", savedRecord._id);

    const savedTransaction = await transaction.save();

    res.status(httpStatus.CREATED);
    res.json({
      payment,
      factorNumber,
      record: savedRecord,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyTransactionRecord = async (req, res, next) => {
  try {
    // const transaction = await Transaction.findById(req.params.transactionId);

    // if (!transaction && transaction.length === 0) {
    //   throw new APIError({
    //     message: "Transaction Not Found",
    //     status: httpStatus.NOT_FOUND,
    //   });
    // }

    const recordId = req.params.recordId;

    if (!recordId) {
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: "Record Not Exist In Params",
      });
    }

    const record = await Record.findOne({ _id: recordId });

    if (!record) {
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: "Record Not Found",
      });
    }

    if (!req.body.authority || !req.body.amount) {
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: "Token Not Existed",
      });
    }

    var zarinpal = ZarinpalCheckout.create(
      "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      true
    );

    const verifyResponse = await zarinpal.PaymentVerification({
      amount: req.body.amount,
      authority: req.body.authority,
    });

    // Verify Transaction from Bank
    // const verifyResponse = await verifyPay(req.body.token);

    // When Transaction Not found
    if (!verifyResponse) {
      throw new APIError({
        message: "Transaction Not Valid",
        status: httpStatus.BAD_REQUEST,
      });
    }

    // When transaction status equal false
    // if (verifyResponse.status !== 100 || verifyResponse.status !== 101) {
    //   throw new APIError({
    //     message: "Payment Faild",
    //     status: httpStatus.BAD_REQUEST,
    //   });
    // }

    res.json({
      verifyResponse,
    });

    return false;

    // Get Transaction By FactorNumber
    const transaction = await Transaction.findOne({
      factorNumber: verifyResponse.factorNumber,
    }).populate({ path: "userId", options: { autopopulate: false } });

    if (!transaction) {
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: "Transaction Not Exist",
      });
    }

    // Update Transaction status to be TRUE
    // eslint-disable-next-line max-len
    transaction.set({
      status: true,
      referenceId: verifyResponse.transId,
      //   amount: transaction.amount,
    });
    const updatedTransaction = await transaction.save();

    // Get Record
    // const record = await Record.findOne({ _id: transaction.recordId }).populate(
    //   { path: "userId", options: { autopopulate: false } }
    // );

    // if (!record) {
    //   throw new APIError({
    //     status: httpStatus.NOT_FOUND,
    //     message: "Record Not Exist",
    //   });
    // }

    record.set({ paymentStatus: "PAYED", transaction: transaction._id });
    const updatedRecord = await record.save();

    res.status(httpStatus.OK);
    res.json({
      verifyResponse,
      transation: updatedTransaction,
      record: updatedRecord,
    });
  } catch (error) {
    next(error);
  }
};
