const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const authMiddleware = require("../middleware/authMidle");

// Patient Registration
router.get("/patients/register", authMiddleware, patientController.getRegisterForm);
router.post("/patients/register", authMiddleware, patientController.registerPatient);

// Patient Dashboard
router.get("/patients/dashboard", authMiddleware, patientController.getDashboard);

// Edit Patient
router.get("/patients/edit/:id", authMiddleware, patientController.getEditForm);
router.post("/patients/edit/:id", authMiddleware, patientController.editPatient);

// Delete Patient
router.post("/patients/delete/:id", authMiddleware, patientController.deletePatient);
router.get("/patients/download-prescription/:patientId/download", authMiddleware, patientController.downloadPrescription);


module.exports = router;
