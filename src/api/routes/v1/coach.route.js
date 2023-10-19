const express = require("express");
const validate = require("express-validation");
const controller = require("../../controllers/coach.controller");
// const userController = require("../../controllers/user.controller");
const { authorize, ADMIN, LOGGED_USER } = require("../../middlewares/auth");
// const {
//   listUsers,
//   createUser,
//   replaceUser,
//   updateUser,
// } = require("../../validations/user.validation");

const router = express.Router();



router
  .route("/")
  //   .get(authorize(LOGGED_USER), validate(listUsers), controller.list)
  .get(controller.get)

  router
  .route("/:id")
  //   .get(authorize(LOGGED_USER), validate(listUsers), controller.list)
  .get(controller.getById)


  module.exports = router;