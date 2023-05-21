const express = require("express");
// const validate = require("express-validation");
const coachController = require("../../controllers/coach.controller");
const ticketController = require("../../controllers/ticket.controller");
const { authorize, ADMIN, LOGGED_USER } = require("../../middlewares/auth");

const router = express.Router();


router
 .route("/coach")
  .get(coachController.get)
  .post(coachController.create);

router.patch("/coach/:id", coachController.update)
router.delete("/coach/:id", coachController.delete)

router
    .route("/ticket")
    .get(authorize(), ticketController.getAll)
    .post(authorize(), ticketController.create)

router
    .route("/ticket/:id")
    .patch(ticketController.update)
    .delete(ticketController.delete)

// router
//     .route("/coach/:id")
//     .put(coachController.update)
//     .delete(coachController.delete)


module.exports = router;