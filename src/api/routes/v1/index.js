const express = require("express");
const userRoutes = require("./user.route");
const authRoutes = require("./auth.route");
const interviewRoutes = require("./interview.route");
const adminRoutes = require("./admin.route.JS");
const uploadRoute = require('../../services/uploader/uploader.controller');

const router = express.Router();

/**
 * GET v1/status
 */
router.get("/status", (req, res) => res.send("OK"));

/**
 * GET v1/docs
 */
router.use("/docs", express.static("docs"));

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/interview", interviewRoutes);
router.use("/admin", adminRoutes);

router.use('/upload', uploadRoute);



module.exports = router;
