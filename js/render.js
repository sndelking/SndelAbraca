render = (room, self) => {
    renderPlayers(room, self);
    renderActivitiesCard(room);
}
renderPlayers = (room, self) => {
    room.players.forEach((player, pos) => {
        renderPlayer(player, room.status, self);
    });
}
renderPlayer = (player, roomStatus, self) => {
    renderPlayerBase(player, self);
    renderPlayerInfo(player, roomStatus);
    renderPlayerCards(player, roomStatus, self);
}
renderPlayerBase = (player, self) => {
    if (player.pos != self && !this.player(player.pos).length) {
        let renderPosition = (player.pos - ($self - 2)) % 5;
        let node = Format.playerBase(player);
        let leftPlayersCollector = $(".players-collector.left");
        let rightPlayersCollector = $(".players-collector.right")
        if (renderPosition < 2)
            leftPlayersCollector.append(node)
        else if (renderPosition > 2)
            rightPlayersCollector.prepend(node)
    }
}
renderPlayerface = (player, roomStatus) => {
    this.player(player.pos).find("face").css(
        "background-image",
        Format.playerFace(roomStatus ? player.charactor : 0)
    )
}
renderPlayerInfo = (player, roomStatus) => {
    let gameInfo = this.player(player.pos).find("game-info");
    if (roomStatus)
        gameInfo.html(Format.playerGameInfo(player));
    else
        gameInfo.html('');
}
renderPlayerCards = (player, roomStatus, self) => {
    if (player.pos == self) return;
    let cardsCollector = this.player(player.pos).find("collector");
    let addedCardsIndexList = [];
    let removedCardsIndexList = this.player(player.pos).find(".game-card").get().map(cardDOM => Number(cardDOM.getAttribute("number")));
    player.cards.forEach(card => {
        let newCardIndex = removedCardsIndexList.indexOf(card);
        if (newCardIndex == -1) addedCardsIndexList.push(card);
        else removedCardsIndexList.splice(newCardIndex, 1)
    })
    addedCardsIndexList.forEach(card => {
        this.player(player.pos).find("collector").append(Format.card(card))
    })
    removedCardsIndexList.forEach(card => {
        let cardJqNode = this.player(player.pos).find(`[number='${card}']`).eq(0);
        cardFadeOut(cardJqNode);
        abracaSucceed(card, cardJqNode.offset().top, cardJqNode.offset().left);
    })
}
renderActivitiesCard = (room) => {
    if (room.status)
        if (!$(".discard-pile").length) {
            $("body").append(Format.activitiesCard(room.usedCards))
            initTabsBar();
            initTabPanels();
        }
        else {
            $(".discard-pile").find('.slot').map(function (idx) {
                $(this).find('.slot-text-used').html(`${room.usedCards[idx]} / ${idx + 1}`);
                $(this).find('.slot-bar-used').width(`${room.usedCards[idx] / (idx + 1) * 100}%`);
            })
        }
    else
        $(".discard-pile").remove()
}
renderRecords = (room) => {
    if (room.status) {
        if (!$(".records").length)
            $("body").append(Format.records)
    }
    else
        $(".records").remove()
}