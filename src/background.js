var tabs = require ("./tab-utils.js");
var tabHistory = require ("./tab-history.js");

chrome.commands.onCommand.addListener (function (command) {
  switch (command) {
    case "left-tab":
      tabs.activateLeft ();
      break;
    case "right-tab":
      tabs.activateRight ();
      break;
    case "previous-tab":
      tabHistory.previous ();
      break;
    case "next-tab":
      tabHistory.next ();
      break;
    default:
      console.log ("INVALID COMMAND");
  };
});
