var express = require("express");
var router = express.Router();
var Post = require("../models/post");
var Comment = require("../models/comment");

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
    res.sendStatus(200);
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
  new Comment({
    username: req.body.username,
    content: req.body.content,
    created: new Date(),
    post: req.body.postId,
  }).save((err) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    res.sendStatus(200);
  });
});

module.exports = router;
