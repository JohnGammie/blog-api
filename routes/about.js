var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/contact-info", function (req, res, next) {
  res.json({ name: "John Smith" });
});

module.exports = router;
