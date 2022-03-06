// Inspired by https://dev.to/pawel/how-to-secure-your-api-s-routes-with-jwt-token-4bd1
var express = require("express");
var router = express.Router();
const User = require("../models/user");
const hashPassword = require("./helpers/hashPassword");
const comparePasswords = require("./helpers/comparePasswords");
const cleanBody = require("../middlewares/cleanBody");
const generateJWT = require("../middlewares/generateJWT");
const validateToken = require("../middlewares/validateToken");

/**
 * @swagger
 * /users/signup:
 *  post:
 *    tags:
 *    - "users"
 *    description: sign up new user
 *    summary: Sign up a new user
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *           type: object
 *           properties:
 *            username:
 *              type: string
 *              description: username
 *              example: newuser123
 *            password:
 *              type: string
 *              description: password credential
 *              example: 123
 *    responses:
 *      201:
 *        description: successfully created new user
 *      400:
 *        description: User already exist
 *      500:
 *        description: Error signing up
 */
router.post("/signup", cleanBody, async (req, res) => {
  try {
    let user = await User.findOne({
      username: req.body.username,
    });

    if (user) {
      return res.status(400).json({
        error: true,
        message: "Username is already in use",
      });
    }

    user = req.body;

    const hashedPassword = await hashPassword(req.body.password);

    user.password = hashedPassword;

    const newUser = new User(user);

    await newUser.save();

    return res.status(201).send(newUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: true,
      message: "Cannot Sign up",
    });
  }
});

/**
 * @swagger
 * /users/login:
 *  post:
 *    tags:
 *    - "users"
 *    description: login user
 *    summary: login user
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *           type: object
 *           properties:
 *            username:
 *              type: string
 *              description: username
 *              example: newuser123
 *            password:
 *              type: string
 *              description: password credential
 *              example: 123
 *    responses:
 *      201:
 *        description: Successful log in
 *      404:
 *        description: Account not found
 *      400:
 *        description: Invalid password
 *      500:
 *        description: Invalid
 */
router.post("/login", cleanBody, async (req, res) => {
  try {
    let user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "Account not found",
      });
    }

    const isValid = await comparePasswords(req.body.password, user.password);

    if (!isValid) {
      return res.status(400).json({
        error: true,
        message: "Invalid password",
      });
    }

    const { error, token } = await generateJWT(user.username);

    if (error) {
      return res.status(500).json({
        error: true,
        message: "Couldn't create access token. Please try again later.",
      });
    }

    user.accessToken = token;

    await user.save();

    return res.status(200).send({
      success: true,
      message: "User logged in successfully",
      accessToken: user.accessToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: true,
      message: "Couldn't login. Please try again.",
    });
  }
});

/**
 * @swagger
 * /users/logout:
 *  post:
 *    tags:
 *    - "users"
 *    description: logout user
 *    summary: logout user
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      201:
 *        description: Successful log in
 *      404:
 *        description: Account not found
 *      400:
 *        description: Invalid password
 *      500:
 *        description: Invalid
 */
router.post("/logout", validateToken, async (req, res) => {
  try {
    const { username } = req.decoded;

    let user = await User.findOne({ username });

    user.accessToken = "";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User logged out",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: true,
      message: error,
    });
  }
});
module.exports = router;
