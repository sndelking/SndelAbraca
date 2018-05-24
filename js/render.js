render = (room, self) => {
  renderPlayers(room, self);
  renderActivitiesCard(room);
};
renderPlayers = (room, self) => {
  room.players.forEach((player, pos) => {
    renderPlayer(player, room.status, self);
  });
};
renderPlayer = (player, roomStatus, self) => {
  renderPlayerBase(player, self);
  renderPlayerInfo(player, roomStatus);
  renderPlayerCards(player, roomStatus, self);
};
renderPlayerBase = (player, self) => {
  if (player.pos != self && !this.player(player.pos).length) {
    let renderPosition = (player.pos - ($self - 2)) % 5;
    let node = Format.playerBase(player);
    let leftPlayersCollector = $(".players-collector.left");
    let rightPlayersCollector = $(".players-collector.right");
    if (renderPosition < 2) leftPlayersCollector.append(node);
    else if (renderPosition > 2) rightPlayersCollector.prepend(node);
  }
};
renderPlayerface = (player, roomStatus) => {
  this.player(player.pos)
    .find("face")
    .css(
      "background-image",
      Format.playerFace(roomStatus ? player.charactor : 0)
    );
};
renderPlayerInfo = (player, roomStatus) => {
  let gameInfo = this.player(player.pos).find("game-info");
  if (roomStatus) gameInfo.html(Format.playerGameInfo(player));
  else gameInfo.html("");
};
renderPlayerCards = (player, roomStatus, self) => {
  if (player.pos == self) return;
  let cardsCollector = this.player(player.pos).find("collector");
  let addedCardsIndexList = [];
  let removedCardsIndexList = this.player(player.pos)
    .find(".game-card")
    .get()
    .map(cardDOM => Number(cardDOM.getAttribute("number")));
  player.cards.forEach(card => {
    let newCardIndex = removedCardsIndexList.indexOf(card);
    if (newCardIndex == -1) addedCardsIndexList.push(card);
    else removedCardsIndexList.splice(newCardIndex, 1);
  });
  addedCardsIndexList.forEach(card => {
    this.player(player.pos)
      .find("collector")
      .append(Format.card(card));
  });
  removedCardsIndexList.forEach(card => {
    let cardJqNode = this.player(player.pos)
      .find(`[number='${card}']`)
      .eq(0);
    cardFadeOut(cardJqNode);
    abracaSucceed(card, cardJqNode.offset().top, cardJqNode.offset().left);
  });
};
renderActivitiesCard = room => {
  if (room.status)
    if (!$(".discard-pile").length) {
      $("body").append(Format.activitiesCard(room.usedCards));
      initTabsBar();
      initTabPanels();
    } else {
      $(".discard-pile")
        .find(".slot")
        .map(function(idx) {
          $(this)
            .find(".slot-text-used")
            .html(`${room.usedCards[idx]} / ${idx + 1}`);
          $(this)
            .find(".slot-bar-used")
            .width(`${room.usedCards[idx] / (idx + 1) * 100}%`);
        });
    }
  else $(".discard-pile").remove();
};
renderRecords = room => {
  if (room.status) {
    if (!$(".records").length) $("body").append(Format.records);
  } else $(".records").remove();
};
class Render {
  static renderSelf(res) {
    let self = getElementById("self");
    self.data = res.room.players[res.playerPos];
    self.findByTagName("NAME")[0].innerHTML = self.data.name;
    self.findByTagName("POS")[0].innerHTML = self.data.pos + 1;
    Game.selfPos = res.playerPos;
  }
  static renderSeats(res) {
    let seats = Game.seats().filter(seat => seat.getAttribute("id") != "self");
    seats.forEach((seat, seatIdx) => {
      seat.findByTagName("POS")[0].innerHTML =
        seatIdx + (seatIdx >= res.playerPos ? 2 : 1);
    });
  }
  static renderRoom(res) {
    this.renderRecords(res);
    this.renderBasicPlayers(res);
    if (res.room.status == 1) this.renderGamePlayers(res);
  }
  static renderRecords(res) {
    let eplandPlayer = player => {
      return `<tag>${player.name}</tag>`;
    };
    let explandRecord = record => {
      let player = res.room.players.find(
        player => player.ip == record.playerIp
      );
      switch (record.type) {
        case 1:
          return `${eplandPlayer(player)}加入房间。`;
        case 2:
          return `${eplandPlayer(player)}离开了房间。`;
        case 3:
          return `${eplandPlayer(player)}已准备。`;
        case 4:
          return `${eplandPlayer(player)}取消准备。`;
        case 5:
          return "所有人已准备，游戏开始了。";
        case 7:
          return `${eplandPlayer(player)}结束了回合。`;
      }
    };
    if (!Game.room.records) Game.room.records = [];
    res.room.records.slice(Game.room.records.length).map(record => {
      let node = document.createElement("p");
      node.innerHTML = explandRecord(record);
      document.getElementById("room-status-records").prepend(node);
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
            .findByClassName("is-ready")[0]
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
      playerDOM.append(gameCardsDOM);
    }
    let cardDOMs = gameCardsDOM.findByTagName("GAME-CARD");
    let addedCards = cards.map(card => card);
    let removedCards = cardDOMs.map(card =>
      Number(card.getAttribute("number"))
    );
    for (let ai = 0; ai < addedCards.length; ai++) {
      let card_added = addedCards[ai];
      removedCards.forEach((card_removed, card_removed_idx) => {
        if (card_removed == card_added) {
          removedCards.splice(card_removed_idx, 1);
          addedCards.splice(ai, 1);
          ai--;
          return;
        }
      });
    }
    addedCards.forEach(card_added => {
      let cardDOM = createElement("game-card");
      cardDOM.setAttribute("number", card_added);
      gameCardsDOM.append(cardDOM);
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
  // static renderAbracaAnimation(res, cardNum) {
  //   if()
  //   let cardDOMs = gameCardsDOM.findByTagName("GAME-CARD");
  //   let cardDOM = cardDOMs.find(
  //     dom => Number(dom.getAttribute("number")) == cardNum
  //   );
  // }
  static renderAbracaAnimation(top, left, cardNum) {
    Material.callMask();
    console.log(top, left)
    let abracaAnimation = createElement("animation-abraca");
    abracaAnimation.className = "filter" + cardNum;
    abracaAnimation.style.left = left + "px";
    abracaAnimation.style.top = top + "px";
    abracaAnimation.innerHTML = "<abraca-1></abraca-1><abraca-2></abraca-2>";

    let animationEnd = () => {
      abracaAnimation.removeEventListener("animationend", animationEnd);
      abracaAnimation.remove();
      Material.hideMask();
    };
    abracaAnimation.addEventListener("animationend", animationEnd);
    document.body.append(abracaAnimation);
  }
}
