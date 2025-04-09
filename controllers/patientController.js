const Patient = require("../models/Patient");
const Prescription = require("../models/Prescription");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require("path");


// Render the patient registration form
exports.getRegisterForm = (req, res) => {
    res.render("layout", { title: "Register Patient", page: "patients-register.ejs", session: req.session });
};

// Handle patient registration
exports.registerPatient = async (req, res) => {
    try { 
        const { name, age, gender, contactNumber, email, address, emergencyContact, diseases, allergies, medications } = req.body;

        const newPatient = new Patient({
            name,
            age,
            gender,
            contactNumber,
            email,
            address,
            emergencyContact,
            medicalHistory: {
                diseases: diseases.split(","),
                allergies: allergies.split(","),
                medications: medications.split(",")
            }
        });

        await newPatient.save();
        res.redirect("/patients/dashboard");
    } catch (error) {
        console.error(error);
        res.render("layout", { title: "Register Patient", error: "Something went wrong!", page: "patients-register.ejs", session: req.session });
    }
};

// View patient dashboard
exports.getDashboard = async (req, res) => {
    try {
        const patients = await Patient.find();
        res.render("layout", { title: "Patient Dashboard", page: "patients-dashboard.ejs", session: req.session, patients });
    } catch (error) {
        console.error(error);
        res.render("layout", { title: "Patient Dashboard", error: "Something went wrong!", page: "patients-dashboard.ejs", session: req.session });
    }
};

// Edit patient details (Render Edit Form)
exports.getEditForm = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        res.render("layout", { title: "Edit Patient", page: "patients-edit.ejs", session: req.session, patient,error: null });
    } catch (error) {
        console.error(error);
        res.redirect("/patients/dashboard");
    }
};

// Handle Edit Patient Details
exports.editPatient = async (req, res) => {
    try {
        const { name, age, gender, contactNumber, email, address, emergencyContact, diseases, allergies, medications } = req.body;

        await Patient.findByIdAndUpdate(req.params.id, {
            name, age, gender, contactNumber, email, address, emergencyContact,
            medicalHistory: {
                diseases: diseases.split(","),
                allergies: allergies.split(","),
                medications: medications.split(",")
            }
        });
        req.session.successMessage = "Patient details updated successfully!";
        res.redirect("/patients/dashboard");
    } catch (error) {
        console.error(error);
        res.redirect("/patients/dashboard");
    }
};

// Delete patient
exports.deletePatient = async (req, res) => {
    try {
        await Patient.findByIdAndDelete(req.params.id);
        res.redirect("/patients/dashboard");
    } catch (error) {
        console.error(error);
        res.redirect("/patients/dashboard");
    }
};


