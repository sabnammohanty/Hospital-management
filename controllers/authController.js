const User = require("../models/User");
const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");


exports.getSignupPage = (req, res) => {
  res.render("layout", { title: "Sign up", page:"signup.ejs",error:null,session: req.session });
};

// Handle Signup Form Submission
exports.postSignup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.render("layout", { title: "Sign Up", error: "User already exists! Redirecting to login...",page:"signup.ejs",session: req.session });
      }

      // Hash Password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();

      // Redirect to Login after Signup
      res.redirect("/auth/login");
  } catch (error) {
      console.error("Signup Error:", error);
      res.render("layout", { title: "Sign Up", error: "Something went wrong. Try again.",page:"signup.ejs" ,session: req.session});
  }
};

exports.getLoginPage = (req, res) => {
  res.render("layout",{ title: "Login page",page: "login.ejs",session: req.session });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
      const user = await User.findOne({ email });
    
      if (!user) {
          return res.render("layout", { 
              title: "Login", 
              error: "Invalid email or password.", 
              page: "login.ejs", 
              session: req.session 
          });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.render("layout", { 
              title: "Login", 
              error: "Invalid email or password.", 
              page: "login.ejs", 
              session: req.session 
          });
      }

      // Store user in session
      req.session.user = { id: user._id, email: user.email, userType: user.userType };
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24; // Session expires in 1 day

      // ✅ Redirect to correct dashboard endpoint
      if (user.userType === "admin") {
          return res.redirect("/admin-dashboard");
        } else if (user.userType === "patient") {
            return res.redirect("/patients/dashboard");
        }else if (user.userType === "doctor") {
            return res.redirect("/doctors/dashboard");
        }
      return res.redirect("/");
  } catch (error) {
      console.error(error);
      res.render("layout", { 
          title: "Login", 
          error: "Something went wrong!", 
          page: "login.ejs", 
          session: req.session 
      });
  }
};




exports.getAdminDashboard = async (req, res) => {
  if (!req.session.user || req.session.user.userType !== "admin") {
      return res.redirect("/auth/login");
  }

  const doctors = await User.find({ userType: "doctor" });
  const patients = await User.find({ userType: "patient" });

  res.render("layout", { title: "Admin Dashboard", doctors, patients, session: req.session });
};


exports.createDoctor = async (req, res) => {
  if (!req.session.user || req.session.user.userType !== "admin") {
    return res.redirect("/");
  }
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashedPassword, userType: "doctor" });
  res.redirect("/admin-dashboard");
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/auth/login");
    });
};
