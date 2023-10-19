const httpStatus = require("http-status");
const APIError = require("../errors/api-error");
const Coach = require("../models/coach.model");

// Get All Coach
exports.get = async (req, res, next) => {
  try {
    const coach = await Coach.find();
    if (!coach) {
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: "Coach Not Found",
      });
    }

    res.status(httpStatus.OK);
    res.json({ coach });
  } catch (error) {
    next(error);
  }
};

// Get Coach By Id
exports.getById = async (req, res, next) => {
  try {
    if (!req.params.id) {
      throw new APIError({
        status: httpStatus.BAD_REQUEST,
        message: "Coach Not Found",
      });
    }

    let identity = "_id";
    const checkForValidMongoDbID = new RegExp("^[0-9a-fA-F]{24}$");

    if (!checkForValidMongoDbID.test(req.params.id)) {
      identity = "code";
    }

    const coach = await Coach.find({ [identity]: req.params.id });
    if (!coach) {
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: "Coach Not Found",
      });
    }

    res.status(httpStatus.OK);
    res.json({ coach });
  } catch (error) {
    next(error);
  }
};

// Create New Coach From Admin
exports.create = async (req, res, next) => {
  try {
    const randomCode = Math.floor(1000 + Math.random() * 9000);

    const body = {
      code: `${req.body.name}-${randomCode}`,
      ...req.body,
    };

    const newCoach = new Coach(body);
    const savedNewCoach = await newCoach.save();

    if (!savedNewCoach) {
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: "Coach Not Saved",
      });
    }

    res.status(httpStatus.CREATED);
    res.json({
      newCoach: savedNewCoach,
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updatedCoach = await Coach.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCoach) {
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: "Coach Not Update",
      });
    }

    res.status(httpStatus.OK);
    res.json({
      updatedCoach,
    });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const coach = await Coach.findByIdAndRemove(req.params.id).exec();

    if (!coach) {
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: "Coach Not Found",
      });
    }

    res.status(httpStatus.OK);
    res.json({
      coach,
    });
  } catch (error) {
    next(error);
  }
};
