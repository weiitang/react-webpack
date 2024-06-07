import { createArray } from '../array';

describe('functions/array', () => {
  test('createArray', () => {
    expect(createArray(1, 5)).toEqual([1, 1, 1, 1, 1]);
  });
});
