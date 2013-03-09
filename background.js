function Counter(name, active) {
	this.count = 0;
	this.name = name;
	this.setActive(active);
}
Counter.prototype.setCount = function(count) {
	this.count = count;
	this.updateDisplay();
};
Counter.prototype.getCount = function(count) {
	return this.count;
};
Counter.prototype.increment = function() {
	this.setCount(this.count+1);
};
Counter.prototype.decrement = function() {
	this.setCount(this.count-1);
};
Counter.prototype.setActive = function(active) {
	this.active = !!active;
	this.updateDisplay();
}
Counter.prototype.updateDisplay = function() {
	if(this.active) {
		chrome.browserAction.setBadgeText({text: String(this.count)});
		chrome.browserAction.setTitle({title: this.name});
	}
};
function TabCounter(active) {
	Counter.call(this,"Tabs",active);
	var self = this;
	chrome.tabs.query({}, function(tabs) {
		self.setCount(tabs.length);	
	});
	chrome.tabs.onCreated.addListener(self.increment.bind(self));
	chrome.tabs.onRemoved.addListener(self.decrement.bind(self));
}
TabCounter.prototype = new Counter();

function WindowCounter(active) {
	Counter.call(this,"Windows",active);
	var self = this;
	chrome.windows.getAll(function(windows) {
		self.setCount(windows.length);	
	});
	chrome.windows.onCreated.addListener(self.increment.bind(self));
	chrome.windows.onRemoved.addListener(self.decrement.bind(self));
}
WindowCounter.prototype = new Counter();

var counters = [
	new TabCounter(true),
	new WindowCounter()
];

chrome.browserAction.onClicked.addListener(function() {
	var i;
	for(i =0; i < counters.length; ++i) {
		if(counters[i].active) {
			counters[i].setActive(false);
			break;
		}
	}
	var enableIndex = (i+1)%counters.length;
	counters[enableIndex].setActive(true);
});
