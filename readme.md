# reduxr-async

Easily and cleanly handle AJAX in Redux.

[![Build Status](https://travis-ci.org/chrisdavies/reduxr-async.svg?branch=master)](https://travis-ci.org/chrisdavies/reduxr-async)

## Middleware

Ajax is a bit tricky with Redux, and there are several solutions already out
there for it. This is the solution we use at Ruzuku.

First, set up the middleware.

```js
// main.js
import { createStore, applyMiddleware } from 'redux';
import reduxAsync from 'reduxr-async/middleware';

const ReduxStore = applyMiddleware(reduxAsync)(createStore);
```

Then, you can create action helpers kinda like this:

```js
import alite from 'alite';
import AjaxActions from 'reduxr-async';

const {postJson} = AjaxActions(alite);

export default {
  sendInvitations: (courseId, emails) =>
    postJson(`/course/${courseId}/invitations`, {emails})
}

```

Now, we could invoke this somewhere in one of our React components like this:

```js
actions.sendInvitations(2, ['joe@example.com', 'shmo@example.com']);
```

If we want to, in our React component, we could even plug into a promise:

```js
startSpinner();

actions.sendInvitations(2, ['joe@example.com', 'shmo@example.com'])
  .then(stopSpinner)
  .catch(stopSpinner);
```

On the reducer side of things, we can handle `sendInvitations` actions as
follows (here, we're using objReducer, but that's not required):

```js
// useless-status-messages-reducer.js
export default objReducer('', {
  sendInvitations_start: (state, {data}) =>
    'Sending invitations to ' + data.emails.join(','),

  sendInvitations_done: (state, {result}) =>
    'Done with ' + result,

  sendInvitations_fail: (state, {err}) =>
    'Failed with ' + err.message,

  sendInvitations_cancel: (state, {data}) =>
    'Canceled the AJAX request'
})
```

The `_cancel` action is useful in long-running activities, such as file uploads
which may be user-cancelable.

`reduxr-async` defines these functions: getJson, putJson, deleteJson, patchJson, postJson. Each has the same signature: `getJson(url, context-or-data)` They take a url and a context of some kind. This context is the data to be sent to the server, or in the case of delete/get it is just a context which you can then refer to in your reducer via `action.data`. The result of a successful ajax call is available in the reducer as `action.result` and if `_fail` happens, the error is available in `action.err`.

## License MIT

Copyright (c) 2015 Chris Davies

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
