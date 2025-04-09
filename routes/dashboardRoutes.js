const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const userAuth = require("../middleware/authMidle");


router.get("/admin-dashboard",userAuth, dashboardController.getAdminDashboard);
router.get("/dashboard",userAuth, dashboardController.getDoctorDashboard);
router.get("/dashboard",userAuth, dashboardController.getPatientDashboard);

module.exports = router;