var express = require('express');
var path    = require('path');
var http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require("mongoose");
// in the requirements section
var ejsLayouts = require("express-ejs-layouts");

var configDB = require('./configs/database');
var settings = require('./configs/settings');

//Frontend Router
var homepage_Router = require('./routers/router_homepage')

var app = express();

//Connection database
mongoose.connect(configDB.conectionString);
mongoose.connection.on('error', function(err) {
    console.log('Lỗi kết nối đến CSDL: ' + err);
});

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Set view engine to ejs
app.engine('ejs', require('ejs-locals'));
app.set("view engine", "ejs"); 
app.set('layout', path.join(__dirname,'/templates/layouts/home_layout'));
app.use(ejsLayouts);
app.set("views", path.join(__dirname, 'templates/views')); 

// Use Router Frontend
app.use('/', homepage_Router);

// some environment variables
app.set('port', process.env.PORT || 3000);
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });