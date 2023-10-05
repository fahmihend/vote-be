const express = require('express');
const connection = require('./connection');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors')

connection();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.JWT_SECRET, // Change this to a strong secret
  resave: false,
  saveUninitialized: true,
}));
app.use(cors())
// set ejs view engine
app.use(express.static(__dirname + '/views'))

// set router
const indexRoutes = require('./routes/routes.js');
app.use('/', indexRoutes);


module.exports = app;