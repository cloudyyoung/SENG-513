
const jester_1 = document.createElement("div");
const jester_2 = document.createElement("div");
jester_1.classList.add("card");
jester_1.classList.add("jester");
jester_2.classList.add("card");
jester_2.classList.add("jester");

document.querySelector(".jesters").appendChild(jester_1);
document.querySelector(".jesters").appendChild(jester_2);

SUITES = ["hearts", "diamonds", "clubs", "spades"];
ENEMIES = ["j", "k", "q"];

