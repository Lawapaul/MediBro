module.exports = function(req, res, next) {
    if (!req.isAuthenticated()) {
        req.flash("error", "You are not logged In");
        return res.redirect("/login");
    }
    next();
};