import Player from "./Player";
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
    if (this.status == 1) return 1;
    else if (this.players.length == this.MAX_PLAYER) return 2;
    return 0;
  }
  addPlayer(ip, name) {
    let player = new Player(ip, name||"无名英雄", this.id);
    this.players.push(player);
    this.refreshPlayerPos();
    this.records.push({ type: 1, playerIp: ip });
    return player;
  }
  refreshPlayerPos() {
    this.players.forEach((player, pos) => (player.pos = pos));
  }
  readyList() {
    return this.players.map(player => player.isReady);
  }
  removePlayer(ip) {
    this.players = this.players.filter(player => player.ip != ip);
    this.records.push({ type: 2, playerIp: ip });
    if (this.started) this.checkWinner();
  }
  alivePlayers() {
    return this.players.filter(player => player.hp > 0);
  }
  aliveNext(pos) {
    let alivePlayers = this.alivePlayers();
    let selfIdx = alivePlayers.findIndex(player => player.pos == pos);
    return alivePlayers.find(
      (player, idx) => idx == (selfIdx + 1) % alivePlayers.length
    );
  }
  alivePrev(pos) {
    let alivePlayers = this.alivePlayers();
    let selfIdx = alivePlayers.findIndex(player => player.pos == pos);
    return alivePlayers.find(
      (player, idx) =>
        idx == (selfIdx - 1 + alivePlayers.length) % alivePlayers.length
    );
  }
  ready(pos) {
    this.players[pos].ready();
    this.records.push({ type: 3, playerIp: this.players[pos].ip });
    let readyList = this.readyList();
    if (readyList.length == 1) return;
    for (let i = 0; i < readyList.length; i++) {
      if (!readyList[i]) return;
    }
    this.start();
  }
  unready(pos) {
    this.players[pos].unready();
    this.records.push({ type: 4, playerIp: this.players[pos].ip });
  }
  start() {
    this.status = 1;
    this.winner = [];
    this.usedCards = [0, 0, 0, 0, 0, 0, 0, 0];
    this.unusedCards = [];
    this.owlCards = [];
    this.nowPlayer = 0;
    this.players.forEach(player => player.initialize());
    let oriCards = [];
    for (let i = 1; i <= 8; i++) for (let j = 0; j < i; j++) oriCards.push(i);
    for (let i = 0; i < 4; i++) {
      let owl = Math.floor(Math.random() * oriCards.length);
      this.owlCards.push(oriCards.splice(owl, 1)[0]);
    }
    while (oriCards.length > 0) {
      var select = Math.floor(Math.random() * oriCards.length);
      this.unusedCards.push(oriCards.splice(select, 1)[0]);
    }
    this.players.forEach(player => {
      for (let j = 0; j < 4; j++) player.getCard(this.unusedCards.shift());
    });
    this.records.push({ type: 5 });
  }
  takeNewCard(pos) {
    var newCard = this.unusedCards.shift();
    this.players[pos].getCard(newCard);
  }
  checkPlayer() {
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i].online) this.players[i].online = false;
      else this.removePlayer(this.players[i].ip);
    }
    setTimeout("gameSys.rooms[" + this.id + "].checkPlayer()", 3000);
  }
  executeCard(cardNo, userID) {
    let user = this.players[userID];
    let status = this.nowPlayer == userID ? user.removeCard(cardNo) : 2;
    /* status:
		// 0 : succeed
		// 1 : failed
		// 2 : not your turn
		*/
    let alivePlayers = this.alivePlayers();
    let targets = [];
    if (status == 0) {
      this.usedCards[cardNo - 1]++;
      switch (cardNo) {
        case 1:
          let changedHp = Math.ceil(Math.random() * -3);
          targets = alivePlayers
            .filter(player => player.pos != user.pos)
            .map(player => {
              return {
                player,
                changedHp
              };
            });
          break;
        case 2:
          targets = alivePlayers
            .filter(player => player.pos != user.pos)
            .map(player => {
              return {
                player,
                changedHp: -1
              };
            });
          targets.push({ player: user, changedHp: 1 });
          break;
        case 3:
          targets.push({
            player: user,
            changedHp: Math.ceil(Math.random() * 3)
          });
          break;
        case 4:
          targets.push({
            player: user,
            changedHp: 0
          });
          let owl = this.owlCards.shift();
          user.owls.push(owl);
          break;
        case 5:
          targets.push({
            player: this.alivePrev(user.pos),
            changedHp: -1
          });
          targets.push({
            player: this.aliveNext(user.pos),
            changedHp: -1
          });
          break;
        case 6:
          targets.push({
            player: this.alivePrev(user.pos),
            changedHp: -1
          });
          break;
        case 7:
          targets.push({
            player: this.aliveNext(user.pos),
            changedHp: -1
          });
          break;
        case 8:
          targets.push({
            player: user,
            changedHp: 1
          });
          break;
      }
      user.turnEndable = true;
    } else {
      if (cardNo == 1)
        targets.push({
          player: user,
          changedHp: Math.ceil(Math.random() * -3)
        });
      else
        targets.push({
          player: user,
          changedHp: -1
        });
    }
    targets.forEach(target => target.player.changeHp(target.changedHp));
    if (status < 2)
      this.records.push({
        type: 6,
        playerIp: user.ip,
        status,
        cardNo,
        targets: targets.map(target=>target.player = target.player.info(user.pos))
      });
    this.checkWinner();
    if (status == 1 || user.cards.length == 0) this.endTurn();
    return status;
  }
  endTurn() {
    let player = this.players[this.nowPlayer];
    if (!this.end) {
      while (this.unusedCards.length > 0 && player.cards.length < 4) {
        this.takeNewCard(this.nowPlayer);
      }
      this.nowPlayer = this.aliveNext(this.nowPlayer).pos;
      while (this.players[this.nowPlayer].cards.length == 0)
        this.nowPlayer = this.aliveNext(this.nowPlayer).pos;
      this.players.forEach(player => (player.turnEndable = false));

      this.records.push({ type: 7, playerIp: player.ip });
    }
  }
  checkWinner() {
    if (this.alivePlayers().length == 1) {
      this.end = true;
      this.winner = [this.alivePlayers()[0]];
    } else if (this.usedCards.reduce((total, used) => total + used, 0) == 32) {
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
      for (var i = 0; i < this.players.length; i++) this.players[i].unready();
    }
  }
  info(requesterPos) {
    return {
      id: this.id,
      players: this.players.map(player => player.info(requesterPos)),
      usedCards: this.usedCards,
      nowPlayer: this.nowPlayer,
      status: this.status,
      winner: this.winner,
      records: this.records
    };
  }
}
