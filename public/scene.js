const upath = require('upath');
const skins = require('./skins.js');

// For setting CSS variables
const root = document.documentElement;

// chosenConsole specific DOM settings
const set = {
    "sgb2": {
        "timer": {
            "size": '4.6em',
            "height": 100
        },
        "camera": {
            "width": 114
        },
        "racetime": {
            "font": '1.2em'
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
            "size": '4.2em',
            "height": 100
        },
        "camera": {
            "width": 114
        },
        "racetime": {
            "font": '1em'
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
            "size": '4.2em',
            "height": 100
        },
        "camera": {
            "width": 114
        },
        "racetime": {
            "font": '1em'
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
            "size": '3em',
            "height": 75
        },
        "camera": {
            "width": 86
        },
        "racetime": {
            "font": '0.8em'
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
            "size": '3em',
            "height": 75
        },
        "camera": {
            "width": 86
        },
        "racetime": {
            "font": '0.8em'
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

// Setting up the layout
const setLayout = (chosenConsole = null) => {
    if (chosenConsole === null) chosenConsole = document.getElementById('consoles').value;
    // Clearing everything out
    const allDivs = [...document.querySelectorAll('div:not(.keep)')];
    allDivs.forEach(d => d.innerHTML =  d.id !== 'timer' ? '' : '0.0');
    document.getElementById('background').style.display = 'block';
    
    // Placing game feed red block
    const gamefeed = document.getElementById('gamefeed');
    gamefeed.style.height = set[chosenConsole].gamefeed.height + 'px';
    gamefeed.style.width = set[chosenConsole].gamefeed.width + 'px';
    gamefeed.style.left = (1270 - set[chosenConsole].gamefeed.width) + 'px';
    
    // Controller input display
    const nincid = document.getElementById('nincid');
    const scaleFactor = set[chosenConsole].nincid.scale;
    root.style.setProperty('--scale-factor', scaleFactor);
    const skinobject = skins[chosenConsole];
    nincid.style.height = (skinobject.height * scaleFactor) + 'px';
    root.style.setProperty('--left-width', (skinobject.width * scaleFactor) + 'px')
    const backPath = upath.toUnix(upath.join(__dirname, "../static/skins/", chosenConsole, '/'));
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

    // Camera
    const camera = document.getElementById('camera');
    camera.style.width = set[chosenConsole].camera.width + 'px';

    // Timer
    const timer = document.getElementById('timer');
    timer.style.fontSize = set[chosenConsole].timer.size;
    timer.style.height = set[chosenConsole].timer.height + 'px';
    timer.style.lineHeight = getComputedStyle(timer).height;
    timer.style.left = (20 + set[chosenConsole].camera.width) + 'px';
    timer.style.maxWidth = (1240 - parseFloat(getComputedStyle(camera).width) - parseFloat(getComputedStyle(gamefeed).width)) + 'px';
    timer.style.width = getComputedStyle(timer).maxWidth;

    stopwatch = new Stopwatch(
        document.getElementById('timer'),
        {
            "name": "",
            "delay": 0,
            "splits": []
        }
    );

    // More camera
    camera.style.height = getComputedStyle(timer).height;

    // Racetime
    const racetime = document.getElementById('racetime');
    racetime.style.fontSize = set[chosenConsole].racetime.font;

    // Splits
    const splits = document.getElementById('splits');
    splits.style.fontSize = getComputedStyle(racetime).fontSize;
    splits.style.top = (20 + parseFloat(getComputedStyle(timer).height)) + 'px';
};