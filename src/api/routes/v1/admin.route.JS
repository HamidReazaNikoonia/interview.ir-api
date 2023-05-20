const express = require("express");
// const validate = require("express-validation");
const coachController = require("../../controllers/coach.controller");
const { authorize, ADMIN, LOGGED_USER } = require("../../middlewares/auth");

const router = express.Router();


router
 .route("/coach")
  .get(coachController.get)
  .post(coachController.create);

router.patch("/coach/:id", coachController.update)
router.delete("/coach/:id", coachController.delete)

// router
//     .route("/coach/:id")
//     .put(coachController.update)
//     .delete(coachController.delete)


module.exports = router;