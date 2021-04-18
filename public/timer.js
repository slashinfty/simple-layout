const Mousetrap = require('mousetrap');

let startTime, updatedTime, difference, tInterval, savedTime;
let paused = 0;
let running = 0;

// Set up hotkeys
document.addEventListener("DOMContentLoaded", () => {
    Mousetrap.bind('\\', () => {
        if (document.querySelector('input[name="middlebox"]:checked').value === 'racetime') return;
        if (!running){
            startTime = new Date().getTime();
            tInterval = setInterval(getShowTime, 1000);
            paused = 0;
            running = 1;
        } else if (!paused) {
            clearInterval(tInterval);
            savedTime = difference;
            paused = 1;
            running = 0;
        }
    }, 'keyup');
    
    Mousetrap.bind('`', () => {
        if (document.querySelector('input[name="middlebox"]:checked').value === 'racetime') return;
        reset();
    }, 'keyup');
});

// Start the timer
const start = () => {
    if (!running) {
        startTime = new Date().getTime();
        tInterval = setInterval(getShowTime, 1000);
        paused = 0;
        running = 1;
    }
};

// Pause the timer
const pause = () => {
    if (!difference) {}
    else if (!paused) {
        clearInterval(tInterval);
        savedTime = difference;
        paused = 1;
        running = 0;
    } else {
    start();
    }
};

// Reset the timer
const reset = () => {
    clearInterval(tInterval);
    savedTime = 0;
    difference = 0;
    paused = 0;
    running = 0;
    const timer = document.getElementById('timer');
    timer.style.height = set[document.getElementById('consoles').value].timer.height + 'px';
    timer.style.lineHeight = getComputedStyle(timer).height;
    timer.style.fontSize = set[document.getElementById('consoles').value].timer.minutes;
    timer.innerHTML = '00:00'
};

// Display time
const getShowTime = () => {
    updatedTime = new Date().getTime();
    if (savedTime) difference = (updatedTime - startTime) + savedTime;
    else difference =  updatedTime - startTime;
    var seconds = Math.floor(difference / 1000);
    let time;
    if (seconds >= 3600) {
        const timer = document.getElementById('timer');
        timer.style.height = set[document.getElementById('consoles').value].timer.height + 'px';
        timer.style.lineHeight = getComputedStyle(timer).height;
        timer.style.fontSize = set[document.getElementById('consoles').value].timer.hours;
        time = Math.floor(seconds / 3600) + ':' + ('0' + Math.floor((seconds % 3600) / 60)).slice(-2) + ':' + ('0' + (seconds % 60)).slice(-2);
    } else {
        time = ('0' + Math.floor(seconds / 60)).slice(-2) + ':' + ('0' + (seconds % 60)).slice(-2);
    }
    document.getElementById("timer").innerHTML = time;
}