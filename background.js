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
        title = mode;

    if(mode !== "Windows") {
        text += counters.Tabs.count;
    }
    if(mode === "Both") {
        text += "/";
        title = "Tabs over Windows";
    }
    if(mode !== "Tabs") {
        text += counters.Windows.count;
    }
    chrome.browserAction.setBadgeText({text: text});
    chrome.browserAction.setTitle({title: title});
}

const counters = {
    "Tabs": new TabCounter(onUpdate),
    "Windows": new WindowCounter(onUpdate)
}
const modes = Object.keys(counters).concat(["Both"]);
var mode = modes[0];


chrome.browserAction.onClicked.addListener(function() {
	const nextIndex = (modes.indexOf(mode)+1)%modes.length;
    mode = modes[nextIndex];
	onUpdate();
});
onUpdate();
