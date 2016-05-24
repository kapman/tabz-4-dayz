/*
 * Returns the index the last item in the given array
 */
var lastIndex = function (arr) {
  return arr.length - 1;
};

/**
 * find element in Array 'arr'.
 * a function 'callback' should be provided which returns true when an element
 * is matched.
 * the first element for which callback returns true is returned.
 * returns undefined if no match is found.
 * It will use browser's Array.prototype.find method if it is supported.
 * If context is passed, the callback is bound to that context.
 */
var _find = Array.prototype.find;
var find = function (arr, callback, context) {
  // bind to context if provided
  if (context) {
    return _find.call (arr, callback.bind (context));
  }
  return _find.call (arr, callback);
};

/**
 * lookup an object in Array 'arr' for which value of property 'prop'
 * equals 'value'.
 * returns undefined if there is no match.
 */
var findObjectByKey = function (arr, value, prop) {
  return find (arr, function (item) {
    return (item [prop] === value);
  });
};

module.exports = {
  lastIndex: lastIndex,
  findObjectByKey: findObjectByKey
};
