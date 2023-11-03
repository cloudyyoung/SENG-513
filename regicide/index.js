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

const app = new App();

// Initialize the environment
refreshEnvironment();
refreshBattlefield();
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
    const currentEnemy = app.getGame().getCurrentEnemy();
    currentEnemy.card.reveal();

    // Display current enemy health and attack value
    document.querySelector(".castle-wrapper .values .value.health .digit").innerHTML = currentEnemy.health;
    document.querySelector(".castle-wrapper .values .value.attack .digit").innerHTML = currentEnemy.attack;

    // Display castle cards
    document.querySelector(".castle").replaceChildren(...app.getGame().enemies.map(enemy => {
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
    document.querySelector(".tavern").replaceChildren(...app.getGame().tavern.map(card => {
        const card_element = document.createElement("div");
        refreshCard(card, card_element);
        card_element.addEventListener("click", () => {
            app.getGame().getCurrentPlayer().addCard(app.getGame().drawTavernCard())
            refreshPlayers();
            refreshEnvironment();
        });
        return card_element;
    }).reverse());

    // Display Discrad pile
    document.querySelector(".discard").replaceChildren(...app.getGame().discards.map(card => {
        const card_element = document.createElement("div");
        refreshCard(card, card_element);
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
    const current_player = app.getGame().getCurrentPlayer();
    const card_elements = current_player.cards.map(card => {
        card.reveal();

        const card_element = document.createElement("div");
        refreshCard(card, card_element);
        card_element.addEventListener("click", () => {
            card.reveal();
            app.getGame().addBattlefieldCard(card);
            current_player.dropCard(card);
            refreshBattlefield();
            refreshPlayers();
        });
        return card_element;
    });
    document.querySelector(`.current-player .hand`).replaceChildren(...card_elements);
    document.querySelector(`.current-player .label`).innerHTML = current_player.name;

    // Display other players and their cards
    document.querySelector(`.players`).replaceChildren(...app.getGame().players.map((player, player_index) => {
        const player_element = document.createElement("div");
        player_element.classList.add("player", player.identifier);
        player_element.innerHTML = `
            <div class="label">${player.name}</div>
            <div class="hand">${player.cards.length} cards</div>
        `;
        return player_element;
    }));
}

function refreshBattlefield() {
    document.querySelector(".battlefield").replaceChildren(...app.getGame().battlefield.map(card => {
        const card_element = document.createElement("div");
        refreshCard(card, card_element);
        return card_element;
    }));
    refreshResolveButton();
    document.querySelector(".battle .description").innerHTML =
        `"${app.getGame().getCurrentPlayer().name}" is attacking "${app.getGame().getCurrentEnemy().name}" with ${app.getGame().battlefield.length} cards`;
}

function refreshResolveButton() {
    // Remove existing resolve button
    const existing_resolve_button = document.querySelector(".battle .resolve");
    if (existing_resolve_button) {
        existing_resolve_button.remove();
    }

    // Create resolve button
    const resolve_button = document.createElement("button");
    resolve_button.classList.add("resolve");
    resolve_button.innerHTML = "Resolve";
    document.querySelector(".battle").appendChild(resolve_button);
    resolve_button.addEventListener("click", () => {
        app.getGame().resolveBattlefield();
        app.getGame().concludeTurn();
        refreshEnvironment();
        refreshBattlefield();
        refreshPlayers();
    });

    // Show resolve button if there are cards on the battlefield
    if (app.getGame().battlefield.length > 0) {
        resolve_button.classList.remove("hide");
        console.log(app.getGame().battlefield);
    } else {
        resolve_button.classList.add("hide");
    }
}

window.addEventListener('resize', function () {
    refreshEnvironment();
    refreshBattlefield();
    refreshPlayers();
});

document.querySelector(".overlay.players-overlay").addEventListener("click", () => {
    document.querySelector(".players-overlay").classList.add("hide");
})

document.querySelector(".current-player .label").addEventListener("click", () => {
    document.querySelector(".players-overlay").classList.remove("hide");
})

document.querySelector(".menu .start").addEventListener("click", (e) => {
    document.querySelector(".menu-overlay").classList.add("hide");
    app.createGame();
    refreshEnvironment();
    refreshBattlefield();
    refreshPlayers();
})

document.querySelectorAll(".menu .players-options .option").forEach(a => a.addEventListener("click", () => {
    number_of_players = parseInt(a.getAttribute("data-players"));
    app.number_of_players = number_of_players;
    document.querySelectorAll(".menu .players-options .option.selected").forEach(b => {
        b.classList.remove("selected");
    })
    a.classList.add("selected");
}))
