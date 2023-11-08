/**
 * Course: SENG 513
 * Date: NOV 12, 2023
 * Assignment 3
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
function refreshCard(card, cardElement) {
    if (cardElement.classList.contains("hide") && card.facing === Facing.UP) {
        cardElement.classList.add("flip");
        setTimeout(() => {
            cardElement.classList.remove("flip");
        }, 500);
    }

    cardElement.classList.remove("hide", "reveal");
    cardElement.classList.add(card.facing === Facing.DOWN ? "hide" : "reveal");
    cardElement.classList.add("card", `${card.suit}-${card.rank}`);
}

// Refresh environment
// This function should refresh the environment
// It should show the enemies that are currently on the castle
// It should show the cards that are currently in the tavern
function refreshEnvironment() {
    // Check game phase
    if (app.getGame().phase === Phase.OVER) {
        showOverMessage();
        return;
    }

    // Make sure current enemy is revealed
    const currentEnemy = app.getGame().getCurrentEnemy();
    currentEnemy.card.reveal();

    // Display current enemy health and attack value
    document.querySelector(".castle-wrapper .values .value.health .digit").innerHTML = currentEnemy.health;
    document.querySelector(".castle-wrapper .values .value.attack .digit").innerHTML = currentEnemy.attack;

    // Display castle cards
    document.querySelector(".castle").replaceChildren(...app.getGame().enemies.map(enemy => {
        const card = enemy.card;
        const cardElement = document.createElement("div");
        refreshCard(card, cardElement);
        cardElement.addEventListener("click", () => {
            card.reveal();
            refreshCard(card, cardElement);
        });
        return cardElement;
    }).reverse());

    // Display tavern cards
    document.querySelector(".tavern").replaceChildren(...app.getGame().tavern.map(card => {
        const cardElement = document.createElement("div");
        refreshCard(card, cardElement);
        return cardElement;
    }).reverse());

    // Display Discrad pile
    document.querySelector(".discard").replaceChildren(...app.getGame().discards.map(card => {
        const cardElement = document.createElement("div");
        refreshCard(card, cardElement);
        return cardElement;
    }).reverse());
}

// Refresh players
// This function should refresh the players
// It should show the cards that are currently in the player's hand
// It should show the current player
// It should show the glance card view other players
function refreshPlayers() {
    // Display current player and their cards
    const currentPlayer = app.getGame().getCurrentPlayer();
    const cardElements = currentPlayer.cards.map(card => {
        card.reveal();

        const cardElement = document.createElement("div");
        refreshCard(card, cardElement);
        cardElement.addEventListener("click", () => {
            card.reveal();
            app.getGame().addBattlefieldCard(card);
            currentPlayer.dropCard(card);
            refreshBattlefield();
            refreshPlayers();
        });
        return cardElement;
    });
    document.querySelector(`.current-player .hand`).replaceChildren(...cardElements);
    document.querySelector(`.current-player .label`).setAttribute("data-identifier", currentPlayer.identifier);
    document.querySelector(`.current-player .label`).innerHTML = currentPlayer.name;

    // Display other players and their cards
    document.querySelector(".max-cards").innerHTML = `Max ${app.getGame().players[0].maxCards} cards per player`;
    document.querySelector(`.players`).replaceChildren(...app.getGame().players.map(player => {
        const playerElement = document.createElement("div");
        playerElement.classList.add("player", player.identifier);
        playerElement.innerHTML = `
            <div class="label">${player.name}</div>
            <div class="hand">${player.cards.length} cards</div>
        `;
        return playerElement;
    }));
}

function refreshBattlefield() {
    document.querySelector(".battlefield").replaceChildren(...app.getGame().battlefield.map(card => {
        const cardElement = document.createElement("div");
        refreshCard(card, cardElement);
        cardElement.addEventListener("click", () => {
            app.getGame().removeBattlefieldCard(card);
            app.getGame().getCurrentPlayer().addCard(card);
            refreshBattlefield();
            refreshPlayers();
        });
        return cardElement;
    }));
    refreshResolveButton();
    refreshYieldButton();
    document.querySelector(".battle .description").innerHTML = app.getGame().getBattlefieldMessage();
}

function refreshResolveButton() {
    // Remove existing resolve button
    const existingResolveButton = document.querySelector(".battle .resolve");
    if (existingResolveButton) {
        existingResolveButton.remove();
    }

    // Create resolve button
    const resolveButton = document.createElement("button");
    resolveButton.classList.add("resolve");
    if (app.getGame().getAttackerType() === "Player") {
        resolveButton.innerHTML = "Attack";
    } else {
        resolveButton.innerHTML = "Defend";
    }
    document.querySelector(".battle .buttons").appendChild(resolveButton);
    resolveButton.addEventListener("click", () => {
        app.getGame().resolveBattlefield();
        app.getGame().concludeTurn();
        refreshEnvironment();
        refreshBattlefield();
        refreshPlayers();
        showTurnMessage();
    });

    // Show resolve button if there are cards on the battlefield
    if (app.getGame().battlefield.length > 0) {
        resolveButton.classList.remove("hide");
        console.log(app.getGame().battlefield);
    } else {
        resolveButton.classList.add("hide");
    }
}

function refreshYieldButton() {
    // Remove existing yield button
    const existingYieldButton = document.querySelector(".battle .yield");
    if (existingYieldButton) {
        existingYieldButton.remove();
    }

    // If the current turn is not player's turn, do not show yield button
    if (app.getGame().getAttackerType() !== "Player") {
        return;
    }

    // Create yield button
    const yieldButton = document.createElement("button");
    yieldButton.classList.add("yield");
    yieldButton.innerHTML = "Yield";
    document.querySelector(".battle .buttons").appendChild(yieldButton);
    yieldButton.addEventListener("click", () => {
        app.getGame().yieldBattlefield();
        app.getGame().concludeTurn();
        refreshBattlefield();
        showTurnMessage();

        console.log(app.getGame().phase);
    });
}

function showTurnMessage() {
    if (app.getGame().phase === Phase.OVER) {
        return;
    }

    document.querySelector(".turn-overlay").classList.remove("hide");
    document.querySelector(".turn-overlay .title").innerHTML = app.getGame().getTurnMessage();
    setTimeout(() => {
        document.querySelector(".turn-overlay").classList.add("hide");
    }, 1500);
}

function showOverMessage() {
    document.querySelector(".over-overlay").classList.remove("hide");
    const [title, description] = app.getGame().getOverMessage();
    document.querySelector(".over-overlay .title").innerHTML = title;
    document.querySelector(".over-overlay .description").innerHTML = description;
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
    showTurnMessage();
})

document.querySelectorAll(".menu .players-options .option").forEach(a => a.addEventListener("click", () => {
    numberOfPlayers = parseInt(a.getAttribute("data-players"));
    app.numberOfPlayers = numberOfPlayers;
    document.querySelectorAll(".menu .players-options .option.selected").forEach(b => {
        b.classList.remove("selected");
    })
    a.classList.add("selected");
}))
