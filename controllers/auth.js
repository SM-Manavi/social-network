const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = "Hello,iamMorteza";

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = Error("Validation error.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  var password = req.body.password;
  const name = req.body.name;
  password = bcrypt.hashSync(password, 12);
  User.create({
    email: email,
    name: name,
    password: password
  })
    .then(user => {
      res.status(201).json({ message: "User created.", userId: user._id });
    })
    .catch(err => console.log(err));
};

exports.login = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    const error = Error("Validation error.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;
  var loadUser;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error("User not found. Please signup.");
        error.statusCode = 404;
        throw error;
      } else {
        loadUser = user;
        return bcrypt.compare(password, user.password);
      }
    })
    .then(isAuthenticated => {
      if (isAuthenticated) {
        return jwt.sign(
          { email: loadUser.email, _id: loadUser._id.toString() },
          secret, // secret key is define in top as globla variable.
          { expiresIn: "1h" }
        );
      } else {
        const error = new Error("Wrong password.");
        error.statusCode = 401;
        throw error;
      }
    })
    .then(token => {
      res.status(200).json({ token: token, userId: loadUser._id.toString() });
    })
    .catch(err => next(err));
};
