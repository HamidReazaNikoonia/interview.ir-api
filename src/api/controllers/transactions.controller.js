const httpStatus = require("http-status");
const { omit } = require("lodash");
const Transaction = require("../models/transaction.model");
const Record = require("../models/record.model");
const APIError = require("../errors/api-error");
const { pay, verifyPay } = require("../../services/payment");

/**
 * Transaction Get
 * @private
 */

exports.getAll = async (req, res, next) => {
  try {
    const transactions = await Transaction.find();
    if (!transactions) {
      throw new APIError({
        message: "Transaction Not Found",
        status: httpStatus.NOT_FOUND,
      });
    }

    res.status(httpStatus.OK);
    res.json({
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

exports.getInterviewerTransactions = async (req, res, next) => {
  try {
    const { user } = req;
    const { userId } = req.params;
    const Err = (message = "INTERNAL ERROR", errors = [], status = null) =>
      new APIError({
        message,
        errors,
        status: status || httpStatus.BAD_REQUEST,
      });

    if (!user) {
      throw Err("User Not Found");
    } else if (user._id.toString() !== userId) {
      throw Err(
        "Customer Not Exist",
        [user._id.toString(), userId],
        httpStatus.NOT_FOUND
      );
    }

    const transactions = await Transaction.find({ interviewUserId: userId });
    if (!transactions) {
      throw new APIError({
        message: "Transaction Not Found",
        status: httpStatus.NOT_FOUND,
      });
    }

    res.status(httpStatus.OK);
    res.json({
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Transaction Create
 * @private
 */

exports.create = async (req, res, next) => {
  try {
    const { user } = req;

    const Err = (message = "INTERNAL ERROR", errors = []) =>
      new APIError({
        message,
        errors,
        status: httpStatus.BAD_REQUEST,
      });

    if (user) {
      if (user._id.toString() !== customer) {
        throw new APIError({
          message: "You dont allow to create transaction on this customer",
          status: httpStatus.UNAUTHORIZED,
        });
      }
    } else {
      throw Err("User Not Exist");
    }

    const transactionData = omit(req.body, "status");

    // if (transactionData.amount < 1000)  {

    // }
    const transaction = await new Transaction(transactionData).save();

    if (!transaction) {
      throw new APIError({
        message: "Transaction can not save",
        status: httpStatus.BAD_REQUEST,
      });
    }

    let _payment = null;

    // Payment Cash Logic
    const payByCash = await pay(transaction.amount, transaction._id);

    if (!payByCash || payByCash.status !== 1) {
      throw new APIError({
        message: "Payment Error",
        paymentStatus: payByCash.status || null,
        status: httpStatus.BAD_REQUEST,
      });
    }

    _payment = payByCash;

    res.status(httpStatus.CREATED);
    res.json({
      data: transaction,
      payment: _payment,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);

    if (!transaction && transaction.length === 0) {
      throw new APIError({
        message: "Transaction Not Found",
        status: httpStatus.NOT_FOUND,
      });
    }

    // Verify Transaction from Bank
    const verifyResponse = await verifyPay(req.body.token);

    // When Transaction Not found
    if (!verifyResponse) {
      throw new APIError({
        message: "Transaction Not Valid",
        status: httpStatus.BAD_REQUEST,
      });
    }

    // When transaction status equal false
    if (verifyResponse.status !== 1 || !verifyResponse.transId) {
      throw new APIError({
        message: "Payment Faild",
        status: httpStatus.BAD_REQUEST,
      });
    }

    // Get Merchant
    const record = await Record.findById(transaction.recordId);

    // Set Total Amount of THIS Merchant

    record.set({ paymentStatus: "PAYED" });
    await record.save();

    // Update Transaction status to be TRUE
    // eslint-disable-next-line max-len
    transaction.set({
      status: true,
      referenceId: verifyResponse.transId,
      //   amount: transaction.amount,
    });
    const updatedTransaction = await transaction.save();

    res.status(httpStatus.OK);
    res.json({
      verifyResponse,
      updatedTransaction,
    });
  } catch (error) {
    next(error);
  }
};
