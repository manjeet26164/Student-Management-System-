const express = require("express");
const rateLimit = require("express-rate-limit");
const { login, getMe, changePassword, logout } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { loginSchema, changePasswordSchema } = require("../validators/authValidators");

const router = express.Router();

// Max 5 login attempts per 15 min per IP — blocks brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many login attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/change-password", protect, validate(changePasswordSchema), changePassword);

module.exports = router;
