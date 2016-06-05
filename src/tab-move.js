var tabs = require ("./tab-utils.js");

/*
 * Creates a function that will move the current tab to a new index.
 * Expects a function that will return the new index. The function will receive
 * the active tab and an array of the tabs in the current window as args.
 */
var createMoveFn = function (newIndexFn) {
  return function () {
    tabs.getCurrent (function (activeTab, _tabs) {
      chrome.tabs.move (activeTab.id, {
        index: newIndexFn (activeTab, _tabs)
      });
    });
  };
};

var right = createMoveFn (function (activeTab) {
  return activeTab.index + 1;
});

var left = createMoveFn (function (activeTab) {
  var currentIndex = activeTab.index;
  // Chrome allows negative indices so to avoid moving the tab to the end the
  // minimum index allowed is 0
  return currentIndex === 0 ? 0 : currentIndex - 1;
});

var start = createMoveFn (function (activeTab, _tabs) {
  if (activeTab.pinned) {
    // If the active tab is pinned then blindly move it to the first index
    return 0;
  } else {
    // If the active tab is unpinned find the first unpinned tab's index
    return _tabs.find (tab => !tab.pinned).index;
  }
});

var end = createMoveFn (function (activeTab, _tabs) {
  if (activeTab.pinned) {
    // If the active tab is pinned find the last pinned tab's index
    return _tabs.filter (tab => tab.pinned).length - 1;
  } else {
    return -1;
  }
});

module.exports = {
  right: right,
  left: left,
  start: start,
  end: end
};
