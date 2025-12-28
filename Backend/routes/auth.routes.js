const express = require("express");
const passport = require("passport");
const { signup, login , getMe } = require("../controllers/auth.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const router = express.Router();

// Signup
router.post("/signup", signup);

// Login (Passport Local Strategy)
router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  login
);

router.get("/me", isAuthenticated, getMe);

module.exports = router;
