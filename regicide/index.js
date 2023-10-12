Array.prototype.shuffle = function () {
    var i = this.length, j, temp;
    if (i == 0) return this;
    while (--i) {
        j = Math.floor(Math.random() * (i + 1));
        temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
}


const jester_1 = document.createElement("div");
const jester_2 = document.createElement("div");
jester_1.classList.add("card");
jester_1.classList.add("jester");
jester_2.classList.add("card");
jester_2.classList.add("jester");

document.querySelector(".jesters").appendChild(jester_1);
document.querySelector(".jesters").appendChild(jester_2);

SUITES = ["heart", "diamond", "club", "spade"];
ENEMIES = ["j", "q", "k"];
HANDS = ["a", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
DISCARD_CARDS = [];
PLAYERS = ["one", "two"];
PLAYERS_CARDS = {};


// Initializing castle cards
CASTLE_CARDS = ENEMIES.flatMap(suite => {
    return SUITES.flatMap(enemy => {
        return `${suite} ${enemy}`;
    }).shuffle();
});

// Shuffle playable cards
PLAYABLE_CARDS = HANDS.flatMap(suite => {
    return SUITES.flatMap(hand => {
        return `${suite} ${hand}`;
    });
}).shuffle();


// Draw 5 cards from playable cards for each player
PLAYERS.forEach(player_no => {
    PLAYERS_CARDS[player_no] = PLAYABLE_CARDS.splice(0, 5);
});

console.log(PLAYERS_CARDS);

refresh_environment();
refresh_players();

function refresh_environment() {
    document.querySelector(".castle").replaceChildren(...CASTLE_CARDS.reverse().map(card_face => {
        const card = document.createElement("div");
        card.classList.add("card", "hide");
        card.classList.add(...card_face.split(" "));
        return card;
    }));

    document.querySelector(".cards").replaceChildren(...PLAYABLE_CARDS.reverse().map(card_face => {
        const card = document.createElement("div");
        card.classList.add("card", "hide");
        card.classList.add(...card_face.split(" "));
        return card;
    }));
}

function refresh_players() {
    PLAYERS.forEach(player_no => {
        document.querySelector(`.players .player.${player_no} .hand`).replaceChildren(...PLAYERS_CARDS[player_no].map(card_face => {
            const card = document.createElement("div");
            card.classList.add("card", "hide");
            card.classList.add(...card_face.split(" "));
            return card;
        }));
    });
}