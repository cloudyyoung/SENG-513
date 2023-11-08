/**
 * Course: SENG 513
 * Date: NOV 12, 2023
 * Assignment 3
 * Name: Yunfan Yang
 * UCID: 30067857
 */

class App {
    constructor() {
        this.game = new Game(1);
        this.numberOfPlayers = 1;
    }

    createGame() {
        this.game = new Game(this.numberOfPlayers);
    }

    getGame() {
        return this.game;
    }
}

class Game {
    constructor(playerCount) {
        // Initialize targets
        this.players = Player.initialize(playerCount);
        this.enemies = Enemy.initialize();
        this.discards = [];
        this.battlefield = [];

        // Battlefield stats
        this.attacker = null;

        // Yield count
        this.yieldCount = 0;

        // Set current player and enemy
        this.currentPlayerIndex = 0;

        // Game phase
        this.phase = Phase.STARTED;

        // Initialize tavern
        const tavernRanks = [
            Rank.ACE, Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE,
            Rank.SIX, Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN,
        ];
        const tavernSuits = [Suit.HEARTS, Suit.SPADES, Suit.CLUBS, Suit.DIAMONDS];
        this.tavern = tavernRanks.flatMap(rank => {
            return tavernSuits.flatMap(suit => {
                const name = `${suit} ${rank}`;
                const card = new Card(name, suit, rank, rank);
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
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        if (this.currentPlayerIndex === 0) {
            this.yieldCount = 0;
        }
        return this.getCurrentPlayer();
    }

    nextEnemy() {
        return this.enemies.shift();
    }

    discardCard(card) {
        this.discards.push(card);
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
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

    yieldBattlefield() {
        this.yieldCount += 1;
        // If all players have yielded in the same round, game over
        if (this.yield === this.players.length) {
            this.phase = Phase.OVER;
        }
    }

    getBattlefieldAttackValue() {
        return Card.getTotalAttack(this.battlefield);
    }

    getBattlefieldDefendValue() {
        return Card.getTotalDefend(this.battlefield);
    }

    resolveBattlefield() {
        // Resolve card powers for player
        // Don't resolve suit power for the same suit with the enemy
        if (this.attacker instanceof Player) {
            const currentEnemySuit = this.getCurrentEnemy().card.suit;

            this.battlefield.forEach(card => {
                if (card.suit !== currentEnemySuit) {
                    const power = card.getPower();
                    power(this, card);
                }
            });
        }

        // Resolve damage
        if (this.attacker instanceof Player) {
            // When players attack, they deal total card value damage to the enemy
            const totalAttackValue = this.getBattlefieldAttackValue();
            const currentEnemy = this.getCurrentEnemy();
            currentEnemy.takeDamage(totalAttackValue);
        } else {
            // When enemies attack, they deal enemy attack damage, but players defend with total card value
            const totalDefendValue = this.getBattlefieldDefendValue();
            const currentPlayer = this.getCurrentPlayer();
            currentPlayer.takeDamage(this.attacker.attack - totalDefendValue);
        }
    }

    getAttacker() {
        return this.attacker;
    }

    getAttackerType() {
        if (this.attacker instanceof Player) {
            return "Player";
        } else {
            return "Enemy";
        }
    }

    switchAttacker(forcePlayer = false) {
        // `force_player` is used to force the attacker to be the player

        // If the attacker is a player, switch to the enemy
        // If the attacker is an enemy, switch to the next player
        // If force_player is true, switch to the next player regardless of the attacker
        if (this.attacker instanceof Player && !forcePlayer) {
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

        if (this.attacker instanceof Player) {
            const battlefieldAttackValue = this.getBattlefieldAttackValue();
            return `"${playerName}" is attacking "${enemyName}" with ${battlefieldAttackValue} attack value (${battlefieldSize} cards)`;
        } else {
            const attackValue = this.getCurrentEnemy().attack;
            const battlefieldDefendValue = this.getBattlefieldDefendValue();
            return `"${enemyName}" is attacking "${playerName}" with ${attackValue} damage, and "${playerName}" is defending with ${battlefieldDefendValue} defend value (${battlefieldSize} cards)`;
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
    constructor(name, identifier, maxCards = 8) {
        super(name, 1);
        this.identifier = identifier;
        this.cards = [];
        this.maxCards = maxCards;
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
        return this.cards.length >= this.maxCards;
    }

    static initialize(playerCount) {
        const { max_cards } = PlayerConfigurations[playerCount];
        return Array(playerCount).fill().map((_, i) => new Player(`Player ${i + 1}`, `p${i + 1}`, max_cards));
    }
}

class Enemy extends Target {
    constructor(name, health, attack, card) {
        super(name, health);
        this.attack = attack;
        this.card = card;
    }

    takeDefend(defend) {
        this.attack = Math.max(0, this.attack - defend);
    }

    static initialize() {
        const enemiesRank = [Rank.JACK, Rank.QUEEN, Rank.KING];
        const enemiesSuits = [Suit.HEARTS, Suit.SPADES, Suit.CLUBS, Suit.DIAMONDS];
        const lookupTable = {
            [Rank.JACK]: { health: 20, attack: 10, rank_name: "Jack" },
            [Rank.QUEEN]: { health: 30, attack: 15, rank_name: "Queen" },
            [Rank.KING]: { health: 40, attack: 20, rank_name: "King" }
        }

        return enemiesRank.flatMap(rank => {
            return enemiesSuits.flatMap(suit => {
                const { health, attack, rank_name } = lookupTable[rank];
                const suitName = suit.charAt(0).toUpperCase() + suit.slice(1);
                const name = `${suitName} ${rank_name}`;
                const card = new Card(name, suit, rank, attack);
                return new Enemy(name, health, attack, card);
            }).shuffle();
        });
    }
}

class Card {
    constructor(name, suit, rank, attack) {
        this.name = name;
        this.suit = suit;
        this.rank = rank;
        this.attack = attack;
        this.defend = attack;
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

    static getTotalAttack(cards) {
        const totalAttack = cards.reduce((acc, card) => acc + card.attack, 0);
        return totalAttack;
    }

    static getTotalDefend(cards) {
        const totalDefend = cards.reduce((acc, card) => acc + card.defend, 0);
        return totalDefend;
    }
}

const Suit = {
    HEARTS: "heart",
    SPADES: "spade",
    CLUBS: "club",
    DIAMONDS: "diamond",
}

const SuitPower = {
    "heart": (game, card) => {
        // Heal from the discard: Shuffle the discard pile then 
        // count out a number of cards facedown equal to the
        // attack value played. Place them under the Tavern
        // deck(no peeking!) then, return the discard pile to
        // the table, faceup.
        const battlefieldCardValue = card.attack;
        const discardCardsNumber = battlefieldCardValue;

        // Shuffle the discard pile, and put them at the top of the tavern
        game.discards.shuffle();
        game.tavern.unshift(...game.discards.splice(0, discardCardsNumber));
    },
    "diamond": (game, card) => {
        // Draw cards: The current player draws a card. The 
        // other players follow in clockwise order drawing one
        // card at a time until a number of cards equal to the
        // attack value played have been drawn.Players that
        // have reached their maximum hand size are skipped.
        // Players may never draw cards over their maximum
        // hand size.There is no penalty for failing to draw
        // cards from an empty Tavern deck.
        const drawCardsNumber = card.attack;
        const drawDeck = game.tavern.slice(0, drawCardsNumber);
        let cardsDrawn = 0;
        let currentPlayerIndex = game.currentPlayerIndex;

        while (cardsDrawn < drawCardsNumber && drawDeck.length > 0) {
            let player = game.players[currentPlayerIndex];
            let maxCards = PlayerConfigurations[game.players.length].maxCards;

            // Draw a card if the player hasn't reached their maximum hand size
            if (player.cards.length < maxCards) {
                player.cards.push(drawDeck.shift());
                cardsDrawn++;
            }

            // Move to the next player in a clockwise order
            currentPlayerIndex = (currentPlayerIndex + 1) % game.players.length;

            // Check if we have completed a full round (back to the starting player)
            if (currentPlayerIndex === game.currentPlayerIndex) {
                const allPlayerMaximumHandSize = game.players.every(player => player.isHandFull());
                if (allPlayerMaximumHandSize) {
                    break; // Stop the process if everyone has maximum hand size
                }
            }
        }

        // Update the game's tavern deck by removing the drawn cards
        game.tavern.splice(0, cardsDrawn);
    },
    "club": (_, card) => {
        // Double damage: During Step 3, damage dealt by 
        // clubs counts for double.E.g., The 8 of Clubs deals 16
        // damage.
        card.attack = card.defend * 2;
    },
    "spade": (game, card) => {
        // Shield against enemy attack: During Step 4, reduce 
        // the attack value of the current enemy by the attack
        // value played.The shield effects of spades are
        // cumulative for all spades played against this enemy
        // by any player, and remain in effect until the enemy
        // is defeated.
        const battlefieldCardValue = card.attack;
        const currentEnemy = game.getCurrentEnemy();
        currentEnemy.takeDefend(battlefieldCardValue);
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