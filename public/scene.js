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
            "size": '4.2em',
            "height": 100
        },
        "camera": {
            "width": 114
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
            "size": '4.2em',
            "height": 100
        },
        "camera": {
            "width": 114
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
            "size": '3em',
            "height": 75
        },
        "camera": {
            "width": 86
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
            "size": '3em',
            "height": 75
        },
        "camera": {
            "width": 86
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
        document.getElementById('nincid').style.display = 'none';
        document.getElementById('racetime').style.color = 'rgb(255, 255, 255)';
        document.getElementById('racetime').style.textShadow = 'none';
    } else {
        document.getElementById('background').style.background = "url('../static/background.jpg')";
        document.getElementById('timer').style.color = 'rgba(106, 106, 106, 0.65)';
        document.getElementById('timer').style.textShadow = '5px 5px 15px rgba(0, 0, 0, 0.75)';
        document.getElementById('nincid').style.display = 'block';
        document.getElementById('racetime').style.color = 'rgba(106, 106, 106, 0.7)';
        document.getElementById('racetime').style.textShadow = '2px 2px 7px rgba(0, 0, 0, 0.55)';
    }
}

// Setting up the layout
const setLayout = (chosenConsole = null) => {
    if (chosenConsole === null) chosenConsole = document.getElementById('consoles').value;
    // Clearing everything out
    const allDivs = [...document.querySelectorAll('div:not(.keep)')];
    allDivs.forEach(d => {
        d.innerHTML = d.id !== 'timer' ? '' : '1:23:45.6'
    });
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

    // More camera
    camera.style.height = getComputedStyle(timer).height;
    
    stopwatch = new Stopwatch(
        document.getElementById('timer'),
        {
            "name": "SMW - No Starworld",
            "delay": 2200,
            "splits": [
                {
                    "name": "Iggy",
                    "pb": 193932,
                    "seg": 193932,
                    "best": 193265
                },
                {
                    "name": "Morton",
                    "pb": 518597,
                    "seg": 324665,
                    "best": 308781
                },
                {
                    "name": "Ludwig",
                    "pb": 1014955,
                    "seg": 496358,
                    "best": 493981
                },
                {
                    "name": "Roy",
                    "pb": 1290261,
                    "seg": 275306,
                    "best": 257712
                },
                {
                    "name": "Wendy",
                    "pb": 1698370,
                    "seg": 408109,
                    "best": 408109
                },
                {
                    "name": "Bowser",
                    "pb": 2305276,
                    "seg": 606906,
                    "best": 568239
                }
            ]
        }
    );

    // Racetime
    const racetime = document.getElementById('racetime');
    racetime.style.height = (680 - (parseFloat(getComputedStyle(nincid).height) + parseFloat(getComputedStyle(timer).height))) + 'px';
    racetime.style.fontSize = set[chosenConsole].racetime.font;
};