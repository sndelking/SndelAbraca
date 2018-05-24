document.write("<script src='js/data.js'></script>");
document.write("<script src='js/common.js'></script>");
document.write("<script src='js/format.js'></script>");
document.write("<script src='js/render.js'></script>");
document.write("<script src='js/draw.js'></script>");
document.write("<script src='js/animate.js'></script>");
class Game {
  /* getters */
  static actionsBtn() {
    return document.getElementById("actions-btn");
  }
  static playersCollection() {
    return document.getElementById("players-collection");
  }
  static seats() {
    return getElementsByClassName("player");
  }
  static seat(i) {
    return this.seats().find(seat => {
      let pos = seat.findByTagName("POS")[0].innerHTML;
      return Number(pos) == Number(i) + 1;
    });
  }
  static players() {
    return this.seats().filter(seat => seat.data);
  }
  static player(i) {
    return this.players().find(player => {
      let pos = player.findByTagName("POS")[0].innerHTML;
      return Number(pos) == Number(i) + 1;
    });
  }
  static self() {
    getElementById("self");
  }

  /* initialize */
  static async initialize() {
    this.room = {};
    this.selfPos = -1;
    let initData = res => {
      document.getElementById("room-id").innerHTML = `房间号 ${res.room.id}`;
      Render.renderSelf(res);
      Render.renderSeats(res);
      this.render(res);
    };
    this.refresh(initData);
  }
  static async refresh(callBack) {
    let res = await $get("/refresh");
    callBack(res);
    setTimeout(() => {
      this.refresh(nextRes => this.render(nextRes));
    }, 5000);
  }
  static render(res) {
    Render.renderRoom(res);
    this.refreshFABState(res);
    this.refreshEndTurnButton(res);
  }
  static async ready() {
    let res = await $post("/ready");
    if (res.code == 0) this.action_Pause();
  }
  static async unready() {
    let res = await $post("/unready");
    if (res.code == 0) this.action_Start();
  }

  /* FAB state */
  static refreshFABState(res) {
    let res_self = res.room.players.find(player => res.playerPos == player.pos);
    let self = this.room.players.find(player => this.selfPos == player.pos);
    if (
      res_self.isReady == self.isReady &&
      res.room.status == this.room.status &&
      res.room.nowPlayer == this.room.nowPlayer
    )
      return;
    this.actionsBtn().show();
    if (res.room.status == 0)
      if (res_self.isReady) return this.action_Pause();
      else return this.action_Start();
    if (res.room.status == 2) return this.action_Restart();
    else {
      this.action_Abrace();
      if (res.room.nowPlayer != res.playerPos) this.actionsBtn().hide();
    }
  }
  static action_Start() {
    this.actionsBtn().icon("play");
    this.actionsBtn().colorTheme("primary");
    this.actionsBtn().onclick = () => this.ready();
    this.actionsBtn().loaded();
  }
  static action_Restart() {
    this.actionsBtn().icon("replay");
    this.actionsBtn().colorTheme("primary");
    this.actionsBtn().onclick = null;
    this.actionsBtn().loaded();
  }
  static action_Pause() {
    this.actionsBtn().icon("pause");
    this.actionsBtn().colorTheme("accent");
    this.actionsBtn().onclick = () => this.unready();
    this.actionsBtn().loading();
  }
  static action_Abrace() {
    this.actionsBtn().icon("abraca");
    this.actionsBtn().colorTheme("primary");
    this.actionsBtn().onclick = () => this.callCommandList();
    this.actionsBtn().loaded();
  }

  /* command-list */
  static callCommandList() {
    getElementById("command-list").call();
  }
  static hideCommandList() {
    getElementById("command-list").hide();
  }

  /* game announce and execute */
  static async executeCard(cardNum) {
    this.hideCommandList();
    let res = await $post("/execute-card", { cardNum });
    if (res.status == 0) {
      Render.renderAbracaAnimation(
        getElementById("self").offsetTop + getElementById("self").offsetHeight / 2,
        getElementById("self").offsetWidth / 2,
        cardNum
      );
      if (cardNum == 4) this.render(res);
    }
  }
  static async endTurn() {
    this.hideCommandList();
    let res = await $post("/end-turn");
    this.render(res);
  }
  static refreshEndTurnButton(res) {
    let turnEndable = res.room.players[res.playerPos].turnEndable;
    let endTurnButton = getElementById("end-turn-button");
    if (turnEndable) endTurnButton.removeAttribute("disabled");
    else endTurnButton.setAttribute("disabled", "");
  }
}
window.addEventListener("load", () => {
  Game.initialize();
});

