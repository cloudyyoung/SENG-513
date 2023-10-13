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
    constructor(name, health) {
        super(name, health);
        this.hand = [];
    }

    static initialize(player_count) {
        return Array(player_count).fill().map((_, i) => new Player(`Player ${i + 1}`, 1));
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
        const suits = [Suit.HEARTS, Suit.SPADES, Suit.CLUBS, Suit.DIAMONDS];
        const lookup_table = {
            [Rank.JACK]: { health: 10, attack: 20 },
            [Rank.QUEEN]: { health: 15, attack: 30 },
            [Rank.KING]: { health: 20, attack: 40 }
        }

        return enemies_rank.flatMap(rank => {
            return suits.flatMap(suit => {
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
}

const Suit = {
    HEARTS: "heart",
    SPADES: "spade",
    CLUBS: "club",
    DIAMONDS: "diamond",
}

const Rank = {
    ACE: "a",
    TWO: "two",
    THREE: "three",
    FOUR: "four",
    FIVE: "five",
    SIX: "six",
    SEVEN: "seven",
    EIGHT: "eight",
    NINE: "nine",
    TEN: "ten",
    JACK: "j",
    QUEEN: "q",
    KING: "k",
}

const Facing = {
    UP: "up",
    DOWN: "down",
}