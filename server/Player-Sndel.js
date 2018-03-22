export default class Player {
    constructor(ip, name, roomID) {
        //Basic Info
        this.ip = ip;
        this.name = name;
        this.roomID = roomID;
        this.pos = 0;
        this.initialize();
        this.online = true;
    }
    initialize() {
        this.hp = 6;
        this.cards = [];
        this.owls = [];
        this.charactor = Math.ceil(Math.random() * 5);
        this.turnEndable = false;
        this.isReady = false;
    }
    ready() {
        this.isReady = true;
    };
    unready() {
        this.isReady = false;
    };
    changeHp(val) {
        this.hp += val;
        this.hp = Math.min(Math.max(0, this.hp), 6);
    };
    getCard(cardNo) {
        this.cards.push(cardNo);
    };
    removeCard(cardNo) {
        return !!(this.cards.splice(this.cards.indexOf(cardNo), 1) + 1);
    };
    requestAccess(requesterPos) {
        if (requesterPos == this.pos) return 2
        else return 1
    }
    info(requesterPos) {
        let access = this.requestAccess(requesterPos);
        /* Access:
        ** 0: for super
        ** 1: for others
        ** 2: for self
        ** 3: basic
        */
        let allInfo = {
            pos: this.pos,
            name: this.name,
            charactor: this.charactor,
            hp: this.hp,
            turnEndable: this.turnEndable,
            cards: this.cards,
            owls: this.owls
        }
        let maskToOther = {
            owls: this.owls.map(owl => -1),
        };
        let maskToSelf = {
            cards: this.cards.map(card => -1),
        }
        switch (access) {
            case 0: return { ...allInfo };
            case 1: return { ...allInfo, ...maskToOther }
            case 2: return { ...allInfo, ...maskToSelf }
            case 3: return { ...allInfo, ...maskToOther, ...maskToSelf }
            default: return {}
        }
    }
};