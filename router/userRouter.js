const express = require("express");
const router = express.Router();
const passport = require("passport");
const { savedRedirectedUrl } = require("../middleware");
const userController = require("../controllers/user");

// Signup Form & Route
router
  .route("/signup")
  .get(userController.signupForm)
  .post(userController.signupRoute);

// Login Form & Route
router
  .route("/login")
  .get(userController.loginForm)
  .post(
    savedRedirectedUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.loginRoute
  );

// Logout Route
router.get("/logout", userController.logoutRoute);

module.exports = router;
