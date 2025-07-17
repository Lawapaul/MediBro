const express = require('express');
const ejsMate = require('ejs-mate');
const path = require('path');
const app = express();
const session = require('express-session')
const cookieParser = require('cookie-parser')

app.use(cookieParser())
const sesssionConfig = session({
    secret: "My secret key",
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*3600,
        httpOnly: true,
    }
})

app.engine('ejs', ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended: true}));
app.use(sesssionConfig);



app.get("/login",(req,res)=>{
    req.session.abc= "Sign Up";
    res.render("./authPages/login.ejs",{title: "Login",style: "./LoginStyles/style.css"});
})
app.get("/signup",(req,res)=>{
    res.send(req.session.abc);
})
app.listen(8081,()=>{
    console.log("Connected...");
})