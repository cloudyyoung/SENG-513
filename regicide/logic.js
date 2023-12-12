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

        // Turn Logs
        this.logs = [];

        // Initialize tavern
        const tavernRanks = [
            Rank.ACE, Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE,
            Rank.SIX, Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN,
        ];
        const tavernSuits = [Suit.HEARTS, Suit.SPADES, Suit.CLUBS, Suit.DIAMONDS];
        this.tavern = tavernRanks.flatMap(rank => {
            return tavernSuits.flatMap(suit => {
                const suitName = suit.charAt(0).toUpperCase() + suit.slice(1);
                const name = `${suitName} ${rank}`;
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
        // If battlefield has cards, return back to current player's hand
        if (this.battlefield.length > 0) {
            this.battlefield.forEach(card => {
                this.getCurrentPlayer().addCard(card);
            });
            this.clearBattlefield();
        }

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
            this.logs.push(`Player "${this.attacker.name}" is attacking "${this.getCurrentEnemy().name}" with ${this.getBattlefieldAttackValue()} damage`);

            const currentEnemySuit = this.getCurrentEnemy().card.suit;

            this.battlefield.forEach(card => {
                if (card.suit !== currentEnemySuit) {
                    const power = card.getPower();
                    power(this, card);
                } else {
                    this.logs.push(`Card "${card.name}" has the same suit with the enemy "${this.getCurrentEnemy().name}", so its power is not resolved`);
                }
            });
        } else {
            this.logs.push(`Enemy "${this.attacker.name}" is attacking "${this.getCurrentPlayer().name} with ${this.getCurrentEnemy().attack} damage`);
        }

        // Resolve damage
        if (this.attacker instanceof Player) {
            // When players attack, they deal total card value damage to the enemy
            const totalAttackValue = this.getBattlefieldAttackValue();
            const currentEnemy = this.getCurrentEnemy();
            currentEnemy.takeDamage(totalAttackValue);
            this.logs.push(`Enemy "${currentEnemy.name}" takes ${totalAttackValue} damage, and has ${currentEnemy.health} health left`);
        } else {
            // When enemies attack, they deal enemy attack damage, but players defend with total card value
            const totalDefendValue = this.getBattlefieldDefendValue();
            const currentPlayer = this.getCurrentPlayer();
            const attack = this.getCurrentEnemy().attack;
            const damage = Math.max(0, this.attacker.attack - totalDefendValue);
            currentPlayer.takeDamage(damage);
            this.logs.push(`Player "${currentPlayer.name}" attempts ${totalDefendValue} defence to ${attack} damage`);
            this.logs.push(`Player "${currentPlayer.name}" takes ${damage} damage`);
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
            this.logs.push(`Enemy "${this.getCurrentEnemy().name}" is dead`);
            this.nextEnemy();
            this.logs.push(`Next enemy is "${this.getCurrentEnemy().name}"`);
            this.switchAttacker(true);
        } else {
            // Switch attacker as normal
            this.switchAttacker();
        }

        // Make sure all players are still alive
        this.players.forEach(player => {
            if (player.isDead()) {
                this.logs.push(`"${player.name}" is dead`);
                this.phase = Phase.OVER;
            }
        });

        // Make sure there are still enemies
        if (this.enemies.length === 0) {
            this.logs.push("All enemies are dead");
            this.phase = Phase.OVER;
        }

        // Make sure the next up player has card in hand to play
        if (this.getCurrentPlayer().isHandEmpty()) {
            this.logs.push(`"${this.getCurrentPlayer().name}" has no cards to play`);
            this.phase = Phase.OVER;
        }

        console.log(this.logs);
    }

    clearLogs() {
        this.logs = [];
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
            return `"${enemyName}" is attacking "${playerName}" with ${attackValue} attack value, and "${playerName}" is defending with ${battlefieldDefendValue} defend value (${battlefieldSize} cards)`;
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

    getOverMessage() {
        if (this.phase !== Phase.OVER) {
            return;
        } else if (this.players.find(player => player.isDead())) {
            return ["Players lose...", "A player is dead :("];
        } else if (this.enemies.length === 0) {
            return ["Players win!", "All enemies are dead :P"];
        } else if (this.yieldCount === this.players.length) {
            return ["Players lose...", "All players have yielded in this turn :("];
        } else if (this.getCurrentPlayer().isHandEmpty()) {
            return ["Players lose...", `Current player "${this.getCurrentPlayer().name}" has no cards to play :(`];
        } else {
            return ["Game over", "The game is simply over without a winner..."];
        }
    }
}

class Target {
    constructor(name, health) {
        this.name = name;
        this.health = health;
    }

    takeDamage(damage) {
        damage = Math.max(0, damage);
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

    isHandEmpty() {
        return this.cards.length === 0;
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
