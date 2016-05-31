var tabs = require ("./tab-utils.js");
var tabHistory = require ("./tab-history.js");
var tabMove = require ("./tab-move.js");

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
    case "move-right":
      tabMove.right ();
      break;
    case "move-left":
      tabMove.left ();
      break;
    case "move-end":
      tabMove.end ();
      break;
    case "move-start":
      tabMove.start ();
      break;
    default:
      console.log ("INVALID COMMAND");
  };
});
