const router = require("express").Router();
const { createTranslation } = require("../controllers/audioController");
const Multer = require("multer");

const upload = Multer();
router.post("/translate/", upload.single("file"), createTranslation);

module.exports = router;
