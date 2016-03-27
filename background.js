var HISTORY_LIMIT = 20;

/*
 * Merges two objects by mutating obj1
 */
var merge = function (obj1, obj2) {
  for (var key in obj2) {
    obj1 [key] = obj2 [key];
  }

  return obj1;
};

/*
 * Returns the index the last item in the given array
 */
var lastIndex = function (arr) {
  return arr.length - 1;
};

/*
 * Only queries for tabs in current window
 */
var queryTabs = function (query, callback) {
  chrome.tabs.query (merge (query, {currentWindow: true}), callback);
};

/*
 *  Returns a function that will call the calback with
 * - active tab
 * - tabs array
 * - index of the last tab
 */
var getTabsAnd = function (callback) {
  return function () {
    queryTabs ({active: true}, function (_tabs) {
      var activeTab = _tabs [0];
      if (activeTab) {
        queryTabs ({}, function (tabs) {
          callback (activeTab, tabs, lastIndex (tabs));
        });
      } else {
        callback ();
      }
    });
  };
};

var activateTab = function (id) {
  chrome.tabs.update (id, { active: true });
};

/*
 * Acivates tab on the right of the current tab
 */
var activateRightTab = getTabsAnd (function (activeTab, tabs, lastIndex) {
  var index, leftIndex;
  if (activeTab) {
    index = activeTab.index;
    leftIndex = index === lastIndex ? 0 : index + 1;

    activateTab (tabs [leftIndex].id);
  }
});

/*
 * Acivates tab on the left of the current tab
 */
var activateLeftTab = getTabsAnd (function (activeTab, tabs, lastIndex) {
  var index, leftIndex;

  if (activeTab) {
    index = activeTab.index;
    leftIndex = index === 0 ? lastIndex : index - 1;

    activateTab (tabs [leftIndex].id);
  }
});

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
queryTabs ({active: true}, function (tabs) {
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
    activateTab (tabHistory [tabHistoryPos]);
  }
};

/*
 * Activate next tab in tab visit history
 */
var activateNextTab = function () {
  if (tabHistoryPos !== lastIndex (tabHistory)) {
    ignoreActivate = true;
    tabHistoryPos++;
    activateTab (tabHistory [tabHistoryPos]);
  }
};

chrome.commands.onCommand.addListener (function (command) {
  console.log ("COMMAND: ", command);

  switch (command) {
    case "left-tab":
      activateLeftTab ();
      break;
    case "right-tab":
      activateRightTab ();
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
