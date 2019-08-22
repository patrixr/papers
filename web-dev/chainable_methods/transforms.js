const _ = require('lodash');

function annotate(obj) {
  return _.reduce(obj, (res, fn, key) => {
    res[key] = (...params) => {
      const transformation = fn(...params);
      transformation._args = params
      transformation._name = key
      return transformation;
    };
    return res;
  }, {})
}

const TRANSFORMATIONS = annotate({
  setField: (key, val) => {
    return () => ({ [key]: val })
  },

  increment(key) {
    return state => ({ [key]: state[key] + 1 });
  },

  decrement(key) {
    return state => ({ [key]: state[key] - 1 });
  },

  nullify(key) {
    return () => ({ [key]: null });
  },

  updateLoading() {
    return state => ({ loading: state.requestCount > 0 });
  },

  pushItem(item) {
    return {
      to(key) {
        return state => ({ [key]: [ ...state[key], item ]})
      }
    }
  }
});

/**
 * Experimental transformation wrapper with a chainable api
 *
 * e.g Usage
 *  let fn = m.set('users').andThen.increment('userCount')
 *
 *  fn(state, action) => returns the changes to apply to the state
 *
 *
 * @export
 * @param {*} [muts=[]]
 * @returns
 */
function Wrap(muts = []) {
  let transformationWrapper = function (state, action) {
    let changes = {};
    _.map(muts, fn => {
      return fn(state, action)
    })
    .forEach(change => {
      _.extend(changes, change)
    });
    return changes;
  }

  _.each(TRANSFORMATIONS, (mut, key) => {
    transformationWrapper[key] = (...params) => {
      // Build a fresh wrapper with the added transformatiion
      return Wrap([ ...muts, mut(...params) ]);
    }
  });

  transformationWrapper.andThen = transformationWrapper;
  transformationWrapper.and = transformationWrapper;
  transformationWrapper.muts = muts;

  return transformationWrapper;
};

function analyse (transformationWrapper) {
  return transformationWrapper.muts.map((transformation) => {
    return {
      [(transformation._name || '?')]: (transformation._args || [])
    };
  });
}

function exec(state, transformationWrapper) {
  return {
    ...state,
    ...transformationWrapper(state)
  };
};

module.exports = _.reduce(TRANSFORMATIONS, (res, fn, key) => {
  res[key] = (...params) => Wrap([ fn(...params) ]);
  return res;
}, { analyse, exec })
