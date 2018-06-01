class Render {
  static renderSelf(res) {
    let self = getElementById("self");
    self.data = res.room.players[res.playerPos];
    self.findByTagName("NAME")[0].innerHTML = self.data.name;
    self.findByTagName("POS")[0].innerHTML = self.data.pos + 1;
    Game.selfPos = res.playerPos;
  }
  static initSeats(res) {
    let seats = Game.seats().filter(seat => seat.getAttribute("id") != "self");
    seats.forEach((seat, seatIdx) => {
      seat.findByTagName("POS")[0].innerHTML =
        seatIdx + (seatIdx >= res.playerPos ? 2 : 1);
      let readyRipple = createElement("ripple")
      readyRipple.className = "ready-ripple"
      readyRipple.innerHTML = "已准备";
      seat.append(readyRipple);
    });
  }
  static renderSeats(res) {
    // if(res.room.status == 0)
    ///
    ///
    ///
    ////
    ///
  }
  static renderRoom(res) {
    this.renderRecords(res);
    this.renderBasicPlayers(res);
    if (res.room.status == 1) {
      this.renderGamePlayers(res);
      this.renderUsedCardStatic(res);
    }
  }
  static renderRecords(res) {
    let explandPlayer = player => {
      return `<tag>${player.name}</tag>`;
    };
    let explandCard = card => {
      return `<label
        class="icon ${cardIconName[card]}"
        style="color:#${cardColor[card]}">
        ${cardName[card]}</label>`;
    };
    let explandRecord = record => {
      let player = res.room.players.find(
        player => player.ip == record.playerIp
      );
      switch (record.type) {
        case 1:
          return `${explandPlayer(player)}加入房间。`;
        case 2:
          return `${explandPlayer(player)}离开了房间。`;
        case 3:
          return `${explandPlayer(player)}已准备。`;
        case 4:
          return `${explandPlayer(player)}取消准备。`;
        case 5:
          return "所有人已准备，游戏开始了。";
        case 6:
          return `${explandPlayer(player)}施展${explandCard(record.cardNo)}${
            record.status ? "失败了" : "成功了"
          }。`;
        case 7:
          return `${explandPlayer(player)}结束了回合。`;
      }
    };
    if (!Game.room.records) Game.room.records = [];
    res.room.records.slice(Game.room.records.length).map(record => {
      let node = document.createElement("p");
      node.innerHTML = explandRecord(record);
      document.getElementById("room-status-records").prepend(node);
      if (record.type == 6) this.renderAnimation(res, record);
    });
    Game.room.records = res.room.records;
  }
  static renderBasicPlayers(res) {
    Game.room.players = Game.room.players || [];
    res.room.players.forEach((player, idx) => {
      let playerDOM = Game.seat(player.pos);
      if (!playerDOM.data) playerDOM.data = {};
      if (playerDOM.data.name != player.name)
        playerDOM.findByTagName("NAME")[0].innerHTML = player.name;
      if (playerDOM.id != "self")
        if (playerDOM.data.isReady != player.isReady)
          playerDOM
            .findByClassName("ready-ripple")[0]
            .setAttribute("value", player.isReady);
      playerDOM.data = {
        ...playerDOM.data,
        pos: player.pos,
        name: player.name,
        isReady: player.isReady
      };
      playerDOM.className = "player";
      Game.room.players[idx] = playerDOM.data;
    });
  }
  static renderGamePlayers(res) {
    Game.room.players = Game.room.players || [];
    res.room.players.forEach((player, idx) => {
      this.renderGamePlayerBasicInfo(res, player, idx);
      this.renderGamePlayerCards(res, player, idx);
      let playerDOM = Game.player(player.pos);
      playerDOM.data = {
        ...playerDOM.data,
        hp: player.hp,
        cards: player.cards,
        owls: player.owls
      };
      Game.room.players[idx] = playerDOM.data;
    });
  }
  static renderGamePlayerBasicInfo(res, player, idx) {
    let playerDOM = Game.player(player.pos);
    let playerGameInfo = playerDOM.findByTagName("game-info")[0];
    let playerGameInfos = playerDOM.findByTagName("label");
    let playerHpDom = playerGameInfos.find(label =>
      label.className.split(" ").includes("heart")
    );
    let playerCardsDom = playerGameInfos.find(label =>
      label.className.split(" ").includes("cards")
    );
    let playerOwlsDom = playerGameInfos.find(label =>
      label.className.split(" ").includes("eye")
    );
    if (!playerHpDom) {
      playerHpDom = createElement("label");
      playerHpDom.className = "icon heart";
      playerHpDom.innerHTML = 0;
      playerGameInfo.append(playerHpDom);
    }
    if (!playerCardsDom) {
      playerCardsDom = createElement("label");
      playerCardsDom.className = "icon cards";
      playerCardsDom.innerHTML = 0;
      playerGameInfo.append(playerCardsDom);
    }
    if (!playerOwlsDom) {
      playerOwlsDom = createElement("label");
      playerOwlsDom.className = "icon eye";
      playerOwlsDom.innerHTML = 0;
      playerGameInfo.append(playerOwlsDom);
    }
    playerDOM.data = playerDOM.data || {};
    playerDOM.data.cards = playerDOM.data.cards || [];
    playerDOM.data.owls = playerDOM.data.owls || [];
    if (Number(playerHpDom.innerHTML) != player.hp)
      playerHpDom.innerHTML = player.hp;
    if (Number(playerCardsDom.innerHTML) != player.cards.length)
      playerCardsDom.innerHTML = player.cards.length;
    if (Number(playerOwlsDom.innerHTML) != player.owls.length)
      playerOwlsDom.innerHTML = player.owls.length;
  }
  static renderGamePlayerCards(res, player, idx) {
    if (res.playerPos == player.pos) return;
    let cards = player.cards;
    let playerDOM = Game.player(player.pos);
    let gameCardsDOM = playerDOM.findByTagName("GAME-CARDS")[0];
    if (cards.length && !gameCardsDOM) {
      gameCardsDOM = createElement("game-cards");
      gameCardsDOM.innerHTML = "<wrapper></wrapper>";
      playerDOM.append(gameCardsDOM);
    }
    let gameCardsWrapprtDOM = gameCardsDOM.findByTagName("WRAPPER")[0];
    let cardDOMs = gameCardsDOM.findByTagName("GAME-CARD");
    let addedCards = cards.map(card => card);
    let removedCards = cardDOMs.map(card =>
      Number(card.getAttribute("number"))
    );
    for (let ai = 0; ai < addedCards.length; ai++) {
      let card_added = addedCards[ai];
      for (let ri = 0; ri < removedCards.length; ri++) {
        let card_removed = removedCards[ri];
        if (card_removed == card_added) {
          removedCards.splice(ri, 1);
          ri--;
          addedCards.splice(ai, 1);
          ai--;
          break;
        }
      }
    }
    addedCards.forEach(card_added => {
      let cardDOM = createElement("game-card");
      cardDOM.setAttribute("number", card_added);
      gameCardsWrapprtDOM.append(cardDOM);
    });
    removedCards.forEach((card_removed, ri) => {
      let cardDOM = cardDOMs.find(
        dom => Number(dom.getAttribute("number")) == card_removed
      );
      cardDOM.style.animation =
        "gameCardFadeOut 0.575s cubic-bezier(0.4, 0.0, 1, 1)";
      let cardCollapse = () => {
        cardDOM.removeEventListener("animationend", cardCollapse);
        cardDOM.remove();
      };
      cardDOM.addEventListener("animationend", cardCollapse);
    });
  }
  static renderAnimation(res, record) {
    let playerPos = res.room.players.find(
      player => player.ip == record.playerIp
    ).pos;
    if (playerPos == res.playerPos) return;
    let userDOM = Game.player(playerPos);
    if (!userDOM) return;
    let userFace = userDOM.findByTagName("FACE")[0];
    this.renderAbracaAnimation(
      userFace.documentTop() + userFace.offsetHeight / 2,
      userFace.documentLeft() + userFace.offsetWidth / 2,
      record.cardNo
    );
  }
  static renderAbracaAnimation(top, left, cardNum) {
    Material.callMask();
    let abracaAnimation = createElement("animation-abraca");
    abracaAnimation.className = "filter" + cardNum;
    abracaAnimation.style.left = left - 120 + "px";
    abracaAnimation.style.top = top - 120 + "px";
    abracaAnimation.innerHTML = "<abraca-1></abraca-1><abraca-2></abraca-2>";

    let animationEnd = () => {
      abracaAnimation.removeEventListener("animationend", animationEnd);
      abracaAnimation.remove();
      Material.hideMask();
    };
    abracaAnimation.addEventListener("animationend", animationEnd);
    document.body.append(abracaAnimation);
  }

  static renderUsedCardStatic(res) {
    if (res.room.usedCards != Game.room.usedCards) {
      getElementById("used-cards-static").innerHTML = Format.activitiesCard(
        res.room.usedCards
      );
      Game.room.usedCards = res.room.usedCards;
    }
  }
}
