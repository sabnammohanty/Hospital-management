exports.isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.userType !== "admin") {
        return res.redirect("/auth/login");
    }
    next();
};


exports.redirectIfLoggedIn = (req, res, next) => {
  if (req.session.user) {
      return res.redirect(`/${req.session.user.userType}-dashboard`); // Redirect based on role
  }
  next();
};


exports.isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
      return res.redirect("/auth/login"); // Redirect to login if not authenticated
    }
    next(); // Allow access if authenticated
  };