/**
 * Course: SENG 513
 * Date: OCT 11, 2023
 * Assignment 2
 * Name: Yunfan Yang
 * UCID: 30067857
 */

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

const game = new Game(3);
console.log(game);


refreshEnvironment();
refreshPlayers();

function refreshCard(card, card_element) {
    card_element.classList.remove("hide", "reveal", "flip");
    card_element.classList.add(card.facing === Facing.DOWN ? "hide" : "reveal");
    card_element.classList.add("card", card.rank, card.suit);
}

function refreshEnvironment() {
    document.querySelector(".castle").replaceChildren(...game.enemies.slice(0).map(enemy => {
        const card = enemy.card;
        const card_element = document.createElement("div");
        refreshCard(card, card_element);
        card_element.addEventListener("click", () => {
            card.reveal();
            refreshCard(card, card_element);
        });
        return card_element;
    }));

    document.querySelector(".tavern").replaceChildren(...game.tavern.slice(0).map(card => {
        const card_element = document.createElement("div");
        refreshCard(card, card_element);
        card_element.addEventListener("click", () => {
            game.getCurrentPlayer().addCard(game.drawTavernCard())
            refreshPlayers();
            refreshEnvironment();
        });
        return card_element;
    }));
}

function refreshPlayers() {
    game.players.forEach((player, player_index) => {
        const card_elements = game.players[player_index].cards.map(card => {
            const card_element = document.createElement("div");
            refreshCard(card, card_element);
            return card_element;
        });
        document.querySelector(`.players .player.${player.identifier} .hand`).replaceChildren(...card_elements);
        document.querySelector(`.players .player.${player.identifier} .label`).innerHTML = player.name;
    });
}

window.addEventListener('resize', function () {
    refreshEnvironment();
    refreshPlayers();
});

// Castle cards
document.querySelectorAll(".castle .card").forEach(card => {
    card.addEventListener("click", function () {
        if (card.classList.contains("hide")) {
            card.classList.add("flip");
            setTimeout(() => {
                card.classList.remove("flip");
                card.classList.remove("hide");
            }, 200);
        }
    });
});

function playCard(player, card_face) {
    // Play card from a player
    // @params player: player object
    // @params card_face: card face string
}

function dealDamage(target, damage) {
    // Deal damage to a target (whether player or castle enemy)
    // @params target: target string
    // @params damage: damage number
}

function drawCard(player) {
    // Draw a card from tavern to a player
    // @params player: player object
}

function discardCard(player, card_face) {
    // Discard a card from a player
    // @params player: player object
    // @params card_face: card face string
}

function endTurn(player) {
    // End turn for a player
    // @params player: player object
}

function startTurn(player) {
    // Start turn for a player
    // @params player: player object
}

function startGame() {
    // Start game
}

function endGame() {
    // End game
}
