var express = require("express");
var router = express.Router();
var Post = require("../models/post");
var Comment = require("../models/comment");
var async = require("async");
const validateToken = require("../middlewares/validateToken");

/**
 * @swagger
 * /post/list/public:
 *  get:
 *    summary: List of all blog posts
 *    description: List of all blog posts
 *    responses:
 *      200:
 *        description: A list of blog posts
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 */
router.get("/list/public", (req, res, next) => {
  Post.find({ published: true }, (err, posts) => {
    res.json({ posts: posts });
  });
});

/**
 * @swagger
 * /post/list/protected:
 *  get:
 *    summary: List of all blog posts for an authorized user
 *    description: List of all blog posts for an authorized user
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: A list of blog posts
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 */
router.get("/list/protected", validateToken, (req, res, next) => {
  Post.find({}, (err, posts) => {
    res.json({ posts: posts });
  });
});

/**
 * @swagger
 * /post/count:
 *  get:
 *    summary: Number of blog posts
 *    description:
 *    responses:
 *      200:
 *        description:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 */
router.get("/count", function (req, res, next) {
  Post.count({}, (err, count) => {
    res.json({ count: count });
  });
});

/**
 * @swagger
 * /post/create:
 *   post:
 *     summary: Create a new post
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              author:
 *                 type: string
 *                 description: The user's name.
 *                 example: Billy Bob
 *              title:
 *                type: string
 *                description: Title of the blog post
 *                example: Another blog post
 *              content:
 *                type: string
 *                description: Body of the blog post
 *                example: Today's post is bringing great news to fans of javascript!
 */
router.post("/create", validateToken, (req, res, next) => {
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

/**
 * @swagger
 * /post/publish:
 *  put:
 *    summary: Set published of post to true
 *    description:
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: query
 *        name: _id
 *        required: true
 *        description: The _id of a blog post
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *
 */
router.put("/publish", validateToken, (req, res, next) => {
  Post.findByIdAndUpdate(req.query._id, { published: true }, (err, post) => {
    if (err) {
      return next(err);
    }
    res.sendStatus(200);
  });
});

/**
 * @swagger
 * /post/comment:
 *   post:
 *     summary: Create comment on post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              username:
 *                 type: string
 *                 description: The user's name.
 *                 example: Leanne Graham
 *              content:
 *                type: string
 *                description: Content of the comment
 *                example: new comment!
 *              postId:
 *                type: string
 *                description: The id of the post to make the comment on
 *                example: 621ced5c7b51bdfbbe12a164
 */
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

/**
 * @swagger
 * /post/postDetails/{postId}:
 *  get:
 *    summary: Post details of specific post
 *    description:
 *    parameters:
 *      - in: path
 *        name: postId
 *        required: true
 *        description: The _id of a blog post
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *
 */
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
