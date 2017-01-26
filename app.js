var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var env = require('node-env-file');

// Load environment variables for localhost
try {
  env(__dirname + '/.env');
} catch (e) {}

var app = express();

var port = process.env.PORT || 5000;
var https_port = process.env.HTTPS_PORT || parseInt(port) + 1;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/node/ejs/pages');

app.use(express.static(__dirname + '/node'));

app.get('/', function(req, res) {
  res.render('sharetospace', {appId: process.env.APPLICATION_ID, appSecret: process.env.APPLICATION_SECRET, verseHost: process.env.VERSE_HOST});
});

app.get('/sharetospace', function(req, res) {
  res.render('sharetospace', {appId: process.env.APPLICATION_ID, appSecret: process.env.APPLICATION_SECRET, verseHost: process.env.VERSE_HOST});
});

app.get('/createspace', function(req, res) {
  res.render('createspace', {appId: process.env.APPLICATION_ID, appSecret: process.env.APPLICATION_SECRET, verseHost: process.env.VERSE_HOST});
});

// Create an HTTP service
http.createServer(app).listen(port);
console.log("Server listening for HTTP connections on port ", port);

// Create an HTTPS service if the certs are present
try {
  var options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('key-cert.pem')
  };
  https.createServer(options, app).listen(https_port);
  console.log("Server listening for HTTPS connections on port ", https_port);
} catch (e) {
  console.error("Security certs not found, HTTPS not available");
}