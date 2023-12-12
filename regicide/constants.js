/**
 * Course: SENG 513
 * Date: NOV 12, 2023
 * Assignment 3
 * Name: Yunfan Yang
 * UCID: 30067857
 */


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
    game.tavern.forEach(card => card.hide());

    game.logs.push(`Card "${card.name}" shuffles ${discardCardsNumber} cards from discard pile to the tavern`);
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
    let playersCardsNumberPrevious = game.players.map(player => player.cards.length);

    while (cardsDrawn < drawCardsNumber && drawDeck.length > 0) {
      let player = game.players[currentPlayerIndex];
      let maxCards = player.maxCards

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

    game.logs.push(`Card "${card.name}" should hand ${drawCardsNumber} cards out from tavern and hand to players, and it eventually hands ${cardsDrawn} cards out from tavern to players`);
    game.players.forEach((player, i) => {
      const previous = playersCardsNumberPrevious[i];
      const current = player.cards.length;
      const diff = current - previous;
      game.logs.push(`→ Player "${player.name}" now has ${current} cards in hand (${diff} cards drawn, maximum ${player.maxCards} cards in hand)`);
    });


    // Update the game's tavern deck by removing the drawn cards
    game.tavern.splice(0, cardsDrawn);
  },
  "club": (game, card) => {
    // Double damage: During Step 3, damage dealt by 
    // clubs counts for double.E.g., The 8 of Clubs deals 16
    // damage.
    card.attack = card.defend * 2;
    game.logs.push(`Card "${card.name}" is doubled to ${card.attack} damage`);
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
    game.logs.push(`Card "${card.name}" make current enemy "${currentEnemy.name}" loses ${battlefieldCardValue} attack, and has ${currentEnemy.attack} attack left`);
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