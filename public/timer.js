const Mousetrap = require('mousetrap');
const { dialog } = require('electron').remote;
const fs = require('fs');

document.addEventListener("DOMContentLoaded", () => {
    Mousetrap.bind('f1', () => {
        if (stopwatch === undefined) return;
        stopwatch.start();
    });

    Mousetrap.bind('f4', () => {
        if (stopwatch === undefined || document.getElementById('pauseTimer').disabled) return;
        stopwatch.stop();
    });
    
    Mousetrap.bind('f8', () => {
        if (stopwatch === undefined || document.getElementById('resetTimer').disabled) return;
        stopwatch.reset();
    });
});

var stopwatch, splitsFile;
const delay = ms => new Promise(res => setTimeout(res, ms));

class Stopwatch {
    constructor(display, file, path) {
        this.running = false;
        this.finished = false;
        this.display = display;
        this.splits = file;
        this.path = path;
        this.delay = this.splits.delay;
        this.currentSplits = [];
        this.currentSegments = [];
        this.reset();
        this.segment = 0;
    }
    
    reset() {
        if (this.running) this.running = false;
        this.times = [ 0, 0, 0, 0 ];
        this.segment = 0;
        this.finished = false;
        this.print(this.times);
        this.load(this.splits);
    }
    
    async start() {
        if (this.finished) return;
        if (this.times.every(t => t === 0)) await delay(this.delay);
        if (!this.time) this.time = performance.now();
        if (!this.running) {
            this.segment++;
            this.running = true;
            requestAnimationFrame(this.step.bind(this));
        } else {
            let times = this.times;
            // Set split time
            document.getElementById('split' + this.segment).innerText = this.format(times);
            // Get ms and store it
            const ms = this.arrayToMS(times);
            this.currentSplits.push(ms);
            // Get delta
            const pb = this.splits.splits[this.segment - 1].pb;
            const delta = pb === null ? '---' : ms <= pb ? '-' + this.format(this.msToArray(pb - ms)) : '+' + this.format(this.msToArray(ms - pb));
            document.getElementById('delta' + this.segment).innerText = delta;
            // Get time save
            const pbSeg = this.splits.splits[this.segment - 1].seg;
            let save;
            if (pbSeg === null) save = '---';
            else {
                const lastTime = this.segment === 1 ? 0 : this.currentSplits[this.segment - 2];
                const seg = ms - lastTime;
                this.currentSegments.push(seg);
                save = seg <= pbSeg ? '-' + this.format(this.msToArray(pbSeg - seg)) : '+' + this.format(this.msToArray(seg - pbSeg));
            }
            document.getElementById('save' + this.segment).innerText = save;
            if (this.segment === this.splits.splits.length) {
                this.finished = true;
                this.stop();
            }
            else this.segment++;
        }
    }
    
    stop() {
        this.running = false;
        this.time = null;
    }

    saveBest() {
        this.splits.splits.forEach((s, i) => s.best = this.currentSegments[i] < s.best || s.best === null ? this.currentSegments[i] : s.best);
    }

    savePB() {
        if (this.segment !== this.splits.splits.length) return;
        this.splits.splits.forEach((s, i) => {
            s.pb = this.currentSplits[i];
            s.seg = this.currentSegments[i];
            if (s.seg < s.best || s.best === null) s.best = s.seg;
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
        if (this.splits.splits.length !== 0) {
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
                const splitColContent = split.pb === null ? '---' : this.format(this.msToArray(split.pb));
                splitCol.innerHTML += `<br><span id="split` + count + `">` + splitColContent + `</span>`;
                const saveColContent = split.seg === null ? '&nbsp;' : this.format(this.msToArray(split.seg - split.best));
                saveCol.innerHTML += `<br><span id="save` + count + `">` + saveColContent + `</span>`;
            });
            }
        const racetime = document.getElementById('racetime');
        racetime.style.top = (10 + parseFloat(getComputedStyle(document.getElementById('splits')).top) + parseFloat(getComputedStyle(split).height)) + 'px';
        racetime.style.height = (parseFloat(getComputedStyle(document.getElementById('nincid')).top) - parseFloat(getComputedStyle(racetime).top) - 10) + 'px';
    }

    export() {
        if (this.running) return;
        fs.writeFileSync(this.path, JSON.stringify(this.splits));
        alert('Saved splits at ' + this.path);
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

const importSplits = () => {
    const path = dialog.showOpenDialogSync({
        "title": "Select JSON File",
        "properties": [
            "openFile"
        ],
        "filters": [
            { "name": "JavaScript Object Notation", "extensions": ['json']}
        ]
    })[0];
    if (!fs.existsSync(path)) {
        dialog.showErrorBox("Error Loading Splits", "Can not find " + path);
        return;
    }
    const raw = fs.readFileSync(path);
    stopwatch = new Stopwatch(
        document.getElementById('timer'),
        JSON.parse(raw),
        path
    );
}