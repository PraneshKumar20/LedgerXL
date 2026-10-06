const express = require("express");
const router = express.Router();
const { Signup, Login, completeOnboarding } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup", Signup);
router.post("/login", Login);
router.put("/onboarding", authMiddleware, completeOnboarding);

module.exports = router;