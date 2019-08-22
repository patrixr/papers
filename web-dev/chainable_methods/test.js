const _ = require('lodash');
const { setField } = require('./transforms');
const { expect, should } = require('chai');

should();

describe('Transforms', () => {

  it('should a create a change record for a single mutation', (done) => {
    const transform = setField('foo', 'bar');

    const change = transform({});
    expect(_.keys(change)).to.deep.equal(['foo']);
    expect(change['foo']).to.equal('bar');
    done();
  });

  it('should a create a change record for chain of mutations', (done) => {
    const transform = setField('foo', 'bar')
      .andThen.increment('num')
      .andThen.nullify('xyz');

    const change = transform({ num: 33 });
    expect(_.keys(change)).to.deep.equal(['foo', 'num', 'xyz']);
    expect(change['foo']).to.equal('bar');
    expect(change['num']).to.equal(34);
    expect(change['xyz']).to.equal(null);
    done();
  });

  it('applies the transformations in the correct order', (done) => {
    const transform = setField('foo', 'bar')
      .andThen.increment('num')
      .andThen.nullify('num');

    const change = transform({ num: 33 });
    expect(_.keys(change)).to.deep.equal(['foo', 'num']);
    expect(change['foo']).to.equal('bar');
    expect(change['num']).to.equal(null);
    done();
  });

  it('should enumerate applied mutations', () => {
    const transform = setField('foo', 'bar')
      .andThen.increment('num')
      .andThen.nullify('num');

    const { analyse } = require('./transforms');

    analyse(transform).should.deep.equal([
      { setField:  ['foo', 'bar'] },
      { increment: ['num']},
      { nullify: ['num'] }
    ]);
  });

  it('returns a new state with the exec method', () => {
    const transform = setField('foo', 'bar')
      .andThen.increment('num')
      .andThen.nullify('xyz');

    const { exec } = require('./transforms');

    const state = exec({ num: 88, be: 'free', foo: 'bra' }, transform);

    expect(state).to.deep.equal({
      num: 89,
      be: 'free',
      foo: 'bar',
      xyz: null
    });
  });
});
