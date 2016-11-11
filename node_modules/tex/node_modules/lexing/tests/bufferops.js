import assert from 'assert';
import {describe, it} from 'mocha';

import {compare, indexOf, equalTo} from '../buffer';

describe('buffer util', () => {
  describe('#compare', () => {
    var haystack = new Buffer('<< /Name (hello) >>');
    it('should start with <<', () => {
      assert(compare(haystack, new Buffer('<<')));
    });
    it('should not start with "other"', () => {
      assert.strictEqual(compare(haystack, new Buffer('other')), false);
    });
  });

  describe('#indexOf', () => {
    var haystack = new Buffer('<< /Name (hello) >>');
    it('should have hello at index 0', () => {
      assert.strictEqual(indexOf(haystack, new Buffer('hello')), 10);
    });
    it('should not have other at index 0', () => {
      assert.strictEqual(indexOf(haystack, new Buffer('other')), undefined);
    });
  });

  describe('#equalTo', () => {
    var haystack = new Buffer('hello world');
    it('should equal hello at 0:5', () => {
      assert.strictEqual(equalTo(haystack, new Buffer('hello'), 0, 5), true);
    });
    it('should equal he at 0:2', () => {
      assert.strictEqual(equalTo(haystack, new Buffer('he'), 0, 2), true);
    });
    it('should not equal world at index 0:5', () => {
      assert.strictEqual(equalTo(haystack, new Buffer('world'), 0, 5), false);
    });
  });
});
