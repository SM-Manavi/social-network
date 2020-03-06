const express = require("express");
const router = express.Router();

const contorller = require("../controllers/auth");
const validation = require("../util/authValidation");


router.post("/signup", validation.signUpValidation(), contorller.signup);

router.post("/login", validation.loginValidation(), contorller.login);



module.exports = router;
