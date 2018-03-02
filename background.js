"use strict";

function Counter(name, listener) {
    this.count = 0;
    this.name = name;
    this.listener = listener;
}
Counter.prototype.setCount = function(count) {
    this.count = count;
    this.listener(this);
};
Counter.prototype.increment = function() {
    this.setCount(this.count+1);
};
Counter.prototype.decrement = function() {
    this.setCount(this.count-1);
};
function TabCounter(listener) {
    Counter.call(this,"Tabs",listener);
    var self = this;
    chrome.tabs.query({}, function(tabs) {
        self.setCount(tabs.length);
    });
    chrome.tabs.onCreated.addListener(self.increment.bind(self));
    chrome.tabs.onRemoved.addListener(self.decrement.bind(self));
}
TabCounter.prototype = new Counter();

function WindowCounter(listener) {
    Counter.call(this,"Windows",listener);
    var self = this;
    chrome.windows.getAll(function(windows) {
        self.setCount(windows.length);
    });
    chrome.windows.onCreated.addListener(self.increment.bind(self));
    chrome.windows.onRemoved.addListener(self.decrement.bind(self));
}
WindowCounter.prototype = new Counter();


function onUpdate() {
    var text = "",
        title = mode,
        count = 0,
        backgroundColor = null,
        fontColor = null;

    if(mode !== "Windows") {
        text += counters.Tabs.count;
        count = counters.Tabs.count;
    }
    if(mode === "Both") {
        text += "/";
        title = "Tabs over Windows";
    }
    if(mode !== "Tabs") {
        text += counters.Windows.count;
        count = counters.Windows.count;
    }

    count = count <= 40 ? count : 40;
    backgroundColor = heatMapColorforValue(count / 40.0);
    fontColor = contrastColor(...backgroundColor);

    draw({backgroundColor: backgroundColor, fontColor: fontColor, text: text});
    chrome.browserAction.setTitle({title: title});
}

function heatMapColorforValue(value) {
    var h = ((1.0 - value) * 240.0) / 355.0
    return hslToRgb(h, 1, 0.5);
}

function hslToRgb(h, s, l){
    var r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = function (p, q, t) {
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

const contrastColor = (r, g, b) => {
    const a = 1 - ( 0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
    return a < 0.5 ? [0, 0, 0] : [255, 255, 255];
};

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function draw(obj) {
    var canvas = document.createElement('canvas');
    canvas.width = 19;
    canvas.height = 19;

    var context = canvas.getContext('2d');
    context.fillStyle = rgbToHex(...obj.backgroundColor);
    context.fillRect(0, 0, 19, 19);

    context.fillStyle = rgbToHex(...obj.fontColor);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "bold 11px Arial";
    context.fillText(obj.text, 9, 9);

    chrome.browserAction.setIcon({
      imageData: context.getImageData(0, 0, 19, 19)
    });
  }

const counters = {
    "Tabs": new TabCounter(onUpdate),
    "Windows": new WindowCounter(onUpdate)
}
const modes = Object.keys(counters).concat(["Both"]);
var mode = modes[0];


chrome.browserAction.onClicked.addListener(function() {
    const nextIndex = (modes.indexOf(mode) + 1) % modes.length;
    mode = modes[nextIndex];
    onUpdate();
});

onUpdate();
