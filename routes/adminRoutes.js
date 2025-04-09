const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware");

// Admin Dashboard Route
router.get("/admin-dashboard", isAdmin, adminController.getAdminDashboard);
router.post("/create-doctor", isAdmin, adminController.createDoctor);
module.exports = router;
