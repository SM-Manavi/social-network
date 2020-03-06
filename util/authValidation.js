const { body, sanitize } = require("express-validator");
const User = require("../models/user");

exports.signUpValidation = _ => {
  return [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(user => {
          if (user) {
            return Promise.reject("E-Mail address already exists!");
          } else {
            return true;
          }
        });
      })
      .normalizeEmail({ all_lowercase: true }),

    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password lenght must be bigger than 5 char."),

    body("name")
      .trim()
      .notEmpty()
  ];
};

exports.loginValidation = () => {
  return [
    body("email")
      .isEmail()
      .normalizeEmail({ all_lowercase: true }),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password lenght must be bigger than 5 char.")
  ];
};
