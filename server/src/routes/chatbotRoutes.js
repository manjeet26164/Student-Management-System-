const express = require("express");
const rateLimit = require("express-rate-limit");
const { protect, authorize } = require("../middleware/authMiddleware");
const { askChatbot } = require("../controllers/chatbotController");

const router = express.Router();

const chatLimiter = rateLimit({ windowMs: 60 * 1000, max: 15 });

router.post("/query", protect, authorize("student", "faculty", "admin"), chatLimiter, askChatbot);

module.exports = router;