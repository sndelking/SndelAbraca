import Player from "./Player"
export default class Room {
	constructor(id) {
		const MAX_PLAYER = 5;
		this.id = id;
		this.players = [];
		this.unusedCards = [];
		this.owlCards = [];
		this.usedCards = [0, 0, 0, 0, 0, 0, 0, 0];
		this.status = 0;
		// 0: init, 1: start, 2:end
		this.nowPlayer = 0;
		this.winner = [];
		this.records = [];
	}
	joinableCode() {
		if (this.status == 1) return 1
		else if (this.players.length == this.MAX_PLAYER) return 2
		return 0
	}
	addPlayer(ip, name) {
		let player = new Player(ip, name, this.id);
		this.players.push(player);
		this.refreshPlayerPos();
		this.records.push({ type: 1, playerIp: ip })
		return player;
	};
	refreshPlayerPos() {
		this.players.forEach((player, pos) => player.pos = pos);
	};
	readyList() {
		return this.players.map(player => player.isReady);
	};
	removePlayer(ip) {
		this.players = this.players.filter(player => player.ip != ip)
		this.records.push({ type: 2, playerIp: ip })
		if (this.started)
			this.checkWinner();
	}
	alivePlayers() {
		return this.players.filter(function (player) { return player.hp > 0 });
	};
	aliveNext(pos) {
		var alivePlayers = this.alivePlayers();
		for (var i = alivePlayers.length - 1; i >= 0; i--)
			if (alivePlayers[i].pos <= pos)
				return (i + 1) % alivePlayers.length;
	};
	alivePrev(pos) {
		var alivePlayers = this.alivePlayers();
		for (var i = 0; i < alivePlayers.length; i++)
			if (alivePlayers[i].pos >= pos)
				return (i - 1 + alivePlayers.length) % alivePlayers.length;
	};
	ready(pos) {
		this.players[pos].ready();
		this.records.push({ type: 3, playerIp: this.players[pos].ip })
		let readyList = this.readyList();
		if (readyList.length == 1)
			return;
		for (let i = 0; i < readyList.length; i++) {
			if (!readyList[i])
				return;
		}
		this.start();
	};
	unready(pos) {
		this.players[pos].unready();
		this.records.push({ type: 4, playerIp: this.players[pos].ip })
	};
	start() {
		this.status = 1;
		this.winner = [];
		this.usedCards = [0, 0, 0, 0, 0, 0, 0, 0];
		this.unusedCards = [];
		this.owlCards = [];
		this.nowPlayer = 0;
		this.players.forEach(player => player.initialize());
		let oriCards = [];
		for (let i = 1; i <= 8; i++)
			for (let j = 0; j < i; j++)
				oriCards.push(i);
		for (let i = 0; i < 4; i++) {
			let owl = Math.floor(Math.random() * oriCards.length);
			this.owlCards.push(oriCards.splice(owl, 1)[0]);
		}
		while (oriCards.length > 0) {
			var select = Math.floor(Math.random() * oriCards.length);
			this.unusedCards.push(oriCards.splice(select, 1)[0]);
		}
		this.players.forEach(player => {
			for (let j = 0; j < 4; j++)
				player.getCard(this.unusedCards.shift());
		})
		this.records.push({ type: 5 })
	};
	takeNewCard(pos) {
		var newCard = this.unusedCards.shift();
		this.players[pos].getCard(newCard);
	};
	checkPlayer() {
		for (var i = 0; i < this.players.length; i++) {
			if (this.players[i].online)
				this.players[i].online = false;
			else
				this.removePlayer(this.players[i].ip);
		}
		setTimeout("gameSys.rooms[" + this.id + "].checkPlayer()", 3000);
	};
	executeCard(cardNo, userID) {
		let user = this.players[userID];
		let status = this.nowPlayer == userID ? user.removeCard(cardNo) : 2
		/* status:
		// 0 : succeed
		// 1 : failed
		// 2 : not your turn
		*/
		var ran = Math.ceil(Math.random() * 3);
		var alivePlayers = this.alivePlayers();
		if (status == 0) {
			this.usedCards[cardNo - 1]++;
			switch (cardNo) {
				case 1:
					for (var i = 0; i < alivePlayers.length; i++)
						if (alivePlayers[i].pos != user.pos)
							alivePlayers[i].changeHp(-ran);
					break;
				case 2:
					for (var i = 0; i < alivePlayers.length; i++)
						if (alivePlayers[i].pos != user.pos)
							alivePlayers[i].changeHp(-1);
					user.changeHp(1);
					break;
				case 3:
					user.changeHp(ran);
					break;
				case 4:
					var owl = this.owlCards.shift();
					user.owls.push(owl);
					break;
				case 5:
					var prevPlayer = alivePlayers[this.alivePrev(user.pos)];
					var nextPlayer = alivePlayers[this.aliveNext(user.pos)];
					prevPlayer.changeHp(-1);
					nextPlayer.changeHp(-1);
					break;
				case 6:
					var prevPlayer = alivePlayers[this.alivePrev(user.pos)];
					prevPlayer.changeHp(-1);
					break;
				case 7:
					var nextPlayer = alivePlayers[this.aliveNext(user.pos)];
					nextPlayer.changeHp(-1);
					break;
				case 8:
					user.changeHp(1);
					break;
			}
			user.turnEndable = true;
		} else {
			cardNo == 1 ? user.changeHp(-ran) : user.changeHp(-1);
		}
		this.checkWinner();
		if (status == 1 || user.cards.length == 0)
			this.endTurn();
		if (status < 2)
			this.records.push({ type: 6, playerIp: user.ip, status: status })
		return status;
	};
	endTurn() {
		let player = this.players[this.nowPlayer];
		if (!this.end) {
			while (this.unusedCards.length > 0 && player.cards.length < 4) {
				this.takeNewCard(this.nowPlayer);
			}
			this.nowPlayer = this.alivePlayers()[this.aliveNext(this.nowPlayer)].pos;
			while (this.players[this.nowPlayer].cards.length == 0)
				this.nowPlayer = this.alivePlayers()[this.aliveNext(this.nowPlayer)].pos;
			this.players.forEach(player => player.turnEndable = false)
			
			this.records.push({ type: 7, playerIp: player.ip})
		}
	};
	checkWinner() {
		function add(sum, i) {
			return sum + i;
		};
		if (this.alivePlayers().length == 1) {
			this.end = true;
			this.winner = [this.alivePlayers()[0]];
		} else if (this.usedCards.reduce(add, 0) == 32) {
			this.end = true;
			this.winner = [this.alivePlayers()[0]];
			for (var i = 1; i < this.alivePlayers().length; i++) {
				if (this.alivePlayers()[i].hp > this.winner[0]) {
					this.winner = [this.alivePlayers()[i]];
				} else if (this.alivePlayers()[i].hp == this.winner[0]) {
					this.winner.push(this.alivePlayers()[i]);
				}
			}
		}
		if (this.end) {
			this.started = false;
			for (var i = 0; i < this.players.length; i++)
				this.players[i].unready();
		}
	};
	info(requesterPos) {
		return {
			id: this.id,
			players: this.players.map(player => player.info(requesterPos)),
			usedCards: this.usedCards,
			nowPlayer: this.nowPlayer,
			status: this.status,
			winner: this.winner,
			records: this.records
		}
	};
};