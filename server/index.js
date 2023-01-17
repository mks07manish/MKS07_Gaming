//jshint esversion:6

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const bodyparser = require("body-parser");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();
app.use(cors());
// const path = require('path');
// const buildPath = path.join(__dirname, '..', 'build');
// app.use(express.static(buildPath));


app.use(bodyparser.urlencoded({extended:false}))

app.use(express.json());
app.use(express.urlencoded());

app.use(session({
    secret: "Our little gaming.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// const DB = process.env.MONGO_URI;
const DB = "mongodb://localhost:27017/mks_gaming";

mongoose.connect(DB, {
    useNewUrlParser: true
    // useUnifiedTopology: true
  }, () => {
    console.log("DB connected")
})

// create schema for user
const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// create model
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

// define routes

app.post("/register", function(req, res){
    User.register({username: req.body.username, name: req.body.name}, req.body.password, function(err, user){
      if(err) {
        res.send({message: err});
        // res.render("register");
      }
      else {
        passport.authenticate("local")(req,res, function(){
            res.send({message : " Successfully registered" });
        });
      }
    });
});

// app.post("/register", (req, res) => {
//     const {name, email, password} = req.body;

//     User.findOne({email: email}, (err, user) => {
//         if(user){
//             res.send({message: "User already registered.."});
//         } else {
//             const user = new User({
//                 name,
//                 email,
//                 password
//             });
//             user.save( err => {
//                 if(err) {
//                     res.send(err);
//                 } 
//                 else {
//                     res.send({message : " Successfully registered" });
//                 }
//             });
//         }
//     });
// });

app.post("/login", function(req, res){
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
    req.login(user, function(err){
      if (err) {
        console.log(err);
        res.send({message: err});
      } else {
        passport.authenticate("local")(req, res, function(){
        //   res.redirect("/reveal");
            res.send({user: user});
        });
      }
    });
});

// app.post("/login", (req, res) => {
//     const {email, password} = req.body;
//     User.findOne({email: email}, (err, user) => {
//         if(user) {
//             if(password === user.password) {
//                 res.send({user: user});
//             }
//             else {
//                 res.send({message: "Password not matched..."});
//             }
//         } else {
//             res.send({message: "User not registered..."});
//         }
//     });
// });


const PORT = 9002;

app.listen(PORT, () => {
    console.log(`Backend started on port ${PORT}`);
})
