const iso = require('iso8601-duration');
const fetch = require('node-fetch');
const schedule = require('node-schedule');
const WebSocket = require('ws');
var currentRace;

class RaceRoom {
    constructor (raceName, wsURL) {
        this.name = raceName;
        this.connection = new WebSocket(wsURL);
        this.started = false;
        const room = this;

        this.connection.onopen = function() {
            console.log('connected to ' + room.name);
        }

        this.connection.onmessage = function(obj) {
            const data = JSON.parse(obj.data);
            if (data.type === 'error') {
                data.errors.forEach(e => console.error(e));
                return;
            }
            if (data.type === 'race.data') {
                console.log(data.race.status.value + ' --- ' + data.race.started_at);
                if (data.race.status.value === 'in_progress' || data.race.status.value === 'pending') {
                    if (!this.started) {
                        this.started = true;
                        const start = new Date(data.race.started_at);
                        const job = schedule.scheduleJob(start, () => stopwatch.start());
                    }
                } else if (data.race.status.value === 'finished' || data.race.status.value === 'cancelled') {
                    stopwatch.stop();
                    return;
                }
                let leftInfo = '';
                let rightInfo = '';
                for (let i = 0; i < Math.min(data.race.entrants.length, 9); i++) {
                    const e = data.race.entrants[i];
                    let racerName = i === 0 ? e.user.name : '<br />' + e.user.name;
                    let racerProgress = i === 0 ? '' : '<br />';
                    switch (e.status.value) {
                        case 'ready':
                            racerProgress += 'Ready';
                            break;
                        case 'not_ready':
                            racerProgress += 'Not Ready';
                            break;
                        case 'in_progress':
                            racerProgress += 'In Progress';
                            break;
                        case 'dnf':
                            racerProgress += 'DNF';
                            break;
                        case 'done':
                            racerProgress += room.convert(iso.toSeconds(iso.parse(e.finish_time))) + ' (' + room.suffix(e.place) + ')';
                            break;
                        case 'invited':
                            racerProgress += 'Invited';
                            break;
                        case 'requested':
                            racerProgress += 'Requested';
                            break;
                        default:
                            racerProgress += 'N/A';
                            break;
                    }
                    leftInfo += racerName;
                    rightInfo += racerProgress;
                }
                document.getElementById('left-rtgg').innerHTML = leftInfo;
                document.getElementById('right-rtgg').innerHTML = rightInfo;
                const self = data.race.entrants.find(e => e.user.name === 'slashinfty');
                if (self === undefined) return;
                if (self.status.value === 'done' && stopwatch.running) stopwatch.start();
            }
        }

        this.close = function() {
            document.getElementById('left-rtgg').innerHTML = '';
            document.getElementById('right-rtgg').innerHTML = '';
            room.connection.close();
        }
    }
    convert(time) {
        let hr, min, sec, ms;
        let parts = time.toString().split('.');
        ms = parts.length > 1 ? parseInt((parts[1] + '00').substr(0,3)) : undefined;
        sec = parseInt(parts[0]);
        if (sec >= 60) {min = Math.floor(sec / 60); sec = ('0' + (sec % 60)).substr(-2, 2);}
        if (min >= 60) {hr = Math.floor(min / 60); min = ('0' + (min % 60)).substr(-2, 2);}
        if (ms !== undefined) ms = ('00' + ms).substr(-3, 3);
        if (min === undefined) return ms === undefined ? '0:' + sec.toString() : '0:' + sec.toString() + '.' + ms.toString();
        else if (hr === undefined) return ms === undefined ? min.toString() + ':' + sec.toString() : min.toString() + ':' + sec.toString() + '.' + ms.toString();
        else return ms === undefined ? hr.toString() + ':' + min.toString() + ':' + sec.toString() : hr.toString() + ':' + min.toString() + ':' + sec.toString() + '.' + ms.toString();
    }

    suffix(i) {
        let j = i % 10, k = i % 100;
        return j === 1 && k !== 11 ? i + 'st' : j === 2 && k !== 12 ? i + 'nd' : j === 3 && k !== 13 ? i + 'rd' : i + 'th';
    };

    updateTime(time) {
        const timerElement = document.getElementById("timer");
        let seconds = Math.floor((new Date(Date.now()) - new Date(time)) / 1000);
        if (seconds >= 3600) {
            timerElement.style.height = set[document.getElementById('consoles').value].timer.height + 'px';
            timerElement.style.lineHeight = getComputedStyle(timer).height;
            timerElement.style.fontSize = set[document.getElementById('consoles').value].timer.hours;
            timerElement.innerHTML = Math.floor(seconds / 3600) + ':' + ('0' + Math.floor((seconds % 3600) / 60)).slice(-2) + ':' + ('0' + (seconds % 60)).slice(-2);
        } else if (seconds >= 0) timerElement.innerHTML = ('0' + Math.floor(seconds / 60)).slice(-2) + ':' + ('0' + (seconds % 60)).slice(-2);
        else timerElement.innerHTML = '00:00';
    }
}

const getRace = async () => {
    const racetime = document.getElementById('racetime');
    racetime.style.top = (10 + parseFloat(getComputedStyle(document.getElementById('splits')).top) + parseFloat(getComputedStyle(document.getElementById('split')).height)) + 'px';
    racetime.style.height = (parseFloat(getComputedStyle(document.getElementById('nincid')).top) - parseFloat(getComputedStyle(racetime).top) - 10) + 'px';
    const raceSearch = await fetch ('https://racetime.gg/' + document.getElementById('race').value + '/data');
    try {
        const race = await raceSearch.json();
        currentRace = new RaceRoom(race.name, new URL(race.websocket_url, 'wss://racetime.gg'));
    } catch (err) {
        console.error(err);
        return;
    }
    document.getElementById('pauseTimer').disabled = true;
    document.getElementById('resetTimer').disabled = true;
}

const closeRace = async () => {
    document.getElementById('pauseTimer').disabled = false;
    document.getElementById('resetTimer').disabled = false;
    if (currentRace !== undefined) {
        currentRace.close();
        currentRace = undefined;
    }
}