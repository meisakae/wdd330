const startButton = document.getElementById('startButton');

let timeLeft = 10;

startButton.addEventListener('click', () => {
    const intervalID = setInterval(() => {
        if (timeLeft >= 0) {
            countdownDisplay.textContent = timeLeft;
            timeLeft--;
        }
    }, 1000);

    setTimeout(() => {
        clearInterval(intervalID);
        countdownDisplay.textContent = "Time's up!";
    }, timeLeft * 1000);
});