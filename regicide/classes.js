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

    discardCard(card) {
        this.discards.push(card);
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

    resolveBattlefield() {
        // TODO: Implement this
        // Resolve card effects
        const total_rank = Card.totalRank(this.battlefield);
        const current_enemy = this.getCurrentEnemy();
        current_enemy.takeDamage(total_rank);
    }

    concludeTurn() {
        if (this.getCurrentEnemy().isDead()) {
            this.discardCard(this.getCurrentEnemy().card);
            this.nextEnemy();
        }

        // Discard all battlefield cards
        this.battlefield.forEach(card => {
            this.discardCard(card);
        });

        this.clearBattlefield();
    }
}

class Target {
    constructor(name, health) {
        this.name = name;
        this.health = health;
    }

    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
    }

    isDead() {
        return this.health <= 0;
    }
}

class Player extends Target {
    constructor(name, identifier, max_cards = 8) {
        super(name, 1);
        this.identifier = identifier;
        this.cards = [];
        this.max_cards = max_cards;
    }

    addCard(card) {
        if (this.isHandFull()) {
            throw new Error("Player hand is full");
        }

        this.cards.push(card);
    }

    dropCard(card) {
        this.cards = this.cards.filter(c => c !== card);
    }

    isHandFull() {
        return this.cards.length >= this.max_cards;
    }

    static initialize(player_count) {
        const { max_hand } = PlayerConfigurations[player_count];
        return Array(player_count).fill().map((_, i) => new Player(`Player ${i + 1}`, `p${i + 1}`, max_hand));
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
        const total_rank = cards.reduce((acc, card) => acc + card.rank, 0);
        return total_rank;
    }
}

const Suit = {
    HEARTS: "heart",
    SPADES: "spade",
    CLUBS: "club",
    DIAMONDS: "diamond",
}

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

const PlayerConfigurations = {
    1: { jesters: 0, max_cards: 8 },
    2: { jesters: 0, max_cards: 7 },
    3: { jesters: 1, max_cards: 6 },
    4: { jesters: 2, max_cards: 5 },
}