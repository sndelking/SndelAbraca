
document.write("<script src='js/data.js'></script>")
document.write("<script src='js/common.js'></script>")
document.write("<script src='js/format.js'></script>")
document.write("<script src='js/render.js'></script>")
document.write("<script src='js/initialize.js'></script>")
document.write("<script src='js/draw.js'></script>")
document.write("<script src='js/animate.js'></script>")
function player(i) {
  return $("[position=" + i + "]");
}
refreshCallback = (res, status) => {
  if (status == "success") {
    let room = JSON.parse(res).room;
    let self = JSON.parse(res).playerPos
    refreshFAB(room, self);
    refreshCommandList(room, self);
    render(room, self);
    refreshPreviseEvent();
    $room = room;
  }
}
function ready() {
  for (var i = 0; i < $room.players.length; i++) {
    player(i)
      .find("collector")
      .html("");
  }
  $.get("/ready", refreshCallback);
}
function unready() {
  $.get("/unready", refreshCallback);
}
endTurn = () => {
  $.get("/endTurn", refreshCallback);
}
function refresh() {
  $.get(`/refresh/`, refreshCallback);
}
refreshFAB = (room, self) => {
  $(".FAB").unbind("click");
  if (room.status == 0) {
    if (room.players[self].isReady) {
      changeFab("pause", true);
      $(".FAB").click(unready);
      if (!$("FAB").find(".wrap").length)
        $("FAB").append(Format.FABWrap);
    }
    else {
      changeFab("play", true);
      $(".FAB").click(ready);
      $("FAB").find(".wrap").remove();
    }
  }
  else if (room.status == 1) {
    changeFab("abraca", true);
    $(".FAB").click(showCommandList);
    $("FAB").find(".wrap").remove();
    if (room.nowPlayer == self) showFab();
    else hideFab()
  }
  else {
    changeFab("replay", true);
    $(".FAB").click(ready);
    $("FAB").find(".wrap").remove();
  }
}
refreshCommandList = (room, self) => {
  // $(".skip").unbind("mousedown");
  if (room.players[self].turnEndable) {
    // $(".skip").mousedown(endTurn);
    $(".skip").removeAttr("disabled");
  } else {
    // $(".skip").mousedown(warnUnendable);
    $(".skip").attr("disabled", "disabled");
  }
}
commandList = () => document.getElementsByClassName("command-list")[0];
function showCommandList() {
  commandList().call()
  hideFab();
}
function hideCommandList() {
  commandList().close()
}
function excuteCard(cardNum) {
  $.post(
    "/excuteCard",
    { cardNum: cardNum },
    (res, status) => {
      if (status == "success") {
        let cardStatus = $.parseJSON(res).status;
        $.get("/refresh", (res, status) => {
          refreshCallback(res, status);
          if (status == "success") {
            if (cardNum == 4 && cardStatus == 0) refreshPreviseDialog();
          }
        });
      }
    }
  );
}
// function redraw(roomID) {
//   drawPlayersBase();
//   if ($room.status == 1) {
//     drawPlayersInfo();
//     drawDiscardPileStatis();
//     drawTurnStatus();
//     drawWinner();
//     refreshTurnEndable();
//   }
//   function drawPlayersBase() {
//     let playerHtmls = [];
//     for (let i = 0; i < $room.players.length; i++) {
//       playerHtmls.push(Format.playerBase($room.players[i]));
//     }
//     for (let i = 0; i < 2; i++) {
//       if (player(i).length > 0) continue;
//       $(".players-collector.left").append(playerHtmls[i]);
//     }
//     for (let i = 2; i < playerHtmls.length; i++) {
//       if (player(i).length > 0) continue;
//       $(".players-collector.right").append(playerHtmls[i]);
//     }
//   }
//   function drawPlayersInfo() {
//     for (var i = 0; i < $room.players.length; i++) {
//       if (player(i).find("label").length < 3)
//         player(i)
//           .find(".info")
//           .append(
//             "<label class='icon heart'></label><label class='icon cards'></label><label class='icon eye'></label>"
//           );
//       var datas = [
//         $room.players[i].hp,
//         $room.players[i].cards.length,
//         $room.players[i].owls.length
//       ];
//       for (var j = 0; j < 3; j++) {
//         var labeljq = player(i)
//           .find("label")
//           .eq(j);
//         if (parseInt(labeljq.html()) != datas[j]) labeljq.html(datas[j]);
//       }
//       player(i)
//         .find("face")
//         .css(
//           "background-image",
//           "url(img/" + charactorImgUrl[$room.players[i].charactor] + ".jpg)"
//         );
//       player(i)
//         .find("charactor")
//         .html(charactorName[$room.players[i].charactor]);
//     }
//     refreshPreviseEvent();
//   }
//   function drawDiscardPileStatis() {
//     if ($(".discard-pile-statis").length == 0) {
//       var discardPileStatisHtml =
//         "<div class='card discard-pile-statis'><h3><i class='icon poll'></i>已用卡统计</h3></div>";
//       $("body").append(discardPileStatisHtml);
//       for (var i = 0; i < 8; i++) {
//         $(".discard-pile-statis").append(
//           "<div class='statis-slot' style='width:" +
//             12.5 * (i + 1) +
//             "%'><div class='statis-used' style='border-color: #" +
//             cardColor[i] +
//             ";width:0'></div><span style='position: absolute;width:100%;padding-left:8px'>" +
//             cardName[i] +
//             "<span style='float:right; margin-right:32px'>/ " +
//             (i + 1) +
//             "</span><span style='float:right; margin-right: 4px' class='usedNum'>0</span></span></div>"
//         );
//       }
//     }
//     $(".statis-used").each(function(i) {
//       $(this).css("width", 12.5 * $room.usedCards[i] + "%");
//     });
//     $(".usedNum").each(function(i) {
//       $(this).html($room.usedCards[i]);
//     });
//   }
//   function drawTurnStatus() {
//     if (!$doneAnimation) return;
//     $(".player").each(function() {
//       $(this).removeClass("now");
//     });
//     $("#self").removeClass("now");
//     if (
//       $room.nowPlayer == $self &&
//       !$room.end &&
//       $(".list").attr("state") == "off"
//     ) {
//       changeFab("abraca", true);
//       showFab($(".FAB"));
//     } else {
//       hideFab();
//     }
//     player($room.nowPlayer).addClass("now");
//   }
//   // function drawWinner() {
//   //   if ($room.status==2) {
//   //     $("#self")
//   //       .find("label.eye")
//   //       .unbind("click");
//   //     var wintitle = $room.winner.forEach(player => player.pos==$self); ? "失败" : "胜利";
//   //     var winner = "";
//   //     for (var i = 0; i < $room.winner.length; i++) {
//   //       winner += $room.winner[i].name + "</br>";
//   //       if ($room.winner[i].pos == $self) {
//   //         wintitle = ;
//   //       }
//   //     }
//   //     $(".dialog").html(WinnerDialog(wintitle, winner));
//   //     callDialog();
//   //     changeFab("replay", true);
//   //     $(".FAB").unbind("click");
//   //     $(".FAB").click(hideDialogAndReady);
//   //     showFab($(".FAB"));
//   //     checkStarted();
//   //   }
//   // }
//   function checkMissMsg() {
//     if ($room.players[$self].msgQue.length == 0) {
//       for (var i = 0; i < $room.players.length; i++) {
//         if (
//           i != $self &&
//           $room.players[i].cards.length > player(i).find(".game-card").length
//         ) {
//           for (var j = 0; j < $room.players[i].cards.length; j++) {
//             player(i)
//               .find("collector")
//               .append(
//                 "<div class='game-card' no=" +
//                   $room.players[i].cards[j] +
//                   "></div>"
//               );
//           }
//         }
//       }
//     }
//   }
//   function refreshTurnEndable() {
//     $(".skip").unbind("mousedown");
//     if ($room.players[$self].turnEndable) {
//       $(".skip").mousedown(endTurn);
//       $(".skip").removeAttr("disable");
//     } else {
//       $(".skip").mousedown(warnUnendable);
//       $(".skip").attr("disable", "disabled");
//     }
//   }
// }
function drawPlayerTakeCards(msg) {
  var playerID = msg[1];
  for (var i = 2; i < msg.length; i++) {
    var cardNo = msg[i];
    player(playerID)
      .find("collector")
      .append("<div class='game-card' no=" + cardNo + "></div>");
  }
}
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
    .each(function () {
      cardFadeOut($(this));
    });
  if (playerID == $self) {
    RefreshDeadDialog();
  }
}
function refreshPreviseDialog() {
  $(".dialog").html(Format.previseDialog);
  for (var i = 0; i < $room.players[$self].owls.length; i++) {
    $(".dialog")
      .find("collector")
      .append(
        "<div class='game-card' number=" + $room.players[$self].owls[i] + "></div>"
      );
  }
  callDialog();
}
function RefreshDeadDialog() {
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
    .find("label.eye").addClass("clickable")
}
function refreshCardsEvent() {
  $("#self")
    .find("label.cards")
    .unbind("click");
  $("#self")
    .find("label.cards")
    .click(RefreshDeadDialog);
}
function hideDialogAndReady() {
  hideDialog();
  $(".player").each(function () {
    $(this)
      .find("label")
      .each(function () {
        $(this).remove();
      });
  });
  $("#self")
    .find("label")
    .each(function () {
      $(this).remove();
    });
  ready();
}
function leaveRoom() {
  $.post("/leaveRoom", { roomID: $room.id }, function (response, status) {
    window.location.href = "index.html";
  });
}
warnUnendable = () => {
  callSnackBar("每回合至少声明一张牌。");
}
