require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");


const app = express();
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(express.json());

app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: false, 
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24*365*100 // 100 years 
    }
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session; // Make session accessible in EJS
  next();
});

// Routes
app.use("/auth",authRoutes);
app.use("/", dashboardRoutes);
app.use("/", patientRoutes);
app.use("/doctors", doctorRoutes);



app.get("/", (req, res) => {
  console.log("Session Data:", req.session);
  req.session.cookie.maxAge = 1000 * 60 * 60 * 24;
  res.render("layout", { title: "Home",page: "index.ejs",session:req.session });
});
app.get("/*", (req, res) => {
  res.render("layout", { title: "Error",page: "404.ejs" });
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected✅"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));