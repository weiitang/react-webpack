/**
 * @param {...function} fns
 * @returns {function}
 * @example const pipe = pipe_(
 *   x => x + 1,
 *   x => x - 1,
 *   x => x * x,
 *   x => x / x,
 * )
 *
 * const y = pipe(10) // 10
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function pipe_(...fns) {
  const funcs = fns.filter((fn) => typeof fn === 'function');
  return function (arg) {
    return funcs.reduce((res, fn) => fn.call(this, res), arg);
  };
}
