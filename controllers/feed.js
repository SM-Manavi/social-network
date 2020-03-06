const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");

exports.getPosts = (req, res, next) => {
  Post.find()
    .populate("creator", "name")
    .then(posts => {
      res.status(200).json({
        posts: posts
      });
    })
    .catch(err => console.log(err));
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.length > 0) {
    res
      .status(422)
      .json({ message: "Validation failed.", errors: errors.array() });
  }
  if (!req.myForm.imageUrl) {
    res.status(422).json({ message: "No image provided." });
  }
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.myForm.imageUrl;
  const userId = req.userId;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: userId
  });
  post
    .save()
    .then(newPost => {
      return newPost.populate("creator").execPopulate();
    })
    .then(postData => {
      postData.creator.posts.push(postData._id);
      post_ = postData;
      postData.creator.save();
      res.status(201).json({
        message: "Post created succesfully.",
        post: postData
      });
    })
    .catch(err => console.log(err));
};

exports.getPost = (req, res, next) => {
  const postId = req.params.id;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Post not found.");
        error.statusCode = 404;
        next(error);
      }
      res.status(200).json({ post: post });
    })
    .catch(err => console.log(err));
};

exports.editPost = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.length > 0) {
    res
      .status(422)
      .json({ message: "Validation failed.", errors: errors.array() });
  }
  const postId = req.params.postId;
  const newTitle = req.body.title;
  const newContent = req.body.content;
  var newImageUrl = req.body.imageUrl; // Old image path send by client

  if (req.myForm.imageUrl) {
    // I set imageUrl in getFormData when image file send
    newImageUrl = req.myForm.imageUrl;
  }
  if (!newImageUrl) {
    const error = new Error("No image provided.");
    error.statusCode = 404;
    next(error);
  }

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Post not found.");
        error.statusCode = 404;
        next(error);
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not Authorized!");
        error.statusCode = 403;
        throw error;
      }
      post.title = newTitle;
      post.content = newContent;
      if (req.myForm.imageUrl) {
        clearImage(path.join("./images/" + post.imageUrl));
      }
      post.imageUrl = newImageUrl;
      return post.save();
    })
    .then(newPost => {
      res
        .status(200)
        .json({ message: "Post updated succesfully.", post: newPost });
    })
    .catch(err => next(err));
};

const clearImage = filePath => {
  fs.unlink(filePath, err => {
    console.log(err);
  });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Post not found.");
        error.statusCode = 404;
        next(error);
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not Authorized!");
        error.statusCode = 403;
        throw error;
      }
      if (post.imageUrl) {
        clearImage(path.join("./images/" + post.imageUrl));
      }
      return post.remove();
    })
    .then(deletedPost => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.posts.pull(postId)
      user.save();
      res.status(200).json({ message: "Post deleted."});
    })
    .catch(err => {
      console.log(err);
      next(err);
    });
};
