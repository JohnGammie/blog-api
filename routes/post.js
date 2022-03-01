var express = require("express");
var router = express.Router();
var Post = require("../models/post");
var Comment = require("../models/comment");
var async = require("async");

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

router.get("/postDetails/:postId", (req, res, next) => {
  async.parallel(
    {
      Post: function (callback) {
        Post.findById(req.params.postId).exec(callback);
      },
      Comments: function (callback) {
        Comment.find({ post: req.params.postId }).exec(callback);
      },
    },
    (err, results) => {
      res.json({ post: results.Post, comments: results.Comments });
    }
  );
});

module.exports = router;
