'use strict';

import reduxAsync from '../middleware';

describe('redux-async middleware', function () {
  it('Passes non async actions through', function () {
    const invokeAsync = reduxAsync({})(obj => obj);
    const action = { a: '1' };
    const result = invokeAsync(action);
    expect(action).toEqual(result);
  });

  it('Invokes async actions', function (done) {
    let count = 0;
    testAsync({
      dispatch: function (action) {
        expect(action.type).toEqual('test_done');
        expect(action.result.ok).toEqual('good');
        ++count;
      }
    }).then(() => {
      expect(count).toEqual(1);
      done();
    })
  });

  it('Handles async errors', function (done) {
    let count = 0;
    testAsync({
      dispatch: function (action) {
        expect(action.type).toEqual('test_fail');
        expect(action.err).toEqual({message: 'Doh!'});
        expect(action.a).toEqual('1')
        ++count;
      }
    }, 'Doh!').catch(() => {
      setTimeout(function () {
        expect(count).toEqual(1);
        done();
      }, 1);
    })
  });

  function testAsync(store, err) {
    const action = {
      execAsync: mockAsync(err),
      a: '1',
      type: 'test'
    };

    const invokeAsync = reduxAsync(store)(obj => obj);

    const result = invokeAsync(action);

    expect(result).toEqual({
      type: 'test_start',
      a: '1',
      then: result.then,
      catch: result.catch
    });

    return result;
  }

  function mockAsync(err) {
    return () => new Promise(function (resolve, reject) {
      if (err) {
        reject(err);
      } else {
        resolve({ ok: 'good' });
      }
    });
  }
});
