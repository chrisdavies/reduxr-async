'use strict';

import AjaxActions from '../ajax';

describe('ajax-actions', function () {
  it('Invokes ajax for all actions', function () {
    execAction('post', { hi: 'there' });
    execAction('put', { a: 'b' });
    execAction('patch', { a: 'tada' });
    execAction('delete', { id: 2 });
    execAction('get', { id: 1 });
  });

  function mockAjax() {
    let count = 0;
    return args => (++count && { count, args })
  }

  function execAction(name, data) {
    const actions = AjaxActions(mockAjax());
    const action = actions[`${name}Json`]('/baz', data);
    const result = action.execAsync();

    expect(result.count).toBe(1)
    expect(result.args.url).toBe('/baz')
    expect(result.args.method).toBe(name.toUpperCase())
    expect(result.args.data).toBe(data)

    // The action's data is set to the URL for dataless actions
    expect(action.data).toBe(data || '/baz')
  }
});
