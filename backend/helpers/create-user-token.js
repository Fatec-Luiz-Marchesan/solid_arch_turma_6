const jwt = require("jsonwebtoken");
const AppConfig = require("../infra/config");

const User = require("../models/User");

// get user by jwt token
const getUserByToken = async (token) => {
  if (!token) return res.status(401).json({ error: "Acesso negado!" });

  // find user
  const decoded = jwt.verify(token, AppConfig.jwtSecret);

  const userId = decoded.id;

  const user = await User.findOne({ _id: userId });

  return user;
};

module.exports = getUserByToken;
