var lastIndex = require ("./utils.js").lastIndex;
var tabs = require ("./tab-utils.js");

var HISTORY_LIMIT = 20;

/*
 * Array of tab ids in order of last visited
 */
var tabHistory = [];

/*
 * Current position in tabHistory
 */
var tabHistoryPos = -1;

/*
 * Adds a tab to the history array. If the history array is full it removes
 * the oldest tab.
 * Note: Assumes that whenever a tab is added, it is active
 */
var addToHistory = function (tabId) {
  if (tabHistory [lastIndex (tabHistory)] !== tabId) {
    tabHistory.push (tabId);

    if (tabHistory.length > HISTORY_LIMIT) {
      tabHistory.shift ();
    } else {
      tabHistoryPos++;
    }
  }
};

/*
 * Flag to indicate the next onActivated event should be ignored because it will
 * not be fired by human interaction
 */
var ignoreActivate = false;

// Add active tab as first in tabHistory
// TODO: This is async, find a way to guarantee this executes first
tabs.query ({active: true}, function (tabs) {
  addToHistory (tabs [0].id);
});

chrome.tabs.onActivated.addListener (function (data) {
  if (ignoreActivate) {
    ignoreActivate = false;
    return;
  }

  if (tabHistoryPos === lastIndex (tabHistory)) {
    // Add tab to tabHistory
    addToHistory (data.tabId);
    // Update tabHistory position
  } else {
    // Replace all tabs after current tab with new tab
    tabHistory.splice (tabHistoryPos + 1, tabHistory.length, data.tabId);
    tabHistoryPos++;
  }
});

chrome.tabs.onRemoved.addListener (function (removedTabId, data) {
  tabHistory = tabHistory.filter (function (tabId) {
    return tabId !== removedTabId;
  });
});

/*
 * Acivates previous tab in tab visit history
 */
var activatePrevTab = function () {
  if (tabHistoryPos !== 0) {
    ignoreActivate = true;
    tabHistoryPos--;
    tabs.activate (tabHistory [tabHistoryPos]);
  }
};

/*
 * Activate next tab in tab visit history
 */
var activateNextTab = function () {
  if (tabHistoryPos !== lastIndex (tabHistory)) {
    ignoreActivate = true;
    tabHistoryPos++;
    tabs.activate (tabHistory [tabHistoryPos]);
  }
};

chrome.commands.onCommand.addListener (function (command) {
  console.log ("COMMAND: ", command);

  switch (command) {
    case "left-tab":
      tabs.activateLeft ();
      break;
    case "right-tab":
      tabs.activateRight ();
      break;
    case "previous-tab":
      activatePrevTab ();
      break;
    case "next-tab":
      activateNextTab ();
      break;
    default:
      console.log ("INVALID COMMAND");
  };
});
