// Inspired by https://dev.to/pawel/how-to-secure-your-api-s-routes-with-jwt-token-4bd1
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/user.js");

async function validateToken(req, res, next) {
  let auhorizationHeader = req.headers.authorization;
  let result;

  if (!auhorizationHeader) {
    return res.status(401).json({
      error: true,
      message: "Access token is missing",
    });
  }

  auhorizationHeader = auhorizationHeader.replace("Bearer ", ""); // When executing command from Swagger, "Bearer " is appended to the start
  const token = auhorizationHeader; //.split(" ")[1];

  const options = {};

  try {
    let user = await User.findOne({
      accessToken: token,
    });

    if (!user) {
      result = {
        error: true,
        message: "Authorization error",
      };

      return res.status(403).json(result);
    }

    result = jwt.verify(token, process.env.JWT_SECRET, options);

    if (!user.username === result.username) {
      result = {
        error: true,
        message: "Invalid token",
      };

      return res.status(401).json(result);
    }

    req.decoded = result;

    next();
  } catch (error) {
    console.error(error);

    if (error.name === "TokenExpiredError") {
      return res.status(403).json({
        error: true,
        message: "Token expired",
      });
    }

    return res.status(403).json({
      error: true,
      message: "Authentication error",
    });
  }
}

module.exports = validateToken;
