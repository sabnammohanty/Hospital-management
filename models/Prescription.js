const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true }, // Link to Doctor
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true }, // Link to Patient
    medications: [
        {
            medicine: { type: String, required: true },
            dosage: { type: String, required: true },
            notes: { type: String }
        }
    ],
    notes: { type: String },
    date: { type: Date, default: Date.now }
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);
module.exports = Prescription;
