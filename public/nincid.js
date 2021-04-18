const SerialPort = require('serialport');
const ByteLength = require('@serialport/parser-byte-length');

var port;

// Open a new port
const loadPort = () => {
    if (port !== undefined) port.close();
    if (document.getElementById('port-select').value !== '') {
        port = new SerialPort(document.getElementById('port-select').value, { baudRate: 115200 });
        readPort(port, document.getElementById('consoles').value);
    }
}

// Decoding incoming data
const consoleObject = [
    {
        "name": "nes",
        "length": 9,
        "buttons": [
            {"button": "a", "input": 0},
            {"button": "b", "input": 1},
            {"button": "select", "input": 2},
            {"button": "start", "input": 3},
            {"button": "up", "input": 4},
            {"button": "down", "input": 5},
            {"button": "left", "input": 6},
            {"button": "right", "input": 7}
        ]
    },
    {
        "name": "snes",
        "length": 17,
        "buttons": [
            {"button": "b", "input": 0},
            {"button": "y", "input": 1},
            {"button": "select", "input": 2},
            {"button": "start", "input": 3},
            {"button": "up", "input": 4},
            {"button": "down", "input": 5},
            {"button": "left", "input": 6},
            {"button": "right", "input": 7},
            {"button": "a", "input": 8},
            {"button": "x", "input": 9},
            {"button": "l", "input": 10},
            {"button": "r", "input": 11}
        ]
    },
    {
        "name": "n64",
        "length": 33,
        "buttons": [
            {"button": "a", "input": 0},
            {"button": "b", "input": 1},
            {"button": "z", "input": 2},
            {"button": "start", "input": 3},
            {"button": "up", "input": 4},
            {"button": "down", "input": 5},
            {"button": "left", "input": 6},
            {"button": "right", "input": 7},
            {"button": "l", "input": 10},
            {"button": "r", "input": 11},
            {"button": "cup", "input": 12},
            {"button": "cdown", "input": 13},
            {"button": "cleft", "input": 14},
            {"button": "cright", "input": 15}
        ],
        "sticks": [
            {"stick": "stick", "xinput": 16, "yinput": 24}
        ]
    },
    {
        "name": "gcn",
        "length": 65,
        "buttons": [
            {"button": "start", "input": 3},
            {"button": "y", "input": 4},
            {"button": "x", "input": 5},
            {"button": "b", "input": 6},
            {"button": "a", "input": 7},
            {"button": "l", "input": 9},
            {"button": "r", "input": 10},
            {"button": "z", "input": 11},
            {"button": "up", "input": 12},
            {"button": "down", "input": 13},
            {"button": "right", "input": 14},
            {"button": "left", "input": 15}
        ],
        "sticks": [
            {"stick": "stick", "xinput": 16, "yinput": 24},
            {"stick": "cstick", "xinput": 32, "yinput": 40}
        ]
    },
    {
        "name": "sgb2",
        "length": 17,
        "buttons": [
            {"button": "a", "input": 0},
            {"button": "b", "input": 1},
            {"button": "select", "input": 2},
            {"button": "start", "input": 3},
            {"button": "up", "input": 4},
            {"button": "down", "input": 5},
            {"button": "left", "input": 6},
            {"button": "right", "input": 7}
        ]
    }
];

// Scan for ports with a device plugged in
const scanPorts = () => {
    let PortOptions = new DocumentFragment();
    SerialPort.list().then(ports => {
        ports.forEach(port => {
            if (port.productId != undefined) {
                const PortOptionElement = document.createElement('option')
                PortOptionElement.setAttribute('value', port.path)
                PortOptionElement.innerText = port.path
                PortOptions.appendChild(PortOptionElement)
            }
        });
        document.getElementById("port-select").appendChild(PortOptions)
        document.getElementById("load-console").disabled = document.getElementById("port-select").length === 0;
    });
}

const readPort = (activePort, consoleName) => {
    // Prepare elements based on console.
    const activeConsole = consoleObject.find(obj => obj.name === consoleName);
    const consoleButtons = activeConsole.buttons;
    const consoleSticks = activeConsole.hasOwnProperty('sticks') ? activeConsole.sticks : null;
    if (consoleSticks != null) { consoleSticks.forEach(stick => {
        const el = document.getElementById(stick.stick);
        stick.left = parseInt(el.style.left);
        stick.top = parseInt(el.style.top);
        stick.range = parseInt(skinJson.buttons.find(o => o.name === stick.stick).range);
    })}
    
    // Functions for interpreting analog sticks.
    const isHighBit = bit => bit & 0x0F !== 0;
    const stickRead = bitArray => {
        let val = 0;
        if (consoleName === 'n64') {
            for (let i = 1; i < 8; i++) { if (isHighBit(bitArray[i])) { val |= 1 << (7 - i) } }
            return (isHighBit(bitArray[0]) ? (val - 128) : val) * 0.0078125;
        } else {
            for (let i = 0; i < 8; i++) { if (isHighBit(bitArray[i])) { val |= 1 << (7 - i) } }
            return (val - 128) * 0.0078125;
        }
    };

    // Read data from the port.
    const parser = activePort.pipe(new ByteLength({ length: activeConsole.length }));
    parser.on('data', data => {
        let offset = data.indexOf(10) + 1;
        if (consoleSticks != null) {
            consoleSticks.forEach(stk => {
                let x = stickRead(Array.from({ length: 8 }, (_, i) => data[((stk.xinput + offset) % data.length) + i]));
                let y = stickRead(Array.from({ length: 8 }, (_, i) => data[((stk.yinput + offset) % data.length) + i]));
                let el = document.getElementById(stk.stick);
                el.style.left = ((x * stk.range) + stk.left) + "px";
                el.style.top = (stk.top - (y * stk.range)) + "px";
            });
        }
        consoleButtons.forEach(but => {
            document.getElementById(but.button).style.visibility = data[(but.input + offset) % data.length] === 0 ? "hidden" : "visible";
        });
    })
}
