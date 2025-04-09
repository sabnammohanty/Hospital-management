const bcrypt = require("bcryptjs");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Patient = require("../models/Patient");
const sendMail = require("../utils/mailer");
const Prescription = require("../models/Prescription");

//----------------------Admin Doctors part-----------------------

exports.getDoctorForm = (req, res) => {
    res.render("layout", {
        title: "Register Doctor",
        page: "add-doctor.ejs",  // EJS file that will contain the form
        error: null,
        session: req.session
    });
};

exports.createDoctor = async (req, res) => {
    const { name, email, password, specialty, phone } = req.body;

    try {
        const existingDoctor = await User.findOne({ email });
        if (existingDoctor) {
            return res.render("layout", {
                title: "Register Doctor",
                page: "doctors-list.ejs",   
                session: req.session,
                error: "Doctor with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newDoctor = new Doctor({
            name,
            email,
            specialty,
            phone,
        });

        await newDoctor.save();
        // console.log("Doctor registered successfully:", newDoctor);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            userType: "doctor"
        });
        await newUser.save();

        res.redirect("/doctors/list"); // Redirect to doctor list page after successful registration
    } catch (error) {
        console.error(error);
        res.render("layout", {
            title: "Register Doctor",
            page: "doctors-list.ejs",
            session: req.session,
            error: "Something went wrong. Try again!"
        });
    }
};


exports.getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.render("layout", {
            title: "Doctor List",
            page: "doctors-list.ejs",
            session: req.session,
            error: null,
            doctors
        });
    } catch (error) {
        console.error(error);
        res.render("layout", {
            title: "Doctor List",
            page: "doctors-list.ejs",
            session: req.session,
            error: "Unable to fetch doctors!"
        });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        const doctorId = req.params.id;
        await Doctor.findByIdAndDelete(doctorId);
        res.redirect("/doctors/list");
    } catch (error) {
        console.error(error);
        res.render("layout", {
            title: "Doctor List",
            page: "doctors-list.ejs",
            session: req.session,
            error: "Error deleting doctor!"
        });
    }
};


//-------------------Doctors part-------------------

// Load Google API credentials (Make sure you create a service account)

// Doctor dashboard
exports.getDashboard = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ email: req.session.user.email });

        if (!doctor) {
            return res.redirect("/");
        }

        // Fetch patients associated with this doctor
        const patients = await Patient.find();
        // console.log(patients);
        
        res.render("layout", {
            title: "Doctor Dashboard",
            page: "doctor-dashboard.ejs",
            session: req.session,
            patients
        });
    } catch (error) {
        console.error("Error fetching doctor dashboard:", error);
        res.redirect("/");
    }
};



// View appointments
exports.getPatientDetails = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.patientId);
        if (!patient) {
            return res.redirect("/doctor/dashboard");
        }
        res.render("layout", {
            title: "Patient Details",
            page: "doctor-appointments.ejs",
            session: req.session,
            patient
        });
    } catch (error) {
        console.error(error);
        res.redirect("/doctor/dashboard");
    }
};

// Schedule Google Meet and send email
exports.scheduleMeet = async (req, res) => {
    try {
        // Fetch patient by patientId from the database
        const patient = await Patient.findById(req.params.patientId);
        if (!patient) return res.redirect("/doctors/dashboard");


        if (!patient.doctor) {
            patient.doctor = req.session.user.id; // Assuming the doctor is logged in as the user
            await patient.save();
        }

        // Generate a unique room name for the Jitsi meeting
        const roomName = `DoctorConsultation-${Date.now()}`;

        // Create Jitsi meeting link
        const jitsiMeetLink = `https://meet.jit.si/${roomName}`;

        // Store the generated Jitsi link in the patient's record
        patient.meetLink = jitsiMeetLink;
        await patient.save();

        // Send email to the patient with the Jitsi Meet link
        const emailContent = `
            Hello ${patient.name},

            Your doctor has scheduled a meeting for you.

            🔗 Jitsi Meet Link: ${jitsiMeetLink}

            Please join at the scheduled time.

            Regards,
            Your Healthcare Team
        `;

        await sendMail(patient.email, "Your Doctor Meeting is Scheduled", emailContent);

        // Redirect to patient's details page after scheduling the meeting
        res.redirect(`/doctors/patient-details/${patient._id}`);
    } catch (error) {
        console.error(error);
        res.redirect("/doctors/dashboard");
    }
};

  


// Add prescription
exports.addPrescription = async (req, res) => {
    try {
        const { patientId, medications, notes } = req.body;
        const doctorId = req.session.user.id;      

        // Validate medications fields
        if (!Array.isArray(medications) || medications.length === 0) {
            return res.redirect("/doctors/dashboard");
        }

        // Ensure each medication has required fields
        for (const med of medications) {
            if (!med.medicine || !med.dosage || !med.instructions) {
                return res.redirect("/doctors/dashboard");
            }
        }

        // Create prescription
        const prescription = new Prescription({
            doctor: doctorId,
            patient: patientId,
            medications, // Directly using the array of medications from request body
            notes
        });

        await prescription.save();

        // Update patient's prescription status
        await Patient.findByIdAndUpdate(patientId, {
            $push: { prescriptions: prescription._id },
            hasPrescription: true
        });

        res.redirect("/doctors/dashboard");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};
