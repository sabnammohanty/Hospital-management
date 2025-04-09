const Doctor = require("../models/Doctor");
exports.getAdminDashboard = async(req, res) => {
    if (!req.session.user || req.session.user.userType !== "admin") {
        return res.redirect("/auth/login"); // Redirect if not logged in
    }
    const doctors = await Doctor.find();
    res.render("layout", { 
        title: "Admin Dashboard", 
        page: "admin-dashboard.ejs", 
        session: req.session ,
        error: null,
    });
};

exports.getDoctorDashboard = (req, res) => {
    if (!req.session.user || req.session.user.userType !== "doctor") {
        return res.redirect("/auth/login");
    }
    res.render("layout", { 
        title: "Doctor Dashboard", 
        page: "doctors.ejs", 
        session: req.session ,
        error: null
    });
};

exports.getPatientDashboard = (req, res) => {
    if (!req.session.user || req.session.user.userType !== "patient") {
        return res.redirect("/auth/login");
    }
    res.render("layout", { 
        title: "Patient Dashboard", 
        page: "patients.ejs", 
        session: req.session ,
        error: null
    });
};
