/**
 * Course: SENG 513
 * Date: OCT 11, 2023
 * Assignment 2
 * Name: Yunfan Yang
 * UCID: 30067857
 */

class Game {
    constructor(player_count) {
        // Initialize targets
        this.players = Player.initialize(player_count);
        this.enemies = Enemy.initialize();
        this.discards = [];
        this.battlefield = [];
        this.attacker = null;

        // Set current player and enemy
        this.current_player_index = 0;

        // Initialize tavern
        const tavern_ranks = [
            Rank.ACE, Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE,
            Rank.SIX, Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN,
        ];
        const tavern_suits = [Suit.HEARTS, Suit.SPADES, Suit.CLUBS, Suit.DIAMONDS];
        this.tavern = tavern_ranks.flatMap(rank => {
            return tavern_suits.flatMap(suit => {
                const name = `${suit} ${rank}`;
                const card = new Card(name, suit, rank);
                return card;
            }).shuffle();
        }).shuffle();

        // Draw five cards for each player
        this.players.forEach(player => {
            player.cards = this.tavern.splice(0, 5);
        });

        // Reveal the first enemy
        this.enemies[0].card.reveal();

        // Player attacks first
        this.attacker = this.getCurrentPlayer();
    }

    nextPlayer() {
        this.current_player_index = (this.current_player_index + 1) % this.players.length;
        return this.getCurrentPlayer();
    }

    nextEnemy() {
        return this.enemies.shift();
    }

    getCurrentPlayer() {
        return this.players[this.current_player_index];
    }

    getCurrentEnemy() {
        return this.enemies[0];
    }

    drawTavernCard() {
        return this.tavern.shift();
    }

    addBattlefieldCard(card) {
        this.battlefield.push(card);
    }

    clearBattlefield() {
        this.battlefield = [];
    }

    concludeBattle() {
        // TODO: Implement this
        // This function should move all cards from the battlefield to the discard pile
        // and also deal any damage to the target
    }

    updateAttacker() {
        // TODO: Implement this
        // This function should update the attacker
        // based on the current attacker and the battlefield
    }
}

class Target {
    constructor(name, health) {
        this.name = name;
        this.health = health;
    }

    takeDamage(damage) {
        this.health -= damage;
    }

    isDead() {
        return this.health <= 0;
    }
}

class Player extends Target {
    constructor(name, identifier, health) {
        super(name, health);
        this.identifier = identifier;
        this.cards = [];
    }

    addCard(card) {
        this.cards.push(card);
    }

    dropCard(card) {
        this.cards = this.cards.filter(c => c !== card);
    }

    static initialize(player_count) {
        return Array(player_count).fill().map((_, i) => new Player(`Player ${i + 1}`, `p${i + 1}`, 1));
    }
}

class Enemy extends Target {
    constructor(name, health, attack, card) {
        super(name, health);
        this.attack = attack;
        this.card = card;
    }

    static initialize() {
        const enemies_rank = [Rank.JACK, Rank.QUEEN, Rank.KING];
        const enemies_suits = [Suit.HEARTS, Suit.SPADES, Suit.CLUBS, Suit.DIAMONDS];
        const lookup_table = {
            [Rank.JACK]: { health: 20, attack: 10 },
            [Rank.QUEEN]: { health: 30, attack: 15 },
            [Rank.KING]: { health: 40, attack: 20 }
        }

        return enemies_rank.flatMap(rank => {
            return enemies_suits.flatMap(suit => {
                const name = `${suit} ${rank}`;
                const { health, attack } = lookup_table[rank];
                const card = new Card(name, suit, rank);
                return new Enemy(name, health, attack, card);
            }).shuffle();
        });
    }
}

class Card {
    constructor(name, suit, rank) {
        this.name = name;
        this.suit = suit;
        this.rank = rank;
        this.facing = Facing.DOWN;
    }

    getCardFace() {
        return `${this.suit} ${this.rank}`;
    }

    flip() {
        this.facing = this.facing === Facing.UP ? Facing.DOWN : Facing.UP;
    }

    reveal() {
        this.facing = Facing.UP;
    }

    hide() {
        this.facing = Facing.DOWN;
    }

    getPower() {
        // TODO: Implement this
        // This function should return the power of the card
        // based on the suit of the card
    }

    static totalRank(cards) {
        // TODO: Implement this
        // This function should return the total rank of the cards
        // based on the rank of the cards
    }
}

const Suit = {
    HEARTS: "heart",
    SPADES: "spade",
    CLUBS: "club",
    DIAMONDS: "diamond",
}

// TODO: Implement constant for suit power
// const SuitPower = {
//     ...
// }

const Rank = {
    ACE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    SIX: 6,
    SEVEN: 7,
    EIGHT: 8,
    NINE: 9,
    TEN: 10,
    JACK: 11,
    QUEEN: 12,
    KING: 13,
}

const Facing = {
    UP: "up",
    DOWN: "down",
}