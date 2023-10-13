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
    if (card_element.classList.contains("hide") && card.facing === Facing.UP) {
        card_element.classList.add("flip");
        setTimeout(() => {
            card_element.classList.remove("flip");
        }, 500);
    }

    card_element.classList.remove("hide", "reveal");
    card_element.classList.add(card.facing === Facing.DOWN ? "hide" : "reveal");
    card_element.classList.add("card", card.rank, card.suit);
}

function refreshEnvironment() {
    document.querySelector(".castle").replaceChildren(...game.enemies.map(enemy => {
        const card = enemy.card;
        const card_element = document.createElement("div");
        refreshCard(card, card_element);
        card_element.addEventListener("click", () => {
            card.reveal();
            refreshCard(card, card_element);
        });
        return card_element;
    }).reverse());

    document.querySelector(".tavern").replaceChildren(...game.tavern.map(card => {
        const card_element = document.createElement("div");
        refreshCard(card, card_element);
        card_element.addEventListener("click", () => {
            game.getCurrentPlayer().addCard(game.drawTavernCard())
            refreshPlayers();
            refreshEnvironment();
        });
        return card_element;
    }).reverse());
}

function refreshPlayers() {
    const current_player = game.getCurrentPlayer();

    const card_elements = current_player.cards.map(card => {
        card.reveal();

        const card_element = document.createElement("div");
        refreshCard(card, card_element);
        card_element.addEventListener("click", () => {
            card.reveal();
            refreshCard(card, card_element);
        });
        return card_element;
    });
    document.querySelector(`.current-player .hand`).replaceChildren(...card_elements);
    document.querySelector(`.current-player .label`).innerHTML = current_player.name;

    game.players.forEach((player, player_index) => {
        const card_elements = game.players[player_index].cards.map(card => {
            card.hide();
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