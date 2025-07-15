const express = require('express');
const ejsMate = require('ejs-mate');
const path = require('path');
const app = express();

app.engine('ejs', ejsMate);
app.set("view engine","ejs");

app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended: true}));

app.get("/login",(req,res)=>{
    res.render("./authPages/login.ejs",{title: "Login",style: "./LoginStyles/style.css"});
})
app.listen(8081,()=>{
    console.log("Connected...");
})