'use strict';

// Construct the AJAX action helpers using the specified
// ajax implementation (see https://www.npmjs.com/package/alite)
module.exports = function (ajax) {
  function ajaxMethod(method) {
    return ajaxAction(ajax, method);
  }

  return {
    postJson: ajaxMethod('POST'),
    putJson: ajaxMethod('PUT'),
    patchJson: ajaxMethod('PATCH'),
    getJson: ajaxMethod('GET'),
    deleteJson: ajaxMethod('DELETE')
  }
}

function ajaxAction (ajax, method) {
  return function (url, data) {
    return {
      data: data,
      execAsync: function () {
        return ajax({
          url: url,
          data: data,
          method: method,
          headers: {
            Accept: 'application/json'
          }
        })
      }
    }
  }
}
