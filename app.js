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

app.get("/signup",(req,res)=>{
    let {type}=req.query;
    console.log(type);
    res.render("authPages/signup", { type });
})
app.post("/signup", async(req, res) => {
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
        })
        await schema.patient.register(newPatient,req.body.password);
        req.flash("success", "You have successfully logged in as Patient");
        return res.redirect("/login");
    } 
    if(type==="doctor"){
        const newPatient = new schema.patient({
            name: req.body.name,
            email: req.body.email,
            age: req.body.age,
            experience: req.body.experience,
        })
        await schema.patient.register(newPatient,req.body.password);
        req.flash("success", "You have successfully logged in as Doctor");
        return res.redirect("/login");
    }
    req.flash("error", "Something went wrong. Try again");
    return res.redirect('/login');
    
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