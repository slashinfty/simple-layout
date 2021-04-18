const skins = require('./skins.js');

// For setting CSS variables
const root = document.documentElement;

// Console specific DOM settings
const set = {
    "sgb2": {
        "timer": {
            "minutes": '9.2em',
            "hours": '7em',
            "height": 160
        },
        "twitch": {
            "font": '1.8em'
        },
        "racetime": {
            "font": '1.4em'
        },
        "nincid": {
            "scale": 472 / 1080
        },
        "gamefeed": {
            "height": 700,
            "width": 778
        }
    },
    "nes": {
        "timer": {
            "minutes": '9.2em',
            "hours": '7em',
            "height": 160
        },
        "twitch": {
            "font": '1.8em'
        },
        "racetime": {
            "font": '1.4em'
        },
        "nincid": {
            "scale": 450 / 1080
        },
        "gamefeed": {
            "height": 700,
            "width": 800
        }
    },
    "snes": {
        "timer": {
            "minutes": '9.2em',
            "hours": '7em',
            "height": 160
        },
        "twitch": {
            "font": '1.8em'
        },
        "racetime": {
            "font": '1.4em'
        },
        "nincid": {
             "scale": 450 / 981
        },
        "gamefeed": {
            "height": 700,
            "width": 800
        }
    },
    "n64": {
        "timer": {
            "minutes": '6.6em',
            "hours": '5em',
            "height": 130
        },
        "twitch": {
            "font": '1.3em'
        },
        "racetime": {
            "font": '0.9em'
        },
        "nincid": {
            "scale": 317 / 981
        },
        "gamefeed": {
            "height": 700,
            "width": 933
        }
    },
    "gcn": {
        "timer": {
            "minutes": '6.6em',
            "hours": '5em',
            "height": 130
        },
        "twitch": {
            "font": '1.3em'
        },
        "racetime": {
            "font": '0.9em'
        },
        "nincid": {
             "scale": 317 / 981
        },
        "gamefeed": {
            "height": 700,
            "width": 933
        }
    }
};

const raceMode = () => {
    if (document.getElementById('race-mode').checked) {
        document.getElementById('background').style.backgroundImage = 'none';
        document.getElementById('timer').style.color = 'rgb(255, 255, 255)';
        document.getElementById('timer').style.textShadow = 'none';
        document.getElementById('info').style.display = 'none';
        document.getElementById('nincid').style.display = 'none';
        document.getElementById('racetime').style.color = 'rgb(255, 255, 255)';
        document.getElementById('racetime').style.textShadow = 'none';
    } else {
        document.getElementById('background').style.background = "url('../static/background.jpg')";
        document.getElementById('timer').style.color = 'rgba(106, 106, 106, 0.65)';
        document.getElementById('timer').style.textShadow = '5px 5px 15px rgba(0, 0, 0, 0.75)';
        document.getElementById('info').style.display = 'block';
        document.getElementById('nincid').style.display = 'block';
        document.getElementById('racetime').style.color = 'rgba(106, 106, 106, 0.7)';
        document.getElementById('racetime').style.textShadow = '2px 2px 7px rgba(0, 0, 0, 0.55)';
    }
}

// Setting up the layout
const setLayout = async (console = null) => {
    if (console === null) console = document.getElementById('consoles').value;
    // Clearing everything out
    const allDivs = [...document.querySelectorAll('div:not(.keep)')];
    allDivs.forEach(d => d.innerHTML = d.id !== 'timer' ? '' : '00:00');
    document.getElementById('background').style.display = 'block';
    
    // Placing game feed red block
    const gamefeed = document.getElementById('gamefeed');
    gamefeed.style.height = set[console].gamefeed.height + 'px';
    gamefeed.style.width = set[console].gamefeed.width + 'px';
    gamefeed.style.left = (1270 - set[console].gamefeed.width) + 'px';
    
    // Controller input display
    const nincid = document.getElementById('nincid');
    const scaleFactor = set[console].nincid.scale;
    root.style.setProperty('--scale-factor', scaleFactor);
    const skinobject = skins[console];
    nincid.style.height = (skinobject.height * scaleFactor) + 'px';
    root.style.setProperty('--left-width', (skinobject.width * scaleFactor) + 'px')
    const backPath = upath.toUnix(upath.join(__dirname, "../static/skins/", console, '/'));
    const backElement = document.createElement('img');
    backElement.setAttribute('src', backPath + 'back.png');
    nincid.appendChild(backElement);
    const buttons = new DocumentFragment();
    skinobject.buttons.forEach(button => {
        const buttonElement = document.createElement('img');
        const buttonID = button.name;
        buttonElement.setAttribute('id', buttonID);
        buttonElement.setAttribute('src', backPath + button.image);
        const dim = button.hasOwnProperty('width') ? 'height:' + (button.height) + 'px;width:' + (button.width) + 'px;' : '';
        const vis = button.hasOwnProperty('range') ? 'visibility:visible;' : 'visibility:hidden;';
        buttonElement.setAttribute('style', 'left:' + (button.x * scaleFactor) + 'px;top:' + (button.y * scaleFactor) + 'px;' + vis + dim);
        buttons.appendChild(buttonElement);
    });
    nincid.appendChild(buttons);
    
    // Timer
    const timer = document.getElementById('timer');
    timer.style.height = set[console].timer.height + 'px';
    timer.style.lineHeight = getComputedStyle(timer).height;
    timer.style.fontSize = set[console].timer.minutes;

    // Info
    const info = document.getElementById('info');
    info.style.top = (10 + parseFloat(getComputedStyle(timer).height)) + 'px';
    
    // Twitch
    const twitch = document.getElementById('twitch');
    twitch.style.height = (680 - (parseFloat(getComputedStyle(nincid).height) + parseFloat(getComputedStyle(timer).height) + parseFloat(getComputedStyle(info).height))) + 'px';
    twitch.style.fontSize = set[console].twitch.font;

    // Racetime
    const racetime = document.getElementById('racetime');
    racetime.style.height = (680 - (parseFloat(getComputedStyle(nincid).height) + parseFloat(getComputedStyle(timer).height) + parseFloat(getComputedStyle(info).height))) + 'px';
    racetime.style.fontSize = set[console].racetime.font;
};