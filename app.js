const express = require('express');
const ejsMate = require('ejs-mate');
const path = require('path');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressError = require("./methods/expressClass");
const passport=require("passport");
const schema = require("./Schema/patientDoctor");
const LocalStrategy = require('passport-local').Strategy;
const flash=require('connect-flash');
const wrapAsync = require("./methods/wrapAsync");
const nodemailer = require('./methods/nodemailer');
app.use(cookieParser());

const sessionConfig = session({
    secret: "My secret key",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000, // Corrected from 3600 to 1000
        httpOnly: true,
    }
});

app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(sessionConfig);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(schema.patient.authenticate()));
passport.use('patient', new LocalStrategy(schema.patient.authenticate()));
passport.use('doctor', new LocalStrategy(schema.doctor.authenticate()));
passport.serializeUser(schema.patient.serializeUser());
passport.deserializeUser(schema.patient.deserializeUser());
passport.serializeUser(schema.doctor.serializeUser());
passport.deserializeUser(schema.doctor.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})
app.get("/login", (req, res) => {
    req.session.abc = "Sign Up";
    res.render("authPages/login", {
        title: "Login",
        style: "./LoginStyles/style.css"
    });
});
app.post("/login", (req, res, next) => {
    const { userType } = req.body;
    const strategy = userType === "doctor" ? "doctor" : userType === "patient" ? "patient" : null;
    if (!strategy) {
        req.flash("error", "Invalid user type");
        return res.redirect("/login");
    }

    passport.authenticate(strategy, (err, user, info) => {
        if (err || !user) {
            req.flash("error", info?.message || "Invalid details");
            return res.redirect("/login");
        }
        req.logIn(user, (err) => {
            if (err) {
                req.flash("error", "Login failed. Try again.");
                return next(err);
            }
            req.flash("success", "Successfully logged in");
            return res.redirect("/home");
        });
    })(req, res, next);
});
app.get("/signup",(req,res)=>{
    let {type}=req.query;
    console.log(type);
    res.render("authPages/signup", { type });
})
app.post("/signup", wrapAsync(async(req, res) => {
    let { type } = req.query;
    if(!type){
        req.flash("error", "Something went wrong. Try again");
        return res.redirect("/login");
    }
    if(type==="patient"){
        const newPatient = new schema.patient({
            name: req.body.name,
            email: req.body.email,
            age: req.body.age,
            username: req.body.username,
        })
        await schema.patient.register(newPatient,req.body.password);
        req.flash("success", `🎉 Welcome to MediBro, ${newPatient.name}! Your patient account has been created. Enjoy personalized health services and real-time care.`);
        await nodemailer.sendMail(
            "customdomain.08@gmail.com",
            req.body.email,
            "Welcome to MediBro!",
            `Hello ${newPatient.name},\n\nWelcome to MediBro! We're excited to have you as a patient.\n\nBest wishes,\nThe MediBro Team`,
            `<div style='font-family:sans-serif;max-width:500px;margin:auto;background:#f9f9f9;border-radius:12px;padding:32px 24px;box-shadow:0 2px 12px #0001;'>
                <h2 style='color:#2b7a78;'>Welcome to <span style='color:#ffb400;'>MediBro</span>!</h2>
                <p>Hi <b>${newPatient.name}</b>,</p>
                <p>We're thrilled to have you join our patient community.<br>
                Enjoy personalized health services and real-time care, all at your fingertips.</p>
                <hr style='border:none;border-top:1px solid #eee;margin:24px 0;'>
                <p style='color:#888;font-size:0.95em;'>Best wishes,<br>The MediBro Team</p>
            </div>`
        );
        return req.login(newPatient, function(err) {
            if (err) { return next(err); }
            return res.redirect('/home');
        });
    } 
    if(type==="doctor"){
        const newDoctor = new schema.doctor({
            name: req.body.name,
            email: req.body.email,
            age: req.body.age,
            experience: req.body.experience,
            username: req.body.username,
        })
        await schema.doctor.register(newDoctor,req.body.password);
        req.flash("success", `👨‍⚕️ Welcome to MediBro, Dr. ${newDoctor.name}! Your doctor account has been created. Start helping patients and managing appointments.`);
        await nodemailer.sendMail(
            "customdomain.08@gmail.com",
            req.body.email,
            "Welcome to MediBro!",
            `Hello Dr. ${newDoctor.name},\n\nWelcome to MediBro! Thank you for joining as a doctor.\n\nBest wishes,\nThe MediBro Team`,
            `<div style='font-family:sans-serif;max-width:500px;margin:auto;background:#f9f9f9;border-radius:12px;padding:32px 24px;box-shadow:0 2px 12px #0001;'>
                <h2 style='color:#2b7a78;'>Welcome to <span style='color:#ffb400;'>MediBro</span>!</h2>
                <p>Hi <b>Dr. ${newDoctor.name}</b>,</p>
                <p>Thank you for joining MediBro as a doctor.<br>
                Start helping patients and managing appointments with ease.</p>
                <hr style='border:none;border-top:1px solid #eee;margin:24px 0;'>
                <p style='color:#888;font-size:0.95em;'>Best wishes,<br>The MediBro Team</p>
            </div>`
        );
        return req.login(newDoctor, function(err) {
            if (err) { return next(err); }
            return res.redirect('/home');
        });
    }
    req.flash("error", "Something went wrong. Try again");
    return res.redirect('/login');
    
}));
app.get("/home",(req,res)=>{
    if(req.isAuthenticated()){
        return res.render('./Home/home.ejs');
    }
    req.flash("error","You are not logged In");
    return res.redirect("/login");
});
app.all('*',(req,res)=>{
    throw new expressError(404,"Page not Found");
})

app.use((err, req, res, next) => {
    let { status = 500, message = "Something went Wrong" } = err;
    res.status(status).render("error", { status, message});
});

app.listen(8081, () => {
    console.log("Connected...");
});