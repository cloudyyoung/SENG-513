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

// Initialize a game instance with a given number of players
const game = new Game(3);

// Initialize the environment
refreshEnvironment();
refreshPlayers();

// Refresh card
// This function should refresh the card element
// It should show the card if it is facing up
// It should hide the card if it is facing down
// It should add the appropriate classes to the card element
function refreshCard(card, card_element) {
    if (card_element.classList.contains("hide") && card.facing === Facing.UP) {
        card_element.classList.add("flip");
        setTimeout(() => {
            card_element.classList.remove("flip");
        }, 500);
    }

    card_element.classList.remove("hide", "reveal");
    card_element.classList.add(card.facing === Facing.DOWN ? "hide" : "reveal");
    card_element.classList.add("card", `${card.suit}-${card.rank}`);
}

// Refresh environment
// This function should refresh the environment
// It should show the enemies that are currently on the castle
// It should show the cards that are currently in the tavern
function refreshEnvironment() {
    // Make sure current enemy is revealed
    const currentEnemy = game.getCurrentEnemy();
    currentEnemy.card.reveal();

    // Display current enemy health and attack value
    document.querySelector(".castle-wrapper .values .value.health .digit").innerHTML = currentEnemy.health;
    document.querySelector(".castle-wrapper .values .value.attack .digit").innerHTML = currentEnemy.attack;

    // Display castle cards
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

    // Display tavern cards
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

// Refresh players
// This function should refresh the players
// It should show the cards that are currently in the player's hand
// It should show the current player
// It should show the glance card view other players
function refreshPlayers() {
    // Display current player and their cards
    const current_player = game.getCurrentPlayer();
    const card_elements = current_player.cards.map(card => {
        card.reveal();

        const card_element = document.createElement("div");
        refreshCard(card, card_element);
        card_element.addEventListener("click", () => {
            card.reveal();
            refreshCard(card, card_element);
            // TODO: Implement this
            // This function should add the card to the battlefield
        });
        return card_element;
    });
    document.querySelector(`.current-player .hand`).replaceChildren(...card_elements);
    document.querySelector(`.current-player .label`).innerHTML = current_player.name;

    // Display other players and their cards (glance view)
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

function refreshBattlefield() {
    // TODO: Implement this
    // This function should refresh the battlefield
    // It should show the cards that are currently on the battlefield
}

window.addEventListener('resize', function () {
    refreshEnvironment();
    refreshPlayers();
});

function endTurn() {
    // TODO: Implement this
    // This function should end the turn and switch to the next player
}
