var tabs = require ("./tab-utils.js");
var tabHistory = require ("./tab-history.js");

chrome.commands.onCommand.addListener (function (command) {
  switch (command) {
    case "activate-left":
      tabs.activateLeft ();
      break;
    case "activate-right":
      tabs.activateRight ();
      break;
    case "activate-previous":
      tabHistory.previous ();
      break;
    case "activate-next":
      tabHistory.next ();
      break;
    default:
      console.log ("INVALID COMMAND");
  };
});
