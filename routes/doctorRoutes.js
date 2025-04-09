const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const authMiddleware = require("../middleware/authMidle");

//--------------------Admin part--------------------------

// Show Doctor Registration Form
router.get("/register", doctorController.getDoctorForm);

// Handle Doctor Registration
router.post("/register", doctorController.createDoctor);

// Show Doctor List
router.get("/list", doctorController.getDoctors);

// Delete Doctor
router.post("/delete/:id", doctorController.deleteDoctor);

//---------------------Doctors part----------------------------

// Doctor dashboard
router.get("/dashboard", authMiddleware, doctorController.getDashboard);

// View bookings
router.get("/patient-details/:patientId", authMiddleware, doctorController.getPatientDetails);

// Schedule meeting
router.post("/schedule-meet/:patientId", authMiddleware, doctorController.scheduleMeet);

// Add prescription
router.post("/add-prescription/:patientId", authMiddleware, doctorController.addPrescription);

// Download prescription

module.exports = router;