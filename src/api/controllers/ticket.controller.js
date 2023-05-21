const httpStatus = require("http-status");
const APIError = require("../errors/api-error");
const Ticket = require("../models/ticket.model");
const Coach = require("../models/coach.model");



exports.getAll = async (req, res, next) => {
    try {

        const tickets = await Ticket.find();

        if (!tickets) {
            throw new APIError({
                status: httpStatus.NOT_FOUND,
                message: "Ticket Not Found",
            })
        }
        res.status(httpStatus.OK);
        res.json({
            tickets
        })

    } catch (error) {
        next(error)
    }
}


exports.create = async (req, res, next) => {
    try {

        const newTicket =  new Ticket(req.body);
        const savesTicket = await newTicket.save();

        if (!savesTicket) {
            throw new APIError({
                status: httpStatus.NOT_FOUND,
                message: "Ticket Not Saved",
            });
        }

        res.status(httpStatus.CREATED);
        res.json({
            savesTicket
        })

    } catch (error) {
        next(error);
    }
}


exports.update = async (req, res, next) => {
    try {

        if (!req.params.id) {
            throw new APIError({
                status: httpStatus.NOT_FOUND,
                message: "Ticket id not found"
            })
        }

        const updatedTicket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
            new : true,
            runValidators : true
        });

        if (!updatedTicket) {
            throw new APIError({
                status: httpStatus.NOT_FOUND,
                message: "Ticket Not Found In DB"
            })
        }


        res.status(httpStatus.OK)
        res.json({
            ticket: updatedTicket
        })

    } catch(error) {
        next (error)
    }
}


exports.delete = async (req, res, next) => {
    try {

        if (!req.params.id) {
            throw new APIError({
                status: httpStatus.NOT_FOUND,
                message: "Ticket Id Not found"
            })
        }

        const tickedShouldBeDelete = await Ticket.findOneAndDelete({_id: req.params.id})

        if (!tickedShouldBeDelete) {
            throw new APIError({
                status: httpStatus.NOT_FOUND,
                message: "Ticket not found in DB"
            })
        }

        res.status(httpStatus.OK);
        res.json({
            deletedTicket: tickedShouldBeDelete
        })

    } catch (error) {
        next(error)
    }
}