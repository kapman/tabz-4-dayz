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
          callback (activeTab, tabs, tabs.length - 1);
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

chrome.commands.onCommand.addListener (function (command) {
  console.log ("COMMAND: ", command);
  switch (command) {
    case "left-tab":
      activateLeftTab ();
      break;
    case "right-tab":
      activateRightTab ();
      break;
    default:
      console.log ("INVALID COMMAND");
  };
});
