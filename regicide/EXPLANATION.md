## Files

There are three files for the JavaScript game logic:
1. constants.js: Contains only contants and enums for the game logic.
2. logic.js: Contains all the game logic.
3. interface.js: Contains all the functions that interact with the UI.

## Contants
The containts.js contains a lot of constants and enums for the game logic. For example, the poker cards suits and ranks.
This file is necessary because it provides the foundation to the game logic to avoid magic numbers, etc.

## Game Logic
The logic.js contains all the game logic. There are several classes:
1. Game: Holds all the status and data of the game.
2. Target: Which is a generic abstract class for all the targets in the game, such as players and enemies.
3. Player: Which is a subclass of Target, and it holds all the data and status of the player.
4. Enemy: Which is a subclass of Target, and it holds all the data and status of the enemy.
5. Card: Which is a class that holds the data of a card, eg, whether it is flipped or not.

### Battlefield Mechanics and Game Flow Control

During initialization phase, the Game constructor sets all stats to a default value, and the game is ready to be started.

When player chooses a card, the card will be added to the battlefield using `addBattlefieldCard()`, or be removed using `removeBattlefieldCard()`. Player can also choose to `yieldBattlefield()`.

After player has chosen their card to play, `resolveBattlefield()` will be called and resolve all cards in the battlefield. This function includes a series of logic to determine the game status change:
1. If the attacker is the player, then resolve suit powers for all cards played. Only the cards with different suit from the enemy suit will be resolved with their power, which is the same as the game rule.
2. If the attacker is the enemy, then it will calculate the defend value for the player without resolve any suit power.
3. Once the suit powers are resolved, the attacker will deal the damage to the defender, and the defender will lose health.

After the battlefield is resolved, the game `concludeTurn()` and update the game status:
1. Discard all cards in the battlefield, because it is resolved and clear the battlefield for the next turn.
2. If the current enemy is already dead during the battlefield resolution, then the game will bring up the next enemy by `nextEnemy()`, and then switch the next attack to the next player.
3. If the current enemy is not dead, the enemy will attack back at the current player, so the game will `switchAttacker()`.
4. If any of the player is dead after resolution, the players lose the whole game and the game phase is set to `Phase.OVER`.
5. If all enemies are dead after resolution, the players win the game and the game phase is set to `Phase.OVER`.
6. If the next upcoming player to attack has no cards in hand, it means that the player cannot attack and also cannot defend, then the players lose as well, and the game phase is set to `Phase.OVER`.\

If the player don't want to attack, instead choose to yield, `yieldBattlefield()` will be called and update the game status:
1. The yield count is increased by 1.
2. If there is any card in the battlefield, return them to the player because those cards are not played to attack.
3. If every player has yielded, then the players lose the whole game and the game phase is set to `Phase.OVER`.

### Target, Player and Enemy

These three classes are also important for the game logic. The Player and Enemy are subclasses of Target, and they have their own unique properties and methods. For example, the Player has a `cards` property which is an array of cards, and the Enemy has a `attack` property shows the attack value of the enemy.

`Target` is a generic class for all the targets in the game, such as players and enemies. It has a `health` property, which is the health of the target, because both players and enemies have health. It also has a `name` property, which is the name of the target, because both players and enemies have names. It also has a `isDead()` method, which returns whether the target is dead or not. The `isDead()` method is used to determine whether the game is over or not. A target is dead when its `health`` reaches `0``.

`Player` is always only with `1` point of health, this is intentionally, because the rulebook states that whenever a player cannot defend an attack by the enemy, the players loses. By setting the health to only `1`, it makes the player dead when the player cannot defend an attack by the enemy, and by the `concludeTurn` logic from previous, the game will over when a player is dead.

`Enemy` has a `attack` property, which is the attack value of the enemy. The attack value is initialized by the suit type according to the table in the rulebook. The `attack` value can be decreased with suit power. 

### Card

The `Card` class is a class that holds the data of a card, eg, whether it is flipped or not. It has a `suit` property, which is the suit of the card, and it has a `rank` property, which is the rank of the card. 
The property `facing` can be either `Facing.UP` or `Facing.DOWN`. The `Facing.UP` means the card is facing up, and the `Facing.DOWN` means the card is facing down. The `facing` property is used to determine whether the card is flipped or not.
`attack` and `defend` properties are used to determine the attack and defend value of the card in the battlefield. The `attack` and `defend` properties are initialized by the suit type according to the table in the rulebook. 
The `attack` value is not necessarily always the same as `rank`. For example, when the enemy `Diamond King` is defeated, and the players draw the card at a later point, the players are allow to play that card, and it deals attack value `20` rather than its rank `13`, according to the rulebook.
The `defend` value is always the same as the **default** `attack` value, though `attack` value might be changed, eg, multiplied by 2 because of suit power.

## User Interface

The user interface hooks up the DOM with the game logic. It contains all the functions that interact with the UI. For example, the `refreshXXX()` functions update the UI according to the game status.

The interface file will add `onClick()` events to clickables, such as the cards in the player's hand, the cards in the battlefield, the `Yield` button, etc. When the user clicks on the clickables, the corresponding functions will be called to interact with the game logic.

The interface also monitors the game status, such as `Game.phase` and see if the game is over. If the game is over, the interface will show a popup accordingly.

