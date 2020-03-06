const express = require("express");
const app = express();

const path = require("path");

const { connectToMongoDB } = require("./util/database");

const bodyParser = require("body-parser");
app.use(bodyParser.json()); //aplication/json

app.use(express.static(path.join(__dirname + "/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  next();
});

const feed = require("./routes/feed");
app.use("/feed", feed);

const auth = require("./routes/auth");
app.use("/auth", auth);

app.use((error, req, res, next) => {
  res.status(error.statusCode).json({ message: error.message, data : error.data});
});

app.listen(8080, () => {
  connectToMongoDB()
    .then(() => {
      console.log("Server has started.");
    })
    .catch(err => {
      console.log(err);
    });
});
