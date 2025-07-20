const express = require('express');
const ejsMate = require('ejs-mate');
const path = require('path');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressError = require("./methods/expressClass");

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

app.get("/login", (req, res) => {
    req.session.abc = "Sign Up";
    res.render("authPages/login", {
        title: "Login",
        style: "./LoginStyles/style.css"
    });
});

app.post("/signup", (req, res) => {
    let { type } = req.query;
    res.render("authPages/signup", { type });
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