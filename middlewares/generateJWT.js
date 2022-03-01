// Inspired by https://dev.to/pawel/how-to-secure-your-api-s-routes-with-jwt-token-4bd1
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const options = {
  expiresIn: "24h",
};

async function generateJWT(username) {
  try {
    const payload = { username };
    const token = await jwt.sign(payload, process.env.JWT_SECRET, options);
    return { error: false, token };
  } catch (error) {
    return { error: true };
  }
}

module.exports = generateJWT;
