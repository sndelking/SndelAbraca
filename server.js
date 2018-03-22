require("babel-core/register")
var express = require('express');
var path = require("path");
var url = require('url');
var bodyParser = require('body-parser');
var app = express();
var GameSys = require('./server/GameSys');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static(__dirname));

app.post('/enterRoom', urlencodedParser, (req, res) => {
	let joinRoomID = req.body.roomID;
	let joinRoom = GameSys.rooms[joinRoomID];
	let ip = req.connection.remoteAddress;
	let player = GameSys.ipDictionary[ip];
	let oldRoomID = player ? player.roomID : null;
	let oldRoom = oldRoomID ? GameSys.rooms[oldRoomID] : null;
	let data = { code: 0 }
	if (joinRoomID != oldRoomID) {
		data.code = joinRoom.joinableCode()
		if (data.code == 0) {
			oldRoom ? oldRoom.removePlayer(ip) : null;
			GameSys.ipDictionary[ip] = joinRoom.addPlayer(ip, req.body.name)
		}
	}
	res.end(JSON.stringify(data))
})

app.get('/getNewRoomID', (req, res) => {
	GameSys.newRoom();
	var data = {
		"roomID": GameSys.rooms.length - 1
	};
	res.end(JSON.stringify(data));
})

app.post('/leaveRoom', urlencodedParser, function (req, res) {
	var room = (GameSys.rooms[req.body.roomID]);
	var ip = req.connection.remoteAddress;
	room.removePlayer(ip);
	res.end();
})

app.get('/refresh', (req, res) => {
	let player = GameSys.ipDictionary[req.connection.remoteAddress];
	let playerPos = player ? player.pos : null;
	let data = {
		"room": GameSys.rooms[player.roomID].info(playerPos),
		"playerPos": playerPos
	}
	res.end(JSON.stringify(data));
})

app.post('/excuteCard', urlencodedParser, function (req, res) {
	let cardNum = parseInt(req.body.cardNum);
	let player = GameSys.ipDictionary[req.connection.remoteAddress];
	let playerPos = player ? player.pos : null;
	let roomID = player ? player.roomID : null;
	let room = GameSys.rooms[roomID];
	let status = room.excuteCard(cardNum, playerPos);
	let data = {
		"status": status
	}
	res.end(JSON.stringify(data));
})

app.post('/checkPlayer', urlencodedParser, function (req, res) {
	var ip = req.connection.remoteAddress;
	if (GameSys.ipDictionary[ip] != undefined) {
		GameSys.ipDictionary[ip].online = true;
	}
	var data = {}
	res.end(JSON.stringify(data));
})

app.get('/ready', function (req, res) {
	let player = GameSys.ipDictionary[req.connection.remoteAddress];
	let room = GameSys.rooms[player.roomID];
	let playerPos = player ? player.pos : null;
	if (playerPos !== null) room.ready(playerPos);
	let data = {
		"room": GameSys.rooms[player.roomID].info(playerPos),
		"playerPos": playerPos
	}
	res.end(JSON.stringify(data));
})
app.get('/unready', function (req, res) {
	let player = GameSys.ipDictionary[req.connection.remoteAddress];
	let room = GameSys.rooms[player.roomID];
	let playerPos = player ? player.pos : null;
	if (playerPos !== null) room.unready(playerPos);
	let data = {
		"room": GameSys.rooms[player.roomID].info(playerPos),
		"playerPos": playerPos
	}
	res.end(JSON.stringify(data));
})

app.get('/endTurn', (req, res) => {
	let player = GameSys.ipDictionary[req.connection.remoteAddress];
	let room = GameSys.rooms[player.roomID];
	let playerPos = player ? player.pos : null;
	if (playerPos !== null) room.endTurn();
	let data = {
		"room": GameSys.rooms[player.roomID].info(playerPos),
		"playerPos": playerPos
	}
	res.end(JSON.stringify(data));
})

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