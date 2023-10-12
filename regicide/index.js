
const jester_1 = document.createElement("div");
const jester_2 = document.createElement("div");
jester_1.classList.add("card");
jester_1.classList.add("jester");
jester_2.classList.add("card");
jester_2.classList.add("jester");

document.querySelector(".jesters").appendChild(jester_1);
document.querySelector(".jesters").appendChild(jester_2);

SUITES = ["heart", "diamond", "club", "spade"];
ENEMIES = ["j", "k", "q"];

SUITES.forEach(suite => {
    ENEMIES.forEach(enemy => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.classList.add(suite);
        card.classList.add(enemy);
        card.classList.add("hide");
        document.querySelector(".castle").appendChild(card);
    });
});

HANDS = ["a", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
HANDS.forEach(hand => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.classList.add("hand");
    card.classList.add(hand);
    card.classList.add("hide");
    document.querySelector(".cards").appendChild(card);
});