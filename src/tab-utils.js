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
 * Activates the tab at the index returned by the provided fn.
 * fn is executed with the active tab's index and the number of tabs as args.
 */
var activateNextTab = function (getNextIndex) {
  getCurrentTabs (function (activeTab, tabsList) {
    var nextIndex, tabCount = tabsList.length;

    if (activeTab && tabCount > 1) {
      nextIndex = getNextIndex (activeTab.index, tabsList.length);
      activateTab (tabsList [nextIndex].id);
    }
  });
};

/*
 * Activate the tab on the right of the active tab
 * Activate first tab if active tab is the last tab
 */
var activateRightTab = activateNextTab.bind (null, function (activeIndex, tabCount) {
  return activeIndex === (tabCount - 1) ? 0 : activeIndex + 1;
});

/*
 * Activate the tab on the left of the active tab
 * Activate last tab if active tab is the first tab
 */
var activateLeftTab = activateNextTab.bind (null, function (activeIndex, tabCount) {
  return activeIndex === 0 ? (tabCount - 1) : activeIndex - 1;
});

module.exports = {
  activate: activateTab,
  query: queryTabs,
  getCurrent: getCurrentTabs,
  activateRight: activateRightTab,
  activateLeft: activateLeftTab
};
