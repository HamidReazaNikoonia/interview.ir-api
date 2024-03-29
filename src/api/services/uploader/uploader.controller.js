const express = require("express");
const Upload = require("./uploader.model");
const uploder = require("./index");

const router = express.Router();

router.post(
  "/",
  uploder.single("interview-kit-File"),
  async (req, res, next) => {
    try {
      const { file } = req;
      if (!file) {
        res.status(400).json({
          status: "failed",
          code: "400",
          message: "Please upload file",
        });
        return;
      }

      const fileUploded = {
        file_name: file.filename,
        field_name: file.fieldname,
        original_name: file.originalname
      };

      const newUpload = new Upload(fileUploded);
      const uploadedFile = await newUpload.save();

      res.status(200).json({
        uploadedFile
      });
    } catch (error) {
      console.log(error.message);
      res.status(200).json({
        status: "failed",
        code: "500",
        message: error.message,
      });
    }
  }
);

module.exports = router;
