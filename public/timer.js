const Mousetrap = require('mousetrap');
/*
let startTime, updatedTime, difference, tInterval, savedTime;
let paused = 0;
let running = 0;
*/

/*
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
*/
var stopwatch;
const delay = ms => new Promise(res => setTimeout(res, ms));

class Stopwatch {
    constructor(display, file) {
        this.running = false;
        this.display = display;
        this.splits = file;
        this.delay = this.splits.delay;
        this.currentSplits = [];
        this.currentSegments = [];
        this.reset();
        this.segment = 0;
    }
    
    reset() {
        if (this.running) !this.running;
        this.times = [ 0, 0, 0, 0 ];
        this.segment = 0;
        this.print(this.times);
        this.load(this.splits);
    }
    
    async start() {
        if (this.times.every(t => t === 0)) await delay(this.delay);
        if (!this.time) this.time = performance.now();
        if (!this.running) {
            this.segment++;
            this.running = true;
            requestAnimationFrame(this.step.bind(this));
        }
    }
    
    split() {
        let times = this.times;
        // Set split time
        document.getElementById('split' + this.segment).innerText = this.format(times);
        // Get ms and store it
        const ms = this.arrayToMS(times);
        this.currentSplits.push(ms);
        // Get delta
        const pb = this.splits.splits[this.segment - 1].pb;
        const delta = ms <= pb ? pb - ms : ms - pb;
        document.getElementById('delta' + this.segment).innerText = ms <= pb ? '-' + this.format(this.msToArray(delta)) : '+' + this.format(this.msToArray(delta));
        // Get time save
        const pbSeg = this.splits.splits[this.segment - 1].seg;
        const lastTime = this.segment === 1 ? 0 : this.currentSplits[this.segment - 2];
        const seg = ms - lastTime;
        this.currentSegments.push(seg);
        const save = seg <= pbSeg ? pbSeg - seg : seg - pbSeg;
        document.getElementById('save' + this.segment).innerText = seg <= pbSeg ? '-' + this.format(this.msToArray(save)) : '+' + this.format(this.msToArray(save));
        if (this.segment === this.splits.splits.length) this.stop();
        else this.segment++;
    }
    
    stop() {
        this.running = false;
        this.time = null;
    }

    saveBest() {
        this.splits.splits.forEach((s, i) => s.best = this.currentSegments[i] < s.best ? this.currentSegments[i] : s.best);
    }

    savePB() {
        if (this.segment !== this.splits.splits.length) return;
        console.log(this.currentSegments);
        this.splits.splits.forEach((s, i) => {
            s.pb = this.currentSplits[i];
            s.seg = this.currentSegments[i];
            if (s.seg < s.best) s.best = s.seg;
        });
    }
    
    step(timestamp) {
        if (!this.running) return;
        this.calculate(timestamp);
        this.time = timestamp;
        this.print();
        requestAnimationFrame(this.step.bind(this));
    }
    
    calculate(timestamp) {
        var diff = timestamp - this.time;
        // Hundredths of a second are 100 ms
        this.times[3] += diff / 100;
        // Seconds are 100 hundredths of a second
        if (this.times[3] >= 10) {
            this.times[2] += 1;
            this.times[3] -= 10;
        }
        // Minutes are 60 seconds
        if (this.times[2] >= 60) {
            this.times[1] += 1;
            this.times[2] -= 60;
        }
        // Hours are 60 minutes
        if (this.times[1] >= 60) {
            this.times[0] += 1;
            this.times[1] -= 60;
        }
    }

    load() {
        const nameCol = document.getElementById('name');
        const deltaCol = document.getElementById('delta');
        const splitCol = document.getElementById('split');
        const saveCol = document.getElementById('save');
        nameCol.innerHTML = this.splits.name;
        deltaCol.innerHTML = 'Delta';
        splitCol.innerHTML = 'Split';
        saveCol.innerHTML = 'Save';
        this.splits.splits.forEach((split, index) => {
            const count = index + 1;
            nameCol.innerHTML += `<br><span id="name` + count + `">` + split.name + `</span>`;
            deltaCol.innerHTML += `<br><span id="delta` + count + `">&nbsp;</span>`;
            splitCol.innerHTML += `<br><span id="split` + count + `">` + this.format(this.msToArray(split.pb)) + `</span>`;
            saveCol.innerHTML += `<br><span id="save` + count + `">` + this.format(this.msToArray(split.seg - split.best)) + `</span>`;
        });
        const racetime = document.getElementById('racetime');
        racetime.style.top = (10 + parseFloat(getComputedStyle(document.getElementById('splits')).top) + parseFloat(getComputedStyle(split).height)) + 'px';
        racetime.style.height = (parseFloat(getComputedStyle(document.getElementById('nincid')).top) - parseFloat(getComputedStyle(racetime).top) - 10) + 'px';
    }

    export() {
        if (this.running) return;
        const blob = new Blob([JSON.stringify(this.splits)], {type: 'application/json'});
        const saveAs = window.saveAs;
        saveAs(blob, 'splits.json');
    }

    msToArray(perf) {
        const arr = [ 0, 0, 0, 0 ];
        const parts = (perf / 1000).toString().split('.');
        if (parts.length > 1) arr[3] = Math.round(parseInt((parts[1] + '0000').substr(0, 3))) / 100;
        arr[2] = parseInt(parts[0]);
        if (arr[2] >= 60) {
            arr[1] = Math.floor(arr[2] / 60);
            arr[2] = arr[2] % 60;
        }
        if (arr[1] >= 60) {
            arr[0] = Math.floor(arr[1] / 60);
            arr[1] = arr[1] % 60;
        }
        return arr;
    }

    arrayToMS(arr) {
        return Math.round((arr[3] * 100 + arr[2] * 1000 + arr[1] * 60000 + arr[0] * 3600000) * 1000) / 1000;
    }
    
    print() {
        this.display.innerText = this.format(this.times);
    }
    
    format(times) {
        if (times[0] > 0) {
            return `${times[0]}:${this.pad0(times[1], 2)}:${this.pad0(times[2], 2)}.${Math.floor(times[3])}`
        } else if (times[1] > 0) {
            return `${times[1]}:${this.pad0(times[2], 2)}.${Math.floor(times[3])}`
        } else if (times[2] > 0) {
            return `${times[2]}.${Math.floor(times[3])}`;
        } else {
            return `0.${Math.floor(times[3])}`;
        }
    }

    pad0 = (value, count) => {
        var result = value.toString();
        for (; result.length < count; --count)
            result = '0' + result;
        return result;
    }
}

/*
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
*/