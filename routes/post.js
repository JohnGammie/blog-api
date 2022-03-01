var express = require("express");
var router = express.Router();
var Post = require("../models/post");

router.get("/list", (req, res, next) => {
  Post.find({}, (err, posts) => {
    res.json({ posts: posts });
  });
});

router.get("/count", function (req, res, next) {
  Post.count({}, (err, count) => {
    res.json({ count: count });
  });
});

router.post("/create", (req, res, next) => {
  new Post({
    author: req.body.author,
    title: req.body.title,
    content: req.body.content,
    created: new Date(),
    published: false,
  }).save(function (err) {
    if (err) {
      console.log(err);
      return next(err);
    }
    next();
  });
});

router.put("/publish", (req, res, next) => {
  Post.findByIdAndUpdate(req.query._id, { published: true }, (err, post) => {
    if (err) {
      return next(err);
    }
    next();
  });
});

router.post("/comment", (req, res, next) => {
  // TODO need Post ID as query. Then mongoose schema Comment.save
  console.log(req.body); // Contains the query params sent from Postman
  next();
});

module.exports = router;
