'use strict';

var mix = require('reduxr-mix');

// Redux middleware to systematically execute async actions.
// The action is expected to have an 'execAsync' method. (see ajax.js)
// The action then gets transformed into the action's type with
// these suffixes:
// _start
// _done
// _fail
// _cancel

function isAsync (action) {
  return !!action.execAsync;
}

// Handle errors as returned from Rails JSON
function railsError (err) {
  var key = Object.keys(err)[0] || '';
  var messages = err[key] || '';
  var message = typeof messages === 'string' ? messages : messages[0];

  return {
    message: message || 'An error occurred while processing your request'
  }
}

function remoteError(err) {
  try {
    if (typeof err === 'string') {
      return {message: err}
    } else if (err.message) {
      return err;
    } else if (err.responseText) {
      return JSON.parse(err.responseText);
    } else {
      return railsError(err);
    }
  } catch (ex) {
    return err.responseText || err;
  }
}

function dispatchAsync(store, action) {
  var dispatch = store.dispatch;
  var type = action.type;
  var execAsync = action.execAsync;
  var original = mix({}, action);
  delete original.execAsync;

  function dispatchDone(obj) {
    return dispatch(mix(original, {
      result: obj,
      type: type + '_done'
    }))
  }

  function dispatchErr(err) {
    return dispatch(mix(original, {
      err: remoteError(err),
      type: type + '_fail'
    }))
  }

  function dispatchCancel(err) {
    return dispatch(mix(original, {
      type: type + '_cancel'
    }))
  }

  var promise = execAsync(dispatch, type);

  promise
    .then(dispatchDone)
    .catch(function (err) {
      return err.readyState === 0 ? dispatchCancel() : dispatchErr(err)
    });

  return mix(original, {
    then: function (fn) { return promise.then(fn) },
    catch: function (fn) { return promise.catch(fn) },
    type: type + '_start'
  })
}

// The Redux middleware stack is a triple-nested function
module.exports = function (store) {
  return function (next) {
    return function (action) {
      return next(isAsync(action) ? dispatchAsync(store, action) : action);
    }
  }
}
