var tabs = require ("./tab-utils.js");

// Creates a function that will move the current tab to a new index
// nextIndex can be either a number or a function that returns a number
var createMoveFn = function (nextIndex) {
  return function () {
    tabs.getCurrent (function (activeTab) {
      var index;
      if (typeof nextIndex === "function") {
        index = nextIndex (activeTab.index);
      } else {
        index = nextIndex;
      }

      chrome.tabs.move (activeTab.id, {index: index});
    });
  }
};

var right = createMoveFn (function (currentIndex) {
  return currentIndex + 1;
});

var left = createMoveFn (function (currentIndex) {
  // Chrome allows negative indices so to avoid moving the tab to the other end
  // the minimum index allowed is 0
  return currentIndex === 0 ? 0 : currentIndex - 1;
});

var start = createMoveFn (0);

var end = createMoveFn (-1);

module.exports = {
  right: right,
  left: left,
  start: start,
  end: end
};
