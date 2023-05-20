const httpStatus = require("http-status");
const { omit } = require("lodash");
const { v4: uuidv4 } = require("uuid");
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


// Create New Coach From Admin
exports.create = async (req, res, next) => {
    try {

        const newCoach = new Coach(req.body);
        const savedNewCoach = await newCoach.save();

        if (!savedNewCoach) {
            throw new APIError({
                status: httpStatus.NOT_FOUND,
                message: "Coach Not Saved",
            });
        }

        res.status(httpStatus.CREATED);
        res.json({
           newCoach: savedNewCoach
        });

    } catch (error) {
        next(error);
    }
}

exports.update = async (req, res, next) => {
    try {
        const updatedCoach = await Coach.findByIdAndUpdate(req.params.id, req.body, {
            new : true,
            runValidators : true
        });


        res.json({
            data: updatedCoach,
            h: req.params.id
        })

        return false

        if (!updatedCoach) {
            throw new APIError({
                status: httpStatus.NOT_FOUND,
                message: "Coach Not Update",
            });
        }


        res.status(httpStatus.OK);
        res.json({
            updatedCoach
        });

    } catch (error) {
        next(error);
    }
}

exports.delete = async (req, res, next) => {
    try {
        const coach = await Coach.findByIdAndRemove(req.params.id).exec()

        if (!coach) {
            throw new APIError({
                status: httpStatus.NOT_FOUND,
                message: "Coach Not Found",
            });
        }

        res.status(httpStatus.OK);
        res.json({
            coach
        })


    } catch (error) {
        next(error);
    }
}