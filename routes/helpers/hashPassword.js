// Inspired by https://dev.to/pawel/how-to-secure-your-api-s-routes-with-jwt-token-4bd1

const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error("Hashing failed", error);
  }
};

module.exports = hashPassword;
