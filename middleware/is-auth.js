const jwt = require("jsonwebtoken");
const secret = "Hello,iamMorteza";
const User = require("../models/user");

module.exports = isAuth = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, secret);
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }

  User.findById(decodedToken._id)
    .then(user => {
      if (!user) {
        const error = new Error("Not authenticated.");
        error.statusCode = 401;
        throw error;
      }
      req.userId = decodedToken._id;
      req.email = decodedToken.email;
      next();
    })
    .catch(err => {
      next(err);
    });
};
