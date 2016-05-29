var utils = require ("./utils.js");
var tabs = require ("./tab-utils.js");
var lastIndex = utils.lastIndex;

var log = function () {
  chrome.tabs.query ({}, function (_tabs) {
    console.log (tabHistory.map (function (tabId, i) {
      var t = utils.findObjectByKey (_tabs, tabId, "id");
      if (!t) {
        console.log ("Missing tabId", tabId);
      }
      var str = tabId + (t ? t.title.split (" ") [0] : "MISSING");
      if (currentIndex === i) {
        str = "--" + str + "--"
      }
      return str;
    }));
  });
};

/*
 * Maximum number of tab visits that are recorded
 */
var HISTORY_LIMIT = 10;
/*
 * Array of tab ids in order of last visited
 */
var tabHistory = [];
/*
 * Current position in tabHistory
 */
var currentIndex = -1;
/*
 * Counter for the number of times the call to the add function should be ignored
 * because it is being called due to an event that is being triggered by the
 * extension itself (like onFocusChanged when navigating history).
 * Using a counter instead of a boolean flag because of race conditions when
 * continuously pressing and holding shortcuts.
 */
var ignoreCount = 0;

/*
 * Adds a tab to the history array. If the history array is full it removes
 * the oldest tab.
 */
var add = function (tabId) {
  if (ignoreCount > 0) {
    ignoreCount--;
    return;
  }

  if (currentIndex === lastIndex (tabHistory)) {
    // If a user visits a tab when they're at the end of their tab history
    if (tabHistory [lastIndex (tabHistory)] === tabId) {
      return;
    }

    tabHistory.push (tabId);
  } else {
    // If a user visits a tab when they're in the middle of cycling through
    // their tab history
    tabHistory.splice (currentIndex + 1, tabHistory.length, tabId);
  }

  if (tabHistory.length >= HISTORY_LIMIT) {
    tabHistory.shift ();
  } else {
    // Tabs are only added when they are active so just increase the index
    currentIndex++
  }
};

var remove = function (removedTabId) {
  var newLength, oldLength = tabHistory.length;
  var currentTabRemoved = removedTabId === tabHistory [currentIndex];

  tabHistory = tabHistory.filter (function (tabId) {
    return tabId !== removedTabId;
  }).filter (function (tabId, i, tabHistory) {
    // Make sure there are no contiguous tabs in history
    return tabHistory [i + 1] !== tabId;
  });

  newLength = tabHistory.length;
  currentIndex -= oldLength - newLength;
};

/*
 * Acivates previous tab in tab visit history
 */
var activatePrevTab = function () {
  if (currentIndex !== 0) {
    ignoreCount++;
    currentIndex--;
    tabs.activate (tabHistory [currentIndex]);
  }
};

/*
 * Activate next tab in tab visit history
 */
var activateNextTab = function () {
  if (currentIndex !== lastIndex (tabHistory)) {
    ignoreCount++;
    currentIndex++;
    tabs.activate (tabHistory [currentIndex]);
  }
};

// Add active tab as first in tabHistory
tabs.getCurrent (function (tab) {
  add (tab.id);
});

// Add tabs to history whenever they are activated
chrome.tabs.onActivated.addListener (function (data) {
  add (data.tabId);
});

// Remove all occurences of a tab in the history when it is removed
chrome.tabs.onRemoved.addListener (function (removedTabId) {
  remove (removedTabId);
});

// Chrome tries to speed things up by prerendering a tab that it thinks the user
// will visit. When it is correct it replaces the tab with the prerendered one.
// This keeps tabHistory updated when this happens.
chrome.tabs.onReplaced.addListener (function (newTabId, replacedTabId) {
   remove (replacedTabId);
});

// Add tab to visit history when switching windows
// tabs.onActivated does not fire when toggling through windows
chrome.windows.onFocusChanged.addListener (function () {
  tabs.getCurrent (function (activeTab) {
    if (activeTab) {
      add (activeTab.id);
    }
  });
});

module.exports = {
  next: activateNextTab,
  previous: activatePrevTab
};
