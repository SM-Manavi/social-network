const express = require("express");
const router = express.Router();

const validation = require("../util/feedValidator");
const controller = require("../controllers/feed");
const isAuth = require("../middleware/is-auth");

// GET /feed/posts
router.get("/posts", isAuth, controller.getPosts);

// POST /feed/post
router.post(
  "/post",
  isAuth,
  validation.validationPost(),
  validation.getFormData,
  controller.createPost
);

// GET /feed/post/:id
router.get("/post/:id", isAuth, controller.getPost);

// PUT /feed/post/:id
router.put(
  "/post/:postId",
  isAuth,
  validation.validationPost(),
  validation.getFormData,
  controller.editPost
);

router.delete("/post/:postId", isAuth, controller.deletePost);

module.exports = router;
