var express = require('express');
var path    = require('path');
var http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var i18n = require('i18n')
var mongoose = require("mongoose");
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');

// in the requirements section
var ejsLayouts = require("express-ejs-layouts");

var configDB = require('./configs/database');
var settings = require('./configs/settings');

//Frontend Router
var homepage_Router = require('./routers/router_homepage');
var member_Router = require('./routers/router_users/router_member')

var app = express();

mongoose.connect(configDB.conectionString);

mongoose.connection.on('error', function(err) {
    console.log('Lỗi kết nối đến CSDL: ' + err);
});
require('./configs/passport');
//require('configs/passport');

app.use(validator());
//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Set view engine to ejs
app.engine('ejs', require('ejs-locals'));
app.set("view engine", "ejs"); 
app.set('layout', path.join(__dirname,'/templates/layouts/home_layout'));
app.use(ejsLayouts);
app.set("views", path.join(__dirname, 'templates/views')); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}))

app.use(cookieParser());
// setting i18n
i18n.configure({
    locales: ['en', 'vi'],
    register: global,
    fallbacks: {'en' : 'vi'},
    cookie: 'language',
    queryParameter: 'lang',
    defaultLocale: 'en',
    directory: __dirname + '/languages',
    autoReload: true,
    updateFiles: true,
    api: {
        '__' : '__',
        '__n' : '__n'
    },
    
})
app.use(function(req, res, next){
    i18n.init(req, res, next);
});

app.use(session({
    secret : settings.secured_key,
    resave : false,
    saveUninitialized : false
}))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next){
    res.locals.clanguage = req.getLocale();
    res.locals.languages = i18n.getLocales();
    next();
})
app.use("/change-lang/:lang", (req, res) => { 
    res.cookie('language', req.params.lang, { maxAge: 900000 });
    res.redirect('back');
    //console.log("hear"+i18n.getLocales())
});

// Use Router Frontend
app.use('/', homepage_Router);
app.use('/thanh-vien', member_Router);

// some environment variables
app.set('port', process.env.PORT || 3000);
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });