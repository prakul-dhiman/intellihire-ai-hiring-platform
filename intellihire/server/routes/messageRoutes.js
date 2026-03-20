const express = require("express");
const { getMessages, sendMessage, getConversations, getUnreadCount } = require("../controllers/messageController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect); // All routes require authentication

router.get("/conversations", getConversations);
router.get("/unread-count", getUnreadCount);
router.get("/:userId", getMessages);
router.post("/send", sendMessage);

module.exports = router;
