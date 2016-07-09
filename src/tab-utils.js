/*
 * Activates the tab that matches the given id
 */
var activateTab = function (id) {
  chrome.tabs.get (id, function (tab) {
    chrome.windows.update (tab.windowId, { focused: true });
    chrome.tabs.update (id, { active: true });
  });
};

/*
 * Queries tabs in the current window
 */
var queryTabs = function (query, callback) {
  query.currentWindow = true;
  chrome.tabs.query (query, callback);
};

/*
 * Executes the provided callback with the active tab and an array of the
 * current window's tabs as arguments
 */
var getCurrentTabs = function (callback) {
  queryTabs ({}, function (_tabs) {
    callback (_tabs.find (function (tab) {
      return tab.active;
    }), _tabs);
  });
};

/*
 * Creates a function that will activate the tab at the index returned by the
 * provided fn.
 * nextIndexFn will receive the active tab's index and the number of tabs as args.
 */
var activateNextTab = function (nextIndexFn) {
  return function () {
    getCurrentTabs (function (activeTab, _tabs) {
      var nextIndex, tabCount = _tabs.length;

      if (activeTab && tabCount > 1) {
        nextIndex = nextIndexFn (activeTab.index, _tabs.length);
        activateTab (_tabs [nextIndex].id);
      }
    });
  };
};

/*
 * Activate the tab on the right of the active tab
 * Activate first tab if active tab is the last tab
 */
var activateRightTab = activateNextTab (function (activeIndex, tabCount) {
  return activeIndex === (tabCount - 1) ? 0 : activeIndex + 1;
});

/*
 * Activate the tab on the left of the active tab
 * Activate last tab if active tab is the first tab
 */
var activateLeftTab = activateNextTab (function (activeIndex, tabCount) {
  return activeIndex === 0 ? (tabCount - 1) : activeIndex - 1;
});

/*
 * Toggles the pinned state of the active tab
 */
var togglePin = function () {
  getCurrentTabs (function (activeTab, _tabs) {
    chrome.tabs.update (activeTab.id, {pinned: !activeTab.pinned});
  })
};


/*
 * Moves the current tab to the next normal window
 */
var toggleWindow = function () {
  chrome.windows.getAll ({
    windowTypes: ["normal"]
  }, function (windows) {
    var nextWinId, activeWinIndex;
    if (windows.length === 1) {
      return;
    }

    activeWinIndex = windows.findIndex (win => win.focused);

    if (activeWinIndex === (windows.length - 1)) {
      nextWinId = windows [0].id;
    } else {
      nextWinId = windows [activeWinIndex + 1].id;
    }

    getCurrentTabs (function (activeTab) {
      chrome.tabs.move (activeTab.id, {
        windowId: nextWinId,
        index: -1
      }, function () {
        activateTab (activeTab.id);
      });
    });
  });
};

/*
 * Moves the current tab to its own window
 */
var newWindow = function () {
  getCurrentTabs (function (activeTab, _tabs) {
    if (_tabs.length === 1) {
      return;
    }

    chrome.windows.create ({
      tabId: activeTab.id
    });
  });
};

module.exports = {
  activate: activateTab,
  query: queryTabs,
  getCurrent: getCurrentTabs,
  activateRight: activateRightTab,
  activateLeft: activateLeftTab,
  togglePin: togglePin,
  toggleWindow: toggleWindow,
  newWindow: newWindow
};
