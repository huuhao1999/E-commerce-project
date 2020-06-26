const express = require('express');
const exphbs = require('express-handlebars');
const hbs_sections = require('express-handlebars-sections');
const session = require('express-session');
var passport = require("passport");
require('express-async-errors');
const FacebookStrategy = require("passport-facebook").Strategy;
const config = require('./config/keyloginFB');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./config/keyloginGG');
const bodyParser = require("body-parser");
const app = express();
var cookieParser = require("cookie-parser");
var flash = require("connect-flash");
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));



// Use the FacebookStrategy within Passport.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
passport.use(new FacebookStrategy({
  clientID: config.facebook_api_key,
  clientSecret: config.facebook_api_secret,
  callbackURL: config.callback_url
},
function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
      console.log(accessToken, refreshToken, profile, done);
      return done(null, profile);
  });
}
));
// passport gg
passport.use(
new GoogleStrategy({
  // options for google strategy
  clientID: keys.google.clientID,
  clientSecret: keys.google.clientSecret,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  process.nextTick(function() {
      console.log(accessToken, refreshToken, profile, done);
      return done(null, profile);
  });
})
);
app.use(passport.initialize());
app.use(passport.session());

//config cho express handlebars
//app.use(morgan('dev'));
app.use(cookieParser());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(bodyParser.json());

//Config session to setting login
app.use(
    session({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: true
    })
);
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});


const hbs = exphbs.create({
    defaultLayout: "main",
    extname: "hbs",
    helpers: {
        section: hbs_sections(),
        format: val => numeral(val).format("0,0")
    }
});
// config view engine using handlebars
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
//Config dir to using multi css, js
app.use(express.static(__dirname + "/public"));

app.use(flash());
//điều hướng về controller




//app.use((req, res, next) => {
  // res.render('vwError/404');
//  res.send('You\'re lost');
//})

//
// default error handler

//app.use((err, req, res, next) => {
  // res.render('vwError/index');
 // console.error(err.stack);
 // res.status(500).send('View error on console.');
//})

require("./middlewares/locals.mdw")(app);
require("./middlewares/routes.mdw")(app);


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
})