class Format {
  static gameHall(rooms) {
    if (rooms.length)
      return `<table>
                <tr>
                    <th>房间号</th>
                    <th>人数</th>
                    <th>状态</th>
                </tr>
                ${rooms
                  .map(room => {
                    let playersIcon = new Array();
                    for (let i=0;i<5;i++)
                      playersIcon.push(`<i class="icon account"
                        style="${i<rooms.playersNum?'color:#5bc5be':'color:rgba(0,0,0,.3)'}">
                    </i>`);
                    let playersIconStr = playersIcon.join("");
                    return `<tr>
                        <td>${room.roomID}</td>
                        <td>${playersIconStr}</td>
                        <td>${room.status==1?"已开始":"未开始"}</td>
                    </tr>`;
                  })
                  .join("")}
            </table>`;
    else return "<p>游戏大厅里空空如也。点击“创建新房间”开始游戏吧。</p>";
  }
  static playerBase(player) {
    let { pos, name, charactor, cards, ip } = player;
    return `<div class='player card' position=${pos}>
                    <face></face>
                    <div class='info'>
                        <h5 class='name'>${name}</h5>
                        <pos>${pos + 1}</pos>
                        <game-info></game-info>
                    </div>
                    <game-cards><collector></collector></game-cards>
                </div>`;
  }
  static playerGameInfo(player) {
    return `<charactor>${charactorName[player.charactor]}</charactor>
                <label class='icon heart'>${player.hp}</label>
                <label class='icon cards'>${player.cards.length}</label>
                <label class='icon eye'>${player.owls.length}</label>`;
  }
  static playerFace(playerCharactor) {
    return `url(img/${charactorImgUrl[playerCharactor]}.jpg)`;
  }
  static card(cardNo) {
    return `<div class='game-card' number=${cardNo}></div>`;
  }
  static winnerDialog(winners) {
    let title = winners.includes($self);
    return `<content-area>
                    <h2>${title}</h2>
                    <p>最强魔法师：</p>
                    <h1 class='winner'>${winners
                      .map(pos => $room[pos].name)
                      .join("</br>")}</h1>
                </content-area>
                <action-aream>
                    <button class='flat primary' onclick='hideDialogAndReady()'>准备新游戏</button>
                </action-aream>`;
  }
  static activitiesCard(usedCards) {
    let innerContent = ``;
    for (let i = 0; i < 8; i++) {
      innerContent += `<div class='slot'>
                                <div class='slot-text'>
                                    <span>${cardName[i]}</span>
                                    <span class='slot-text-used'>${
                                      usedCards[i]
                                    } / ${i + 1}</span>
                                </div>
                                <div class='slot-bar' style='width:${12.5 *
                                  (i + 1)}%'>
                                    <div class='slot-bar-used' style='width:${usedCards[
                                      i
                                    ] /
                                      (i + 1) *
                                      100}%; background-color: #${
        cardColor[i]
      };'></div>
                                </div>
                            </div>`;
    }
    return `<div class='card activities'>
                    <div id="tabsBar">
                        <tab ripple="light">
                            <label>已用卡统计</label>
                        </tab>
                        <tab ripple="light">
                            <label>游戏记录</label>
                        </tab>
                    </div>
                    <div id="panels">
                        <div class="panel active discard-pile">
                            <h3>已用卡统计</h3>
                            ${innerContent}
                        </div>
                        <div class="panel rightHide">
                            <h3>游戏记录</h3>
                        </div>
                    </div>
                </div>`;
  }
  static reconnectCard(roomID) {
    return `<div class="card error">
                    <div class="card-part">
                        <h3><i class="icon alert-circle"></i>
                            断线重连
                        </h3>
                        <p>检测到你有正在进行的游戏：房间 ${roomID}</p>
                        <p>你可以返回继续游戏，或者进入新的房间。当你进入新的房间，你将会在原本房间的游戏中认输。</p>
                        <button class="raised" onclick="reconnectRoom(${roomID})">重连</button>
                    </div>
                </div>`;
  }
  static abracaAnimation(card, top, left) {
    return `<animation-abraca class='filter${card}'
                    style="top:${top - 120 + 125 / 2}px;
                    left:${left - 120 + 81 / 2}px">
                        <abraca-1></abraca-1>
                        <abraca-2></abraca-2>
                </animation-abraca>`;
  }
}
Format.previseDialog = `<content-area>
                    <h2>你的预言牌</h2>
                    <p>这些是你通过<label class='icon owl' style='color: #9f3240'>4 猫头鹰</label>预知的牌。</p>
                    <p>预知牌是游戏初移出的四张牌，它们不会发给玩家，也不能被使用。只有你能看到你得到的预知牌。</p>
                    <p>点击底部的<label class='icon eye'></label>随时查看这些牌。</p>
                    <game-cards><collector></collector></game-cards>
                </content-area>`;
Format.cardsDialog = `<content-area>
                    <h2>你阵亡了</h2>
                    <p>为方便继续游戏，你的<label class='icon cards'>手牌</label>已经计入已用卡统计。</p>
                    <p>你可以点击底部的<label class='icon cards'></label>再次查看这些牌。</p>
                    <game-cards><collector></collector></game-cards>
                </content-area>`;
Format.FABWrap = `<div class='wrap'>
                    <div class='circle-layout'>
                        <div class='layout-left'>
                            <div class='circle-left'></div>
                        </div>
                        <div class='layout-right'>
                            <div class='circle-right'></div>
                        </div>
                    </div>
                </div>`;
