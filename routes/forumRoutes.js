const express = require("express");
const router = express.Router();
const { getDB } = require("../db/mongo");

// Middleware לבדיקה של משתמש רשום
function isAuthenticated(req, res, next) {
  if (req.user) return next();
  res.status(401).json({ error: "Not authenticated" });
}

// קבלת כל הפורומים
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const forums = await getDB().collection("forums").find().toArray();
    res.json(forums);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// קבלת אשכולות לפי forumId
router.get("/:forumId/threads", isAuthenticated, async (req, res) => {
  try {
    const threads = await getDB()
      .collection("threads")
      .find({ forumId: req.params.forumId })
      .toArray();
    res.json(threads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// יצירת אשכול חדש
router.post("/:forumId/threads", isAuthenticated, async (req, res) => {
  try {
    const { title } = req.body;
    const newThread = {
      forumId: req.params.forumId,
      title,
      authorId: req.user._id,
      createdAt: new Date(),
    };
    const result = await getDB().collection("threads").insertOne(newThread);
    res.json(result.ops[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// הוספת פוסט לאשכול
router.post("/threads/:threadId/posts", isAuthenticated, async (req, res) => {
  try {
    const { content } = req.body;
    const newPost = {
      threadId: req.params.threadId,
      authorId: req.user._id,
      content,
      createdAt: new Date(),
    };
    const result = await getDB().collection("posts").insertOne(newPost);
    res.json(result.ops[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
