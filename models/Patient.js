const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    contactNumber: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
    },
    address: { type: String, required: true },
    emergencyContact: { type: String, required: true },
    hasPrescription: { type: Boolean, default: false },
    prescriptions: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Prescription" } // ✅ Store prescription IDs
    ],
    medicalHistory: {
        diseases: { type: [String], default: [] },
        allergies: { type: [String], default: [] },
        medications: { type: [String], default: [] }
    },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor"}, // ✅ Assign doctor
    meetLink:{type:String},
    createdAt: { type: Date, default: Date.now }
});

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;