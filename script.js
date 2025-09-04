let startTime;
let updatedTime;
let difference;
let tInterval;
let running = false;
let paused = false;
let timePaused = 0;
let currentStyle = 'simple';
let timeLapseFactor = 1;
let lapNumber = 0;
let previousLapTime = 0;

const optionsScreen = document.getElementById('options-screen');
const stopwatchScreen = document.getElementById('stopwatch-container');
const startPauseBtn = document.getElementById('startPauseBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const backBtn = document.getElementById('backBtn');
const lapsList = document.getElementById('lapsList');
const styleOptions = document.querySelectorAll('.style-option');
const timeLapseButtons = document.querySelectorAll('.time-lapse-btn');

const simpleStopwatch = document.getElementById('simple-stopwatch');
const flipStopwatch = document.getElementById('flip-stopwatch');
const fancyStopwatch = document.getElementById('fancy-stopwatch');

const simpleDisplay = simpleStopwatch.querySelector('.timer-display');
const flipMinutesGroup = document.getElementById('minutes-flip');
const flipSecondsGroup = document.getElementById('seconds-flip');
const fancyGroups = fancyStopwatch.querySelectorAll('.fancy-group');

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function selectStopwatchStyle(style) {
    currentStyle = style;
    document.querySelectorAll('.stopwatch-style').forEach(s => {
        s.style.display = 'none';
    });
    document.getElementById(`${style}-stopwatch`).style.display = 'block';
    showScreen('stopwatch-container');
    resetStopwatch();
}

styleOptions.forEach(button => {
    button.addEventListener('click', () => {
        const style = button.getAttribute('data-style');
        selectStopwatchStyle(style);
    });
});

backBtn.addEventListener('click', () => {
    resetStopwatch();
    showScreen('options-screen');
});

timeLapseButtons.forEach(button => {
    button.addEventListener('click', () => {
        timeLapseButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        timeLapseFactor = parseInt(button.getAttribute('data-lapse-duration'));
        if (running) {
            clearInterval(tInterval);
            startStopwatch();
        }
    });
});

lapBtn.addEventListener('click', recordLap);

function startStopwatch() {
    if (!running) {
        if (!paused) {
            startTime = new Date().getTime();
            lapBtn.style.display = 'inline-block';
            lapsList.style.display = 'block';
        } else {
            startTime = new Date().getTime() - timePaused;
        }
        
        tInterval = setInterval(updateTimer, 1000 / timeLapseFactor); 
        startPauseBtn.textContent = 'Pause';
        startPauseBtn.classList.add('pause');
        running = true;
        paused = false;
    } else {
        clearInterval(tInterval);
        timePaused = new Date().getTime() - startTime;
        startPauseBtn.textContent = 'Start';
        startPauseBtn.classList.remove('pause');
        running = false;
        paused = true;
    }
}

function resetStopwatch() {
    clearInterval(tInterval);
    running = false;
    paused = false;
    startTime = 0;
    timePaused = 0;
    lapNumber = 0;
    previousLapTime = 0;
    lapsList.innerHTML = '';
    startPauseBtn.textContent = 'Start';
    startPauseBtn.classList.remove('pause');
    lapBtn.style.display = 'none';
    lapsList.style.display = 'none';
    updateDisplay('00:00:00');
}

function updateTimer() {
    updatedTime = new Date().getTime();
    difference = (updatedTime - startTime) * timeLapseFactor;

    let hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    
    const timeString = `${hours}:${minutes}:${seconds}`;
    updateDisplay(timeString);
}

function recordLap() {
    if (running) {
        lapNumber++;
        const currentLapTime = difference;
        const lapDuration = currentLapTime - previousLapTime;

        const formattedLapDuration = formatTime(lapDuration);
        const formattedTotalTime = formatTime(currentLapTime);

        const lapItem = document.createElement('li');
        lapItem.innerHTML = `<span>Lap ${lapNumber}</span><span>${formattedLapDuration}</span><span>${formattedTotalTime}</span>`;
        lapsList.appendChild(lapItem);

        previousLapTime = currentLapTime;
    }
}

function formatTime(ms) {
    let hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((ms % (1000 * 60)) / 1000);

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return `${hours}:${minutes}:${seconds}`;
}

function updateDisplay(timeString) {
    const [hours, minutes, seconds] = timeString.split(':');
    
    if (currentStyle === 'simple') {
        simpleDisplay.textContent = timeString;
    } else if (currentStyle === 'flip') {
        updateFlipDigits(flipMinutesGroup, minutes);
        updateFlipDigits(flipSecondsGroup, seconds);
    } else if (currentStyle === 'fancy') {
        updateFancyDigits(fancyGroups[0].querySelectorAll('.fancy-digit'), hours);
        updateFancyDigits(fancyGroups[1].querySelectorAll('.fancy-digit'), minutes);
        updateFancyDigits(fancyGroups[2].querySelectorAll('.fancy-digit'), seconds);
    }
}

function updateFlipDigits(groupElement, value) {
    const containers = groupElement.querySelectorAll('.digit-container');
    const newValue = value.toString();

    containers.forEach((container, index) => {
        const card = container.querySelector('.card');
        const front = container.querySelector('.front');
        const back = container.querySelector('.back');
        
        const newDigit = newValue.charAt(index);
        const currentDigit = front.textContent;

        if (currentDigit !== newDigit) {
            card.classList.add('flipped');
            back.textContent = newDigit;
            
            setTimeout(() => {
                front.textContent = newDigit;
                card.classList.remove('flipped');
            }, 600);
        }
    });
}

function updateFancyDigits(digitElements, value) {
    const newDigits = value.toString();

    if (digitElements[0].textContent !== newDigits[0]) {
        updateSingleFancyDigit(digitElements[0], newDigits[0]);
    }
    
    if (digitElements[1].textContent !== newDigits[1]) {
        updateSingleFancyDigit(digitElements[1], newDigits[1]);
    }
}

function updateSingleFancyDigit(element, newDigit) {
    element.classList.add('animate');
    setTimeout(() => {
        element.textContent = newDigit;
        element.classList.remove('animate');
    }, 500);
}

startPauseBtn.addEventListener('click', startStopwatch);
resetBtn.addEventListener('click', resetStopwatch);