function drawUseCard(msg) {
  var userID = msg[1];
  var cardNo = msg[2];
  var succeed = msg[3];
  var ran = msg[4];
  sentSnackBarMsg();
  if (succeed) {
    removeCard();
    drawAbracaAnimation();
  }
  function sentSnackBarMsg() {
    var msg =
      $room.players[userID].name +
      "施展<label class='icon game-card-" +
      cardNo +
      "'>" +
      cardName[cardNo - 1] +
      "</label>，" +
      (succeed
        ? "<label class='icon succeed-white'>成功</label>"
        : "但是<label class='icon failed-white'>失败</label>了");
    if (cardNo == 1) {
      msg += "，";
      msg += succeed ? "造成了" + ran + "点伤害" : "失去了" + ran + "点体力。";
    } else if (cardNo == 3) {
      msg += succeed ? "，恢复了" + ran + "点体力" : "";
    } else {
      msg += "。";
    }
    for (var i = 5; i < msg.length; i++) {
      shake(player(parseInt(msg[i])));
    }
    callSnackBar(msg);
  }
  function drawAbracaAnimation() {
    $("#mask").attr("state", "on");
    document.documentElement.style.overflow = "hidden";
    $("body").append(
      "<animation-abraca class='filter" +
        cardNo +
        "'><abraca-1></abraca-1><abraca-2></abraca-2></animation-abraca>"
    );
    $("animation-abraca").css("top", player(userID).offset().top - 64);
    $("animation-abraca").css("left", player(userID).offset().left + 32);
    $("animation-abraca")
      .get(0)
      .addEventListener("animationend", removeAbracaAnimation);
    function removeAbracaAnimation() {
      $("animation-abraca")
        .get(0)
        .removeEventListener("animationend", removeAbracaAnimation);
      $("#mask").attr("state", "off");
      document.documentElement.style.overflowY = "auto";
      $(this).remove();
    }
  }
  function removeCard() {
    for (var i = 0; i < player(userID).find(".game-card").length; i++) {
      if (
        player(userID)
          .find(".game-card")
          .eq(i)
          .attr("no") == cardNo
      ) {
        cardFadeOut(
          player(userID)
            .find(".game-card")
            .eq(i)
        );
        break;
      }
    }
  }
}
function drawPlayerDead(msg) {
  var playerID = msg[1];
  var msg = $room.players[playerID].name + "阵亡了。";
  callSnackBar(msg);
  player(playerID)
    .find(".game-card")
    .each(function() {
      cardFadeOut($(this));
    });
  if (playerID == $self) {
    refreshDeadDialog();
  }
}
function refreshPreviseDialog() {
  $(".dialog").html(Format.previseDialog);
  for (var i = 0; i < $room.players[$self].owls.length; i++) {
    $(".dialog")
      .find("collector")
      .append(
        "<div class='game-card' number=" +
          $room.players[$self].owls[i] +
          "></div>"
      );
  }
  callDialog();
}
function refreshDeadDialog() {
  $(".dialog").html(CardsDialog());
  callDialog();
}
function refreshPreviseEvent() {
  $("#self")
    .find("label.eye")
    .unbind("click");
  $("#self")
    .find("label.eye")
    .click(refreshPreviseDialog);
  $("#self")
    .find("label.eye")
    .addClass("clickable");
}
function refreshCardsEvent() {
  $("#self")
    .find("label.cards")
    .unbind("click");
  $("#self")
    .find("label.cards")
    .click(refreshDeadDialog);
}
function hideDialogAndReady() {
  hideDialog();
  $(".player").each(function() {
    $(this)
      .find("label")
      .each(function() {
        $(this).remove();
      });
  });
  $("#self")
    .find("label")
    .each(function() {
      $(this).remove();
    });
  ready();
}
function leaveRoom() {
  $.post("/leaveRoom", { roomID: $room.id }, function(response, status) {
    window.location.href = "index.html";
  });
}
warnUnendable = () => {
  callSnackBar("每回合至少声明一张牌。");
};
