//1.including package in our node.js
var mysql = require("mysql");
var express = require("express");
var session = require("express-session");
var bodypParser = require("body-parser");
var path = require("path");

//2.connect to database
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nodeloginX"
});

//3.use Packages
var app = express();
//view engine setup
app.set("views", path.join(__dirname,"views"));
app.set('view engine', 'ejs');

//4.save login status
app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true
    })
);

app.use(express.urlencoded({extended: true}));
app.use(express.json());

//5.client connect to server
app.get("/login", function(request, respond){
    respond.sendFile(path.join(__dirname + "/login.html"));
});

//6. handle the post request
app.post("/auth", function(request, response){
    var username = request.body.username;
    var password = request.body.password;

    if (username && password) {
        connection.query(
            "SELECT * FROM accounts WHERE username = ? AND password = ?",
            [username, password],
            function(error, results, fields) {
                // console.log(username);
                if (results.lenght > 0) {
                    request.session.loggedin = true;
                    request.session.username = username;
                    //respond.redirect("/home");
                    response.redirect("/webboard");
                } else {
                    response.send("Incorrect Username and/or Password!");
                }
                response.end();
            })}})

//7.home page we can handle with get
app.get("/home", function(request, response) {
    if (request.session.loggedin) {
        response.send("Welcome back, " + request.session.username + "!");
    } else {
        response.send("Please login to view this page!");
    }
    response.end();
});

app.get("/signout", function(request, response) {
    request.session.destroy(function (err) {
        response.send("Signout ready!");
        response.end();
    });
});

app.get("/webboard", (req, res) => {
    if (req.session.loggedin)
    connection.query("SELECT * FROM accounts", (err, result) => {
        res.render("index.ejs", {
            posts: result
        });
        console.log(result);
    });
    else
        res.send("You must login first!");
        console.log("You must login first!");
});

//running port 9000
app.listen(9000);
console.log("running on port 9000...")