// Download prescription as PDF
exports.downloadPrescription = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.patientId) 
        .populate('prescriptions')
        .populate('doctor')
        .populate('prescriptions.doctor');  // Ensure doctor is populated in each prescription
        
        if (!patient || !patient.prescriptions) {
            return res.status(404).send("Prescription not found.");
        }

        // Create a PDF document
        const doc = new PDFDocument({ margin: 30 });
        const filePath = path.join(__dirname, `../prescriptions/prescription-${patient._id}.pdf`);
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Title
        doc.fontSize(20).text("Medical Prescription", { align: "center" });
        doc.moveDown(1);

        // Patient Details Table
        doc.fontSize(12).text("Patient Details", { underline: true });
        doc.moveDown(0.5);
        
        const tableTop = doc.y;
        const tableX = 50;
        const tableWidth = 500;

        // Draw Table Headers
        doc.rect(tableX, tableTop, tableWidth, 25).stroke();
        doc.text("Name", tableX + 5, tableTop + 5);
        doc.text("Age", tableX + 120, tableTop + 5);
        doc.text("Gender", tableX + 180, tableTop + 5);
        doc.text("Email", tableX + 250, tableTop + 5);
        doc.text("Doctor", tableX + 400, tableTop + 5);

        // Patient Data
        const rowY = tableTop + 30;
        doc.rect(tableX, rowY, tableWidth, 25).stroke();
        doc.text(patient.name, tableX + 5, rowY + 5);
        doc.text(patient.age.toString(), tableX + 120, rowY + 5);
        doc.text(patient.gender, tableX + 180, rowY + 5);
        doc.text(patient.email, tableX + 250, rowY + 5);
        doc.text(patient.doctor ? patient.doctor.name : "N/A", tableX + 400, rowY + 5);
        
        doc.moveDown(2);

        // Medical History Table
        doc.fontSize(12).text("Medical History", { underline: true });
        doc.moveDown(0.5);

        const historyTableTop = doc.y;

        // Column Widths
        const col1Width = 180;
        const col2Width = 170;
        const col3Width = 150;
        const rowHeight = 40; // Dynamically adjust later

        // Draw Table Headers
        doc.rect(tableX, historyTableTop, tableWidth, 25).stroke();
        doc.text("Diseases", tableX + 5, historyTableTop + 5);
        doc.text("Allergies", tableX + col1Width + 5, historyTableTop + 5);
        doc.text("Medications", tableX + col1Width + col2Width + 5, historyTableTop + 5);

        // History Data with Wrapping
        const historyRowY = historyTableTop + 30;
        doc.rect(tableX, historyRowY, tableWidth, rowHeight).stroke();
        
        // Ensure we handle undefined or null arrays
        doc.text((patient.medicalHistory.diseases || []).join(", ") || "N/A", tableX + 5, historyRowY + 5, {
            width: col1Width - 10,
            lineBreak: true
        });

        doc.text((patient.medicalHistory.allergies || []).join(", ") || "N/A", tableX + col1Width + 5, historyRowY + 5, {
            width: col2Width - 10,
            lineBreak: true
        });

        doc.text((patient.medicalHistory.medications || []).join(", ") || "N/A", tableX + col1Width + col2Width + 5, historyRowY + 5, {
            width: col3Width - 10,
            lineBreak: true
        });

        doc.moveDown(2);

        // Prescriptions Table
        doc.fontSize(12).text("Prescriptions", { underline: true });
        doc.moveDown(0.5);

        const prescriptionTableTop = doc.y;

        // Prescription Table Columns
        const col1PresWidth = 150;
        const col2PresWidth = 120;
        const col3PresWidth = 100;
        const col4PresWidth = 130;

        // Draw Table Headers for Prescriptions
        doc.rect(tableX, prescriptionTableTop, tableWidth, 25).stroke();
        doc.text("Medications", tableX + 5, prescriptionTableTop + 5);
        doc.text("Doctor", tableX + col1PresWidth + 5, prescriptionTableTop + 5);
        doc.text("Date", tableX + col1PresWidth + col2PresWidth + 5, prescriptionTableTop + 5);
        doc.text("Notes", tableX + col1PresWidth + col2PresWidth + col3PresWidth + 5, prescriptionTableTop + 5);

        // Loop Through Prescriptions and Print Details
        let presRowY = prescriptionTableTop + 30;
        patient.prescriptions.forEach((prescription, index) => {
            doc.rect(tableX, presRowY, tableWidth, rowHeight).stroke();
            
            doc.text(
                (prescription.medications && Array.isArray(prescription.medications)) 
                    ? prescription.medications
                        .map(med => `${med.medicine} (${med.dosage})`) // Format each medication
                        .join(", ") // Join them with commas
                    : "No medications available", // Fallback text if medications are undefined or not an array
                tableX + 5, 
                presRowY + 5, 
                {
                    width: col1PresWidth - 10,
                    lineBreak: true
                }
            );
            
            doc.text(prescription.doctor ? prescription.doctor.name : "N/A", tableX + col1PresWidth + 5, presRowY + 5, {
                width: col2PresWidth - 10,
                lineBreak: true
            });

            doc.text(prescription.date ? prescription.date.toISOString().split("T")[0] : "N/A", tableX + col1PresWidth + col2PresWidth + 5, presRowY + 5, {
                width: col3PresWidth - 10,
                lineBreak: true
            });

            doc.text(prescription.notes || "No notes", tableX + col1PresWidth + col2PresWidth + col3PresWidth + 5, presRowY + 5, {
                width: col4PresWidth - 10,
                lineBreak: true
            });

            presRowY += rowHeight + 10; // Move down for next prescription row
        });

        doc.end();

        // Handle file download
        stream.on("finish", () => {
            res.download(filePath, `prescription-${patient._id}.pdf`, (err) => {
                if (err) console.error("Download Error:", err);
                fs.unlinkSync(filePath); // Delete the file after download
            });
        });

    } catch (error) {
        console.error("Error generating prescription:", error);
        res.status(500).send("Error generating prescription.");
    }
};