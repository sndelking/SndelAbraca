require("babel-core/register")
var express = require('express');
var path = require("path");
var url = require('url');
var bodyParser = require('body-parser');
var app = express();

var RouterListener = require('./server/router/index.router');
app.use(express.static(__dirname));
RouterListener.addListener(app)

var urlencodedParser = bodyParser.urlencoded({ extended: false });


// app.post('/leaveRoom', urlencodedParser, function (req, res) {
// 	var room = (GameSys.rooms[req.body.roomID]);
// 	var ip = req.connection.remoteAddress;
// 	room.removePlayer(ip);
// 	res.end();
// })


// app.get('/joined-room', function (req, res) {
// 	let player = GameSys.ipHash[req.connection.remoteAddress];
// 	let roomID = player ? player.roomID : null;
// 	let status = 0;
// 	if(roomID!==null)	status = 1
// 	let data = {
// 		"status": status,
// 		"roomID": roomID
// 	}
// 	res.end(JSON.stringify(data));
// })

// 
// app.get('/unready', function (req, res) {
// 	let player = GameSys.ipHash[req.connection.remoteAddress];
// 	let room = GameSys.rooms[player.roomID];
// 	let playerPos = player ? player.pos : null;
// 	if (playerPos !== null) room.unready(playerPos);
// 	let data = {
// 		"room": GameSys.rooms[player.roomID].info(playerPos),
// 		"playerPos": playerPos
// 	}
// 	res.end(JSON.stringify(data));
// })

// app.get('/endTurn', (req, res) => {
// 	let player = GameSys.ipHash[req.connection.remoteAddress];
// 	let room = GameSys.rooms[player.roomID];
// 	let playerPos = player ? player.pos : null;
// 	if (playerPos !== null) room.endTurn();
// 	let data = {
// 		"room": GameSys.rooms[player.roomID].info(playerPos),
// 		"playerPos": playerPos
// 	}
// 	res.end(JSON.stringify(data));
// })

app.get('/', function (req, res) {
	res.sendFile(__dirname + "/index.html");
});

app.get('/favicon.ico', function (req, res) {
	res.sendFile(`${__dirname}/favicon.ico`);
});

app.get('/:file', function (req, res) {
	res.sendFile(`${__dirname}/${req.params.file}.html`);
});
var server = app.listen(8080);
console.log("server started.");