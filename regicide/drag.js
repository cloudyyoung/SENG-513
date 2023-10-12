
const cards = document.querySelectorAll(".card");


let isDragging = false;
let offsetX, offsetY;

cards.forEach(card => {
    card.addEventListener("mousedown", (event) => {
        event.preventDefault();

        console.log("mousedown");
        isDragging = true;

        // Calculate the offset between the mouse pointer and the div's top-left corner
        offsetX = event.clientX - card.getBoundingClientRect().left;
        offsetY = event.clientY - card.getBoundingClientRect().top;
    });

    card.addEventListener('mousemove', function (event) {
        if (isDragging) {
            // Calculate the new position for the div
            let left = event.clientX - offsetX;
            let top = event.clientY - offsetY;

            // Set the new position for the div
            card.style.left = left + 'px';
            card.style.top = top + 'px';
            card.style.position = 'fixed';
        }
    });

    document.addEventListener('mouseup', function () {
        isDragging = false; // Stop the dragging
    });
});