const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { redirectIfLoggedIn } = require("../middleware/authMiddleware");

router.get("/signup", authController.getSignupPage);
router.post("/signup", authController.postSignup);
router.get("/login",redirectIfLoggedIn, authController.getLoginPage);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/admin-dashboard", authController.getAdminDashboard);
router.post("/admin/create-doctor", authController.createDoctor);

module.exports = router;