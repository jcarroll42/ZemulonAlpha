var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();

app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(express.static('public'));

app.get('/', function (req, res){
	res.sendFile(path.join(__dirname, 'index.html'));
});

var port = process.env.PORT || 3000; 
app.listen(port);