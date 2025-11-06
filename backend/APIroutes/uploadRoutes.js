// routes/uploadRoutes.js
const express = require("express");
const router = express.Router();
const uploadController = require("../controller/uploadController");

router.post("/image", uploadController.uploadMiddleware, uploadController.handleImageUpload);

module.exports = router;
