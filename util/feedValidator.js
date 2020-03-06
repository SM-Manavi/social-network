const { body } = require("express-validator");

// POST /feed/post
exports.validationPost = () => {
  return [
    body("title")
      .trim()
      .isLength({ min: 5 }),
    body("content")
      .trim()
      .isLength({ min: 5 })
  ];
};

var Busboy = require("busboy");
var path = require("path");
var fs = require("fs");
var uniqueFilename = require("unique-filename");

exports.getFormData = (req, res, next) => {
  var busboy = new Busboy({ headers: req.headers });
  req.myForm = {};
  busboy.on("file", function(fieldname, file, filename, encoding, mimetype) {
    console.log(
      "File [" +
        fieldname +
        "]: filename: " +
        filename +
        ", encoding: " +
        encoding +
        ", mimetype: " +
        mimetype
    );
    if (
      !(
        mimetype === "image/jpeg" ||
        mimetype === "image/jpg" ||
        mimetype === "image/png"
      )
    ) {
      const error = new Error("Provided image has wrong MIME.");
      error.statusCode = 415;
      next(error);
    }
    const uniqueName = uniqueFilename("");
    var saveTo = path.join("./images", uniqueName);
    file.pipe(fs.createWriteStream(saveTo));

    file.on("data", function(data) {
      console.log("File [" + fieldname + "] got " + data.length + " bytes");
    });
    file.on("end", function() {
      console.log("File [" + fieldname + "] Finished");
      req.myForm[`${fieldname}`] = uniqueName;
    });
  });
  busboy.on("field", function(
    fieldname,
    val,
    fieldnameTruncated,
    valTruncated
  ) {
    req.body[`${fieldname}`] = val;
  });
  busboy.on("finish", function() {
    console.log("Done parsing form!");
    next();
  });
  req.pipe(busboy);
};
