const SerialPort = require('serialport');

document.addEventListener("DOMContentLoaded", () => {
    let PortOptions = new DocumentFragment();
    SerialPort.list().then(ports => {
        ports.forEach(port => {
            if (port.productId != undefined) {
                const PortOptionElement = document.createElement('option');
                PortOptionElement.setAttribute('value', port.path);
                PortOptionElement.innerText = port.path;
                PortOptions.appendChild(PortOptionElement);
            }
        })
        document.getElementById("port-select").appendChild(PortOptions);
        if (document.getElementById("port-select").length === 0) {
            document.getElementById("load-buttons").style.display = "none";
            document.getElementById("scan-button").style.display = "blocK";
        }
    });
});