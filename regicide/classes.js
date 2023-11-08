/**
 * Course: SENG 513
 * Date: OCT 11, 2023
 * Assignment 2
 * Name: Yunfan Yang
 * UCID: 30067857
 */

class App {
    constructor() {
        this.game = new Game(1);
        this.number_of_players = 1;
    }

    createGame() {
        this.game = new Game(this.number_of_players);
    }

    getGame() {
        return this.game;
    }
}

class Game {
    constructor(player_count) {
        // Initialize targets
        this.players = Player.initialize(player_count);
        this.enemies = Enemy.initialize();
        this.discards = [];
        this.battlefield = [];

        // Battlefield stats
        this.attacker = null;
        this.battlefieldMultiplier = 1;

        // Set current player and enemy
        this.current_player_index = 0;

        // Game phase
        this.phase = Phase.STARTED;

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

    removeBattlefieldCard(card) {
        this.battlefield = this.battlefield.filter(c => c !== card);
    }

    clearBattlefield() {
        this.battlefield = [];
    }

    getBattlefieldCardValue() {
        return Card.getTotalRank(this.battlefield);
    }

    resolveBattlefield() {
        // Resolve card powers for player
        // Don't resolve suit power for the same suit with the enemy
        if (this.attacker instanceof Player) {
            const currentEnemySuit = this.getCurrentEnemy().card.suit;

            this.battlefield.forEach(card => {
                if (card.suit !== currentEnemySuit) {
                    const power = card.getPower();
                    power(this);
                }
            });
        }

        // Resolve damage
        const totalCardValue = this.getBattlefieldCardValue() * this.battlefieldMultiplier;

        if (this.attacker instanceof Player) {
            // When players attack, they deal total card value damage to the enemy
            const currentEnemy = this.getCurrentEnemy();
            currentEnemy.takeDamage(totalCardValue);
        } else {
            // When enemies attack, they deal enemy attack damage, but players defend with total card value
            const currentPlayer = this.getCurrentPlayer();
            currentPlayer.takeDamage(this.attacker.attack - totalCardValue);
        }
    }

    switchAttacker(force_player = false) {
        // `force_player` is used to force the attacker to be the player

        // If the attacker is a player, switch to the enemy
        // If the attacker is an enemy, switch to the next player
        // If force_player is true, switch to the next player regardless of the attacker
        if (this.attacker instanceof Player && !force_player) {
            this.attacker = this.getCurrentEnemy();
        } else {
            const nextPlayer = this.nextPlayer();
            this.attacker = nextPlayer;
        }
    }

    concludeTurn() {
        // Discard all battlefield cards
        this.battlefield.forEach(card => {
            this.discardCard(card);
        });
        this.clearBattlefield();
        this.battlefieldMultiplier = 1;

        // If enemy is dead, switch to the next enemy and next player attacks first
        if (this.getCurrentEnemy().isDead()) {
            // The enemy is dead, directly switch to the next enemy and the player attacks again
            this.discardCard(this.getCurrentEnemy().card);
            this.nextEnemy();
            this.switchAttacker(true);
        } else {
            // Switch attacker as normal
            this.switchAttacker();
        }

        // Make sure all players are still alive
        this.players.forEach(player => {
            if (player.isDead()) {
                this.phase = Phase.OVER;
            }
        });
    }

    getBattlefieldMessage() {
        const playerName = this.getCurrentPlayer().name;
        const enemyName = this.getCurrentEnemy().name;
        const battlefieldSize = this.battlefield.length;
        const battlefieldCardValue = this.getBattlefieldCardValue();

        if (this.attacker instanceof Player) {
            return `"${playerName}" is attacking "${enemyName}" with ${battlefieldCardValue} attack value (${battlefieldSize} cards)`;
        } else {
            const attack_value = this.getCurrentEnemy().attack;
            return `"${enemyName}" is attacking "${playerName}" with ${attack_value} damage, and "${playerName}" is defending with ${battlefieldCardValue} defend value (${battlefieldSize} cards)`;
        }
    }

    getTurnMessage() {
        const playerName = this.getCurrentPlayer().name;
        const enemyName = this.getCurrentEnemy().name;

        if (this.attacker instanceof Player) {
            return `${playerName}'s Turn`;
        } else {
            return `${enemyName}'s Turn`;
        }
    }

    getWinner() {
        if (this.phase === Phase.OVER) {
            if (this.players.find(player => player.isDead())) {
                // If any player is dead, the enemy wins
                return "Castle";
            } else {
                // If all players are alive, the players win
                return "Player";
            }
        }
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
        } else if (card === undefined || card === null) {
            return;
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
        const { max_cards } = PlayerConfigurations[player_count];
        return Array(player_count).fill().map((_, i) => new Player(`Player ${i + 1}`, `p${i + 1}`, max_cards));
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
            [Rank.JACK]: { health: 20, attack: 10, rank_name: "Jack" },
            [Rank.QUEEN]: { health: 30, attack: 15, rank_name: "Queen" },
            [Rank.KING]: { health: 40, attack: 20, rank_name: "King" }
        }

        return enemies_rank.flatMap(rank => {
            return enemies_suits.flatMap(suit => {
                const { health, attack, rank_name } = lookup_table[rank];
                const suit_name = suit.charAt(0).toUpperCase() + suit.slice(1);
                const name = `${suit_name} ${rank_name}`;
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
        return SuitPower[this.suit];
    }

    static getTotalRank(cards) {
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

const SuitPower = {
    "heart": (game) => {
        // Heal from the discard: Shuffle the discard pile then 
        // count out a number of cards facedown equal to the
        // attack value played. Place them under the Tavern
        // deck(no peeking!) then, return the discard pile to
        // the table, faceup.
        const battlefieldCardValue = game.getBattlefieldCardValue();
        const discardCardsNumber = battlefieldCardValue;

        // Shuffle the discard pile, and put them at the top of the tavern
        game.discards.shuffle();
        game.tavern.unshift(...game.discards.splice(0, discardCardsNumber));
    },
    "diamond": (game) => {
        // Draw cards: The current player draws a card. The 
        // other players follow in clockwise order drawing one
        // card at a time until a number of cards equal to the
        // attack value played have been drawn.Players that
        // have reached their maximum hand size are skipped.
        // Players may never draw cards over their maximum
        // hand size.There is no penalty for failing to draw
        // cards from an empty Tavern deck.
        const drawCardsNumber = game.getBattlefieldCardValue();
        const drawDeck = game.tavern.slice(0, drawCardsNumber);

        console.log(drawDeck);

        while (drawDeck.length > 0) {
            console.log(drawDeck);

            game.players.forEach(player => {
                if (player.isHandFull()) {
                    return; // Skip if the player's hand is full
                }

                const card = drawDeck.shift();
                player.addCard(card);
            });

            const allPlayerMaximumHandSize = game.players.every(player => player.isHandFull());
            if (allPlayerMaximumHandSize) {
                break; // Stop the process if everyone has maximum hand size
            }
        }

        // Put unused cards back to the tavern
        game.tavern.unshift(...drawDeck);
    },
    "club": (game) => {
        // Double damage: During Step 3, damage dealt by 
        // clubs counts for double.E.g., The 8 of Clubs deals 16
        // damage.
        game.battlefieldMultiplier = 2;
    },
    "spade": (game) => {
        // Shield against enemy attack: During Step 4, reduce 
        // the attack value of the current enemy by the attack
        // value played.The shield effects of spades are
        // cumulative for all spades played against this enemy
        // by any player, and remain in effect until the enemy
        // is defeated.
        const battlefieldCardValue = game.getBattlefieldCardValue();
        const currentEnemy = game.getCurrentEnemy();
        currentEnemy.attack -= battlefieldCardValue;
    }
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

const Phase = {
    STARTED: "started",
    OVER: "over",